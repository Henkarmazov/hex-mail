import type { VercelRequest, VercelResponse } from '@vercel/node';
import { proxyToUpstream, CORS_HEADERS } from './_helper.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    Object.entries(CORS_HEADERS).forEach(([key, value]) => res.setHeader(key, value));
    return res.status(204).end();
  }

  Object.entries(CORS_HEADERS).forEach(([key, value]) => res.setHeader(key, value));

  if (req.method !== 'GET') {
    return res.status(405).json({ status: false, error: 'Method Not Allowed' });
  }

  const { username, domain } = req.query;
  const params = new URLSearchParams();
  if (typeof username === 'string' && username.trim()) {
    params.set('username', username.trim());
  }
  if (typeof domain === 'string' && domain.trim()) {
    params.set('domain', domain.trim());
  }

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const { status, data } = await proxyToUpstream(`/api/generate${queryString}`, 'GET');

  return res.status(status).json(data);
}
