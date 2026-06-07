import type { NextApiRequest, NextApiResponse } from 'next';

const ADSB_BASE = 'https://api.adsb.lol';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const segments = req.query.path;
  const path = Array.isArray(segments) ? segments.join('/') : (segments ?? '');

  const upstreamUrl = `${ADSB_BASE}/${path}`;

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, { headers: { 'Accept': 'application/json' } });
  } catch {
    res.status(502).json({ error: 'Failed to reach adsb.lol' });
    return;
  }

  const body = await upstream.text();

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');
  res.status(upstream.status).send(body);
}
