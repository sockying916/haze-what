export interface ServerlessRequest {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
  url?: string;
  headers?: Record<string, string | string[] | undefined>;
}

export interface ServerlessResponse {
  status: (code: number) => ServerlessResponse;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
  end: (body?: string) => void;
}

const UPSTREAM_PSI_URL = 'https://api-open.data.gov.sg/v2/real-time/api/psi';

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
): Promise<void> {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'HEAD') {
    res.status(200).end();
    return;
  }

  const checkUpstream = req.query?.checkUpstream === 'true';

  if (!checkUpstream) {
    res.status(200).json({
      status: 'ok',
      service: 'sg-hazewatch-api',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/api/health',
        psi: '/api/psi',
      },
      upstream: UPSTREAM_PSI_URL,
    });
    return;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4500);
  const startedAt = Date.now();

  try {
    const upstreamRes = await fetch(UPSTREAM_PSI_URL, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    const latencyMs = Date.now() - startedAt;

    res.status(upstreamRes.ok ? 200 : 502).json({
      status: upstreamRes.ok ? 'ok' : 'degraded',
      service: 'sg-hazewatch-api',
      timestamp: new Date().toISOString(),
      upstream: {
        url: UPSTREAM_PSI_URL,
        reachable: upstreamRes.ok,
        httpStatus: upstreamRes.status,
        latencyMs,
      },
    });
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    res.status(503).json({
      status: 'degraded',
      service: 'sg-hazewatch-api',
      timestamp: new Date().toISOString(),
      upstream: {
        url: UPSTREAM_PSI_URL,
        reachable: false,
        error: isTimeout ? 'Upstream health check timed out' : 'Upstream unreachable',
      },
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
