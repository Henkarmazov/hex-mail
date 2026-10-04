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

  const { email, mail_id } = req.query;
  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ status: false, error: 'Email parameter is required' });
  }
  if (!mail_id || typeof mail_id !== 'string' || !mail_id.trim()) {
    return res.status(400).json({ status: false, error: 'mail_id parameter is required' });
  }

  const params = new URLSearchParams({
    email: email.trim(),
    mail_id: mail_id.trim(),
  });
  const { status, data } = await proxyToUpstream(`/api/read?${params.toString()}`, 'GET');

  return res.status(status).json(data);
}
