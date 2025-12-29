import path from 'path';
import type { IncomingMessage, ServerResponse } from 'http';
import { defineConfig, loadEnv, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';

const ANTHROPIC_API_URL = 'https://eva-mj6ah3dq-eastus2.services.ai.azure.com/anthropic/v1/messages';

type NextFunction = (err?: unknown) => void;
type MiddlewareHandler = (req: IncomingMessage, res: ServerResponse, next: NextFunction) => void;
type MiddlewareContainer = { middlewares: { use: (path: string, handler: MiddlewareHandler) => void } };

const readRequestBody = (req: IncomingMessage): Promise<string> => {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
};

const createDeepseekMiddleware = (apiKey: string): MiddlewareHandler => {
  return async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Method not allowed. Use POST.' }));
      return;
    }

    if (!apiKey) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Anthropic API key is not configured on the dev server.' }));
      return;
    }

    try {
      const body = await readRequestBody(req);
      
      // Log request details for debugging
      console.log('[Anthropic Proxy] Request received');
      console.log('[Anthropic Proxy] Request body length:', body.length);
      
      const upstream = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body
      });

      const responseBody = await upstream.text();
      
      // Log response for debugging
      console.log('[Anthropic Proxy] Response status:', upstream.status);
      if (!upstream.ok) {
        console.error('[Anthropic Proxy] Error response:', responseBody);
      }
      
      res.statusCode = upstream.status;
      const contentType = upstream.headers.get('content-type') ?? 'application/json';
      res.setHeader('Content-Type', contentType);
      res.end(responseBody);
    } catch (error) {
      console.error('[Anthropic Proxy] Fatal error:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Anthropic proxy request failed. Check server logs for details.' }));
    }
  };
};

const createValidateMiddleware = (): MiddlewareHandler => {
  const isHttpUrl = (raw: string) => {
    try {
      const u = new URL(raw);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const validateOne = async (url: string) => {
    if (!isHttpUrl(url)) return { url, ok: false, status: null, reason: 'not_http_url' };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    try {
      let resp: Response | null = null;
      try {
        resp = await fetch(url, {
          method: 'HEAD',
          redirect: 'follow',
          signal: controller.signal,
          headers: { 'User-Agent': 'ContentFactoryLinkValidator/1.0' }
        });
        if (resp.status === 405 || resp.status === 501) resp = null;
      } catch {
        resp = null;
      }

      if (!resp) {
        resp = await fetch(url, {
          method: 'GET',
          redirect: 'follow',
          signal: controller.signal,
          headers: {
            'User-Agent': 'ContentFactoryLinkValidator/1.0',
            Range: 'bytes=0-2048'
          }
        });
      }

      const status = resp.status;
      const finalUrl = resp.url || undefined;
      const ok = (status >= 200 && status < 400) || status === 401 || status === 403;
      if (!ok) {
        const reason = status === 404 || status === 410 ? 'not_found' : status >= 500 ? 'server_error' : 'not_ok';
        return { url, ok: false, status, finalUrl, reason };
      }
      return { url, ok: true, status, finalUrl };
    } catch {
      return { url, ok: false, status: null, reason: 'network_error' };
    } finally {
      clearTimeout(timeoutId);
    }
  };

  return async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Method not allowed. Use POST.' }));
      return;
    }

    try {
      const raw = await readRequestBody(req);
      const parsed = raw ? JSON.parse(raw) : {};
      const urls = Array.isArray((parsed as any).urls)
        ? ((parsed as any).urls as unknown[]).filter((u): u is string => typeof u === 'string')
        : [];
      const normalized = Array.from(new Set(urls.map((u) => u.trim()).filter(Boolean))).slice(0, 20);

      const results: any[] = [];
      for (const url of normalized) {
        // eslint-disable-next-line no-await-in-loop
        results.push(await validateOne(url));
      }
      const valid = results.filter((r) => r.ok).map((r) => r.url);
      const invalid = results.filter((r) => !r.ok).map((r) => r.url);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ valid, invalid, results }));
    } catch (error) {
      console.error('Validate proxy error:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Validation failed. Check server logs.' }));
    }
  };
};

const attachProxy = (target: MiddlewareContainer, middleware: MiddlewareHandler) => {
  target.middlewares.use('/api/deepseek', middleware);
};

const attachValidate = (target: MiddlewareContainer, middleware: MiddlewareHandler) => {
  target.middlewares.use('/api/validate', middleware);
};

const deepseekProxyPlugin = (apiKey: string): PluginOption => {
  const middleware = createDeepseekMiddleware(apiKey);
  const validateMiddleware = createValidateMiddleware();
  return {
    name: 'deepseek-proxy',
    configureServer(server) {
      attachProxy(server, middleware);
      attachValidate(server, validateMiddleware);
    },
    configurePreviewServer(server) {
      attachProxy(server, middleware);
      attachValidate(server, validateMiddleware);
    }
  };
};

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const anthropicKey = env.ANTHROPIC_API_KEY || env.VITE_ANTHROPIC_API_KEY || '';
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), deepseekProxyPlugin(anthropicKey)],
      define: {
        __HAS_DEEPSEEK_KEY__: JSON.stringify(Boolean(anthropicKey))
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
