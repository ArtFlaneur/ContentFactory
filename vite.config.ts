import path from 'path';
import type { IncomingMessage, ServerResponse } from 'http';
import { defineConfig, loadEnv, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

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
      res.end(JSON.stringify({ error: 'DeepSeek API key is not configured on the dev server.' }));
      return;
    }

    try {
      const body = await readRequestBody(req);
      const upstream = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body
      });

      const responseBody = await upstream.text();
      res.statusCode = upstream.status;
      const contentType = upstream.headers.get('content-type') ?? 'application/json';
      res.setHeader('Content-Type', contentType);
      res.end(responseBody);
    } catch (error) {
      console.error('DeepSeek proxy error:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'DeepSeek proxy request failed. Check server logs for details.' }));
    }
  };
};

const attachProxy = (target: MiddlewareContainer, middleware: MiddlewareHandler) => {
  target.middlewares.use('/api/deepseek', middleware);
};

const deepseekProxyPlugin = (apiKey: string): PluginOption => {
  const middleware = createDeepseekMiddleware(apiKey);
  return {
    name: 'deepseek-proxy',
    configureServer(server) {
      attachProxy(server, middleware);
    },
    configurePreviewServer(server) {
      attachProxy(server, middleware);
    }
  };
};

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const deepseekKey = env.DEEPSEEK_API_KEY || env.VITE_DEEPSEEK_API_KEY || '';
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), deepseekProxyPlugin(deepseekKey)],
      define: {
        __HAS_DEEPSEEK_KEY__: JSON.stringify(Boolean(deepseekKey))
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
