import type { VercelRequest, VercelResponse } from '@vercel/node';

const allowedOrigins = [
  process.env.SITE_URL ?? 'https://petpass.app',
  'http://localhost:3000',
  'http://localhost:5173',
].filter(Boolean);

function getOrigin(req: VercelRequest): string {
  const origin = req.headers.origin ?? '';
  // Allow Vercel preview deployments
  if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
    return origin;
  }
  return allowedOrigins[0];
}

export function setCorsHeaders(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', getOrigin(req));
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-client-info, apikey');
  res.setHeader('Vary', 'Origin');
}

/**
 * Handle CORS preflight. Returns true if the request was an OPTIONS
 * request and has been handled (caller should return early).
 */
export function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  setCorsHeaders(req, res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}
