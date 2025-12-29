import { checkRateLimit, getClientIdentifier } from './rateLimit';

type ValidationResult = {
  url: string;
  ok: boolean;
  status: number | null;
  finalUrl?: string;
  reason?: string;
};

const withTimeout = async <T,>(promise: Promise<T>, ms: number) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    // @ts-expect-error - signal is supported by fetch
    return await promise(controller.signal);
  } finally {
    clearTimeout(id);
  }
};

const isHttpUrl = (raw: string) => {
  try {
    const u = new URL(raw);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

const validateOne = async (url: string): Promise<ValidationResult> => {
  if (!isHttpUrl(url)) {
    return { url, ok: false, status: null, reason: 'not_http_url' };
  }

  const fetchHead = async (signal: AbortSignal) => {
    return fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal,
      headers: {
        'User-Agent': 'ContentFactoryLinkValidator/1.0'
      }
    });
  };

  const fetchGet = async (signal: AbortSignal) => {
    return fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal,
      headers: {
        'User-Agent': 'ContentFactoryLinkValidator/1.0',
        Range: 'bytes=0-2048'
      }
    });
  };

  try {
    let resp: Response | null = null;
    try {
      resp = await withTimeout(fetchHead as any, 4500);
      // Some origins return 405 for HEAD, fall back to GET
      if (resp.status === 405 || resp.status === 501) {
        resp = null;
      }
    } catch {
      resp = null;
    }

    if (!resp) {
      resp = await withTimeout(fetchGet as any, 4500);
    }

    const status = resp.status;
    const finalUrl = resp.url || undefined;

    // Conservative rule:
    // - 404/410 => definitely invalid
    // - network error => invalid
    // - 2xx/3xx => valid
    // - 401/403 => treat as valid-but-restricted (real page, blocked)
    // - 5xx => unknown; treat as invalid to avoid hallucinated sources
    const ok =
      (status >= 200 && status < 400) ||
      status === 401 ||
      status === 403;

    if (!ok) {
      const reason = status === 404 || status === 410 ? 'not_found' : status >= 500 ? 'server_error' : 'not_ok';
      return { url, ok: false, status, finalUrl, reason };
    }

    return { url, ok: true, status, finalUrl };
  } catch (err: any) {
    return { url, ok: false, status: null, reason: 'network_error' };
  }
};

const uniq = (arr: string[]) => Array.from(new Set(arr));

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  // Rate limiting: 30 requests per minute per IP (more lenient for validation)
  const clientId = getClientIdentifier(req);
  const rateLimit = checkRateLimit(`validate:${clientId}`, {
    limit: 30,
    window: 60000 // 1 minute
  });

  if (!rateLimit.allowed) {
    res.setHeader('X-RateLimit-Limit', '30');
    res.setHeader('X-RateLimit-Remaining', '0');
    res.setHeader('X-RateLimit-Reset', new Date(rateLimit.resetAt).toISOString());
    res.status(429).json({ 
      error: 'Too many validation requests. Please try again later.',
      retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
    });
    return;
  }

  res.setHeader('X-RateLimit-Limit', '30');
  res.setHeader('X-RateLimit-Remaining', rateLimit.remaining.toString());
  res.setHeader('X-RateLimit-Reset', new Date(rateLimit.resetAt).toISOString());

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const urls = Array.isArray(body.urls) ? (body.urls as unknown[]).filter((u) => typeof u === 'string') as string[] : [];

  const normalized = uniq(urls.map((u) => u.trim()).filter(Boolean)).slice(0, 20);

  const results: ValidationResult[] = [];
  for (const url of normalized) {
    // sequential to avoid accidental DDoS / rate limits
    // eslint-disable-next-line no-await-in-loop
    results.push(await validateOne(url));
  }

  const valid = results.filter((r) => r.ok).map((r) => r.url);
  const invalid = results.filter((r) => !r.ok).map((r) => r.url);

  res.status(200).json({
    valid,
    invalid,
    results
  });
}
