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
}

const DATA_GOV_PSI_ENDPOINT = 'https://api-open.data.gov.sg/v2/real-time/api/psi';
const DATA_GOV_PM25_ENDPOINT = 'https://api-open.data.gov.sg/v2/real-time/api/pm25';
const DATE_PARAM_REGEX = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?$/;

interface NeaItem {
  timestamp?: string;
  update_timestamp?: string;
  readings?: Record<string, Record<string, number>>;
}

interface NeaPayload {
  code?: number;
  errorMsg?: string;
  data?: {
    regionMetadata?: Array<{
      name: string;
      labelLocation?: { latitude: number; longitude: number };
    }>;
    items?: NeaItem[];
    paginationToken?: string;
  };
}

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const rawDate = Array.isArray(req.query?.date) ? req.query?.date[0] : req.query?.date;
  if (rawDate !== undefined && rawDate !== '' && !DATE_PARAM_REGEX.test(rawDate)) {
    res.status(400).json({
      error: 'Invalid date query parameter. Expected YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.',
    });
    return;
  }

  const psiUrl = new URL(DATA_GOV_PSI_ENDPOINT);
  const pm25Url = new URL(DATA_GOV_PM25_ENDPOINT);
  if (rawDate) {
    psiUrl.searchParams.set('date', rawDate);
    pm25Url.searchParams.set('date', rawDate);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const [psiResponse, pm25Result] = await Promise.all([
      fetch(psiUrl.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      }),
      fetch(pm25Url.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      }).catch(() => null),
    ]);

    if (!psiResponse.ok) {
      res.status(502).json({
        error: `Upstream data.gov.sg PSI API returned HTTP ${psiResponse.status}`,
      });
      return;
    }

    const psiPayload = (await psiResponse.json()) as NeaPayload;
    const items = psiPayload?.data?.items;

    if (!Array.isArray(items) || items.length === 0 || !items[0]?.readings) {
      res.status(502).json({
        error: 'Unexpected payload structure from data.gov.sg PSI endpoint',
      });
      return;
    }

    // Merge 1-hourly PM2.5 readings when available from data.gov.sg /pm25
    let pm25OneHourlyLatest: Record<string, number> | null = null;
    if (pm25Result && pm25Result.ok) {
      try {
        const pm25Payload = (await pm25Result.json()) as NeaPayload;
        const pm25Reading = pm25Payload?.data?.items?.[0]?.readings?.pm25_one_hourly;
        if (pm25Reading && typeof pm25Reading === 'object') {
          pm25OneHourlyLatest = pm25Reading;
        }
      } catch {
        // Non-fatal: 24h PSI payload remains valid without 1h PM2.5 enrichment
      }
    }

    if (pm25OneHourlyLatest && items[0].readings) {
      items[0].readings.pm25_one_hourly = pm25OneHourlyLatest;
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

    res.status(200).json({
      source: 'data.gov.sg',
      endpoint: DATA_GOV_PSI_ENDPOINT,
      fetchedAt: new Date().toISOString(),
      data: psiPayload.data,
    });
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    res.status(isTimeout ? 504 : 502).json({
      error: isTimeout
        ? 'Timed out waiting for data.gov.sg PSI endpoint'
        : 'Failed to connect to data.gov.sg PSI endpoint',
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
