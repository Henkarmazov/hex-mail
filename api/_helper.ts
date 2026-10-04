// Helper for Vercel Serverless Functions and Vite Dev middleware
// Proxying requests to https://hex-tempmail.vercel.app

export const UPSTREAM_BASE_URL = 'https://hex-tempmail.vercel.app';

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function proxyToUpstream(
  pathWithQuery: string,
  method: 'GET' | 'DELETE' = 'GET'
): Promise<{ status: number; data: unknown; headers?: Record<string, string> }> {
  const url = `${UPSTREAM_BASE_URL}${pathWithQuery}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await res.json();
      return { status: res.status, data: json };
    } else {
      const text = await res.text();
      try {
        const parsed = JSON.parse(text);
        return { status: res.status, data: parsed };
      } catch {
        return {
          status: res.status,
          data: { status: res.ok, message: text },
        };
      }
    }
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    const err = error as { name?: string; message?: string };
    if (err.name === 'AbortError') {
      return {
        status: 504,
        data: { status: false, error: 'Gateway Timeout: Upstream request timed out' },
      };
    }
    return {
      status: 502,
      data: { status: false, error: err.message || 'Bad Gateway: Failed to reach upstream service' },
    };
  }
}
