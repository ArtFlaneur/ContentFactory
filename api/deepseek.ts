
export default async function handler(req, res) {
  const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

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

  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.API_KEY;

  if (!apiKey) {
    res.status(500).json({ error: 'DeepSeek API key is not configured on the server.' });
    return;
  }

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
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
    console.error('DeepSeek Proxy Error:', error);
    res.status(500).json({ error: 'Failed to communicate with DeepSeek API' });
  }
}
