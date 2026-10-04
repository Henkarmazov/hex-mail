import type { Connect } from 'vite';
import { proxyToUpstream, CORS_HEADERS } from './api/_helper.ts';

export function viteApiMiddleware(): Connect.NextHandleFunction {
  return async (req, res, next) => {
    const url = req.url || '';
    if (!url.startsWith('/api/')) {
      return next();
    }

    // Set CORS headers
    Object.entries(CORS_HEADERS).forEach(([k, v]) => {
      res.setHeader(k, v);
    });

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    try {
      const parsedUrl = new URL(url, 'http://localhost:3000');
      const pathname = parsedUrl.pathname;
      const searchParams = parsedUrl.searchParams;

      // 1. GET /api/generate
      if (pathname === '/api/generate') {
        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: false, error: 'Method Not Allowed' }));
          return;
        }

        const params = new URLSearchParams();
        const username = searchParams.get('username');
        const domain = searchParams.get('domain');
        if (username) params.set('username', username);
        if (domain) params.set('domain', domain);

        const qs = params.toString() ? `?${params.toString()}` : '';
        const { status, data } = await proxyToUpstream(`/api/generate${qs}`, 'GET');
        res.statusCode = status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
        return;
      }

      // 2. GET /api/inbox
      if (pathname === '/api/inbox') {
        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: false, error: 'Method Not Allowed' }));
          return;
        }

        const email = searchParams.get('email');
        if (!email) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: false, error: 'Email parameter is required' }));
          return;
        }

        const params = new URLSearchParams({ email });
        const { status, data } = await proxyToUpstream(`/api/inbox?${params.toString()}`, 'GET');
        res.statusCode = status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
        return;
      }

      // 3. GET /api/read
      if (pathname === '/api/read') {
        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: false, error: 'Method Not Allowed' }));
          return;
        }

        const email = searchParams.get('email');
        const mail_id = searchParams.get('mail_id');
        if (!email || !mail_id) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: false, error: 'email and mail_id are required' }));
          return;
        }

        const params = new URLSearchParams({ email, mail_id });
        const { status, data } = await proxyToUpstream(`/api/read?${params.toString()}`, 'GET');
        res.statusCode = status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
        return;
      }

      // 4. GET /api/poll
      if (pathname === '/api/poll') {
        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: false, error: 'Method Not Allowed' }));
          return;
        }

        const email = searchParams.get('email');
        if (!email) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: false, error: 'Email parameter is required' }));
          return;
        }

        const params = new URLSearchParams({ email });
        const { status, data } = await proxyToUpstream(`/api/poll?${params.toString()}`, 'GET');
        res.statusCode = status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
        return;
      }

      // 5. DELETE /api/delete
      if (pathname === '/api/delete') {
        if (req.method !== 'DELETE' && req.method !== 'GET') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: false, error: 'Method Not Allowed' }));
          return;
        }

        const email = searchParams.get('email');
        const mail_id = searchParams.get('mail_id');
        if (!email || !mail_id) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: false, error: 'email and mail_id are required' }));
          return;
        }

        const params = new URLSearchParams({ email, mail_id });
        const { status, data } = await proxyToUpstream(`/api/delete?${params.toString()}`, 'DELETE');
        res.statusCode = status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
        return;
      }

      // 6. DELETE /api/destroy
      if (pathname === '/api/destroy') {
        if (req.method !== 'DELETE' && req.method !== 'GET') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: false, error: 'Method Not Allowed' }));
          return;
        }

        const email = searchParams.get('email');
        if (!email) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: false, error: 'Email parameter is required' }));
          return;
        }

        const params = new URLSearchParams({ email });
        const { status, data } = await proxyToUpstream(`/api/destroy?${params.toString()}`, 'DELETE');
        res.statusCode = status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
        return;
      }

      // 7. GET /api/domains
      if (pathname === '/api/domains') {
        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: false, error: 'Method Not Allowed' }));
          return;
        }

        const { status, data } = await proxyToUpstream('/api/domains', 'GET');
        res.statusCode = status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
        return;
      }

      // Route not recognized under /api/
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ status: false, error: 'Not Found' }));
    } catch (err: unknown) {
      const error = err as Error;
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ status: false, error: error.message || 'Internal Server Error' }));
    }
  };
}
