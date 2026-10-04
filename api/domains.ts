import type { VercelRequest, VercelResponse } from '@vercel/node';
import { proxyToUpstream, CORS_HEADERS } from './_helper.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    Object.entries(CORS_HEADERS).forEach(([key, value]) => res.setHeader(key, value));
    return res.status(204).end();
  }

  Object.entries(CORS_HEADERS).forEach(([key, value]) => res.setHeader(key, value));

  if (req.method !== 'GET') {
    return res.status(405).json({ status: false, error: 'Method Not Allowed' });
  }

  const { status, data } = await proxyToUpstream('/api/domains', 'GET');

  return res.status(status).json(data);
}
