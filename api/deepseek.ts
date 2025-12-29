import { checkRateLimit, getClientIdentifier } from './rateLimit';

export default async function handler(req, res) {
  const ANTHROPIC_API_URL = 'https://eva-mj6ah3dq-eastus2.services.ai.azure.com/anthropic/v1/messages';

  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  // Rate limiting: 10 requests per minute per IP
  const clientId = getClientIdentifier(req);
  const rateLimit = checkRateLimit(clientId, {
    limit: 10,
    window: 60000 // 1 minute
  });

  if (!rateLimit.allowed) {
    res.setHeader('X-RateLimit-Limit', '10');
    res.setHeader('X-RateLimit-Remaining', '0');
    res.setHeader('X-RateLimit-Reset', new Date(rateLimit.resetAt).toISOString());
    res.status(429).json({ 
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
    });
    return;
  }

  res.setHeader('X-RateLimit-Limit', '10');
  res.setHeader('X-RateLimit-Remaining', rateLimit.remaining.toString());
  res.setHeader('X-RateLimit-Reset', new Date(rateLimit.resetAt).toISOString());

  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.API_KEY;

  if (!apiKey) {
    res.status(500).json({ error: 'Anthropic API key is not configured on the server.' });
    return;
  }

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    
    if (!response.ok) {
       res.status(response.status).json(data);
       return;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Anthropic Proxy Error:', error);
    res.status(500).json({ error: 'Failed to communicate with Anthropic API' });
  }
}
