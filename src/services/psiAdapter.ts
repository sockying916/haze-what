import type {
  HourlyDataPoint,
  MonitoringRegionId,
  PollutantReadings,
  PsiBandMeta,
  PsiSnapshot,
  RegionId,
  RegionStation,
  ScenarioPreset,
} from '../types/psi';

export const MONITORING_REGION_IDS: MonitoringRegionId[] = [
  'north',
  'south',
  'east',
  'west',
  'central',
];

export const ALL_REGION_IDS: RegionId[] = [
  'national',
  'north',
  'south',
  'east',
  'west',
  'central',
];

export const REGION_META: Record<
  RegionId,
  { name: string; shortLabel: string; landmarks: string; lat: number; lng: number }
> = {
  national: {
    name: 'National (Singapore)',
    shortLabel: 'National',
    landmarks: 'Island-wide NEA 5-region composite',
    lat: 1.3521,
    lng: 103.8198,
  },
  north: {
    name: 'North',
    shortLabel: 'North',
    landmarks: 'Woodlands · Yishun · Sembawang · Mandai',
    lat: 1.4304,
    lng: 103.788,
  },
  south: {
    name: 'South',
    shortLabel: 'South',
    landmarks: 'Bukit Merah · Queenstown · Sentosa · HarbourFront',
    lat: 1.2761,
    lng: 103.819,
  },
  east: {
    name: 'East',
    shortLabel: 'East',
    landmarks: 'Tampines · Bedok · Pasir Ris · Changi',
    lat: 1.3496,
    lng: 103.9568,
  },
  west: {
    name: 'West',
    shortLabel: 'West',
    landmarks: 'Jurong West · Tuas · Clementi · Choa Chu Kang',
    lat: 1.3404,
    lng: 103.709,
  },
  central: {
    name: 'Central',
    shortLabel: 'Central',
    landmarks: 'Bishan · Toa Payoh · Novena · Marina Bay',
    lat: 1.3526,
    lng: 103.8485,
  },
};

export const PSI_BANDS: PsiBandMeta[] = [
  {
    key: 'good',
    label: 'Good',
    rangeLabel: '0–50',
    textClass: 'text-emerald-700',
    surfaceClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200',
    accentHex: '#16A34A',
    fillHex: '#DCFCE7',
    glyph: '●',
    summary: 'Clean air quality with minimal health impact across all groups.',
  },
  {
    key: 'moderate',
    label: 'Moderate',
    rangeLabel: '51–100',
    textClass: 'text-sky-700',
    surfaceClass: 'bg-sky-50',
    borderClass: 'border-sky-200',
    accentHex: '#0284C7',
    fillHex: '#E0F2FE',
    glyph: '◆',
    summary: 'Acceptable air quality; unusually sensitive individuals may notice mild haze.',
  },
  {
    key: 'unhealthy',
    label: 'Unhealthy',
    rangeLabel: '101–200',
    textClass: 'text-amber-700',
    surfaceClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
    accentHex: '#D97706',
    fillHex: '#FEF3C7',
    glyph: '▲',
    summary: 'Elevated particulate load. Reduce prolonged or strenuous outdoor exertion.',
  },
  {
    key: 'very-unhealthy',
    label: 'Very Unhealthy',
    rangeLabel: '201–300',
    textClass: 'text-red-700',
    surfaceClass: 'bg-red-50',
    borderClass: 'border-red-200',
    accentHex: '#DC2626',
    fillHex: '#FEE2E2',
    glyph: '■',
    summary: 'Significant transboundary smoke haze. Minimize outdoor exposure.',
  },
  {
    key: 'hazardous',
    label: 'Hazardous',
    rangeLabel: '>300',
    textClass: 'text-rose-900',
    surfaceClass: 'bg-rose-100',
    borderClass: 'border-rose-300',
    accentHex: '#9F1239',
    fillHex: '#FFE4E6',
    glyph: '✖',
    summary: 'Severe haze episode. Remain indoors with air filtration and wear N95 outdoors.',
  },
];

export function getPsiBand(psiValue: number): PsiBandMeta {
  if (psiValue <= 50) return PSI_BANDS[0];
  if (psiValue <= 100) return PSI_BANDS[1];
  if (psiValue <= 200) return PSI_BANDS[2];
  if (psiValue <= 300) return PSI_BANDS[3];
  return PSI_BANDS[4];
}

export function getPm25BandLabel(pm25: number): {
  label: string;
  textClass: string;
  accentHex: string;
} {
  if (pm25 <= 55) {
    return { label: 'Normal', textClass: 'text-emerald-700', accentHex: '#16A34A' };
  }
  if (pm25 <= 150) {
    return { label: 'Elevated', textClass: 'text-amber-700', accentHex: '#D97706' };
  }
  if (pm25 <= 250) {
    return { label: 'High', textClass: 'text-red-700', accentHex: '#DC2626' };
  }
  return { label: 'Very High', textClass: 'text-rose-900', accentHex: '#9F1239' };
}

export const SCENARIO_CONFIGS: Record<
  ScenarioPreset,
  {
    label: string;
    description: string;
    wind: {
      directionLabel: string;
      bearingDeg: number;
      speedKmh: number;
      visibilityKm: number;
      humidityPct: number;
      temperatureC: number;
    };
    regionalPsi: Record<MonitoringRegionId, number>;
    regionalPm25_1h: Record<MonitoringRegionId, number>;
  }
> = {
  baseline: {
    label: 'Baseline',
    description: 'Typical inter-monsoon conditions with clear visibility',
    wind: {
      directionLabel: 'ENE',
      bearingDeg: 68,
      speedKmh: 16,
      visibilityKm: 14.5,
      humidityPct: 74,
      temperatureC: 30.2,
    },
    regionalPsi: {
      north: 44,
      south: 41,
      east: 38,
      west: 47,
      central: 43,
    },
    regionalPm25_1h: {
      north: 14,
      south: 12,
      east: 11,
      west: 16,
      central: 13,
    },
  },
  moderate: {
    label: 'Moderate Haze',
    description: 'Light transboundary drift under south-westerly breeze',
    wind: {
      directionLabel: 'SW',
      bearingDeg: 222,
      speedKmh: 11,
      visibilityKm: 8.4,
      humidityPct: 78,
      temperatureC: 31.4,
    },
    regionalPsi: {
      north: 74,
      south: 79,
      east: 66,
      west: 84,
      central: 76,
    },
    regionalPm25_1h: {
      north: 34,
      south: 39,
      east: 28,
      west: 45,
      central: 37,
    },
  },
  unhealthy: {
    label: 'Unhealthy Surge',
    description: 'Active smoke plume advecting across Strait of Malacca',
    wind: {
      directionLabel: 'SSW',
      bearingDeg: 205,
      speedKmh: 9,
      visibilityKm: 3.8,
      humidityPct: 81,
      temperatureC: 32.1,
    },
    regionalPsi: {
      north: 132,
      south: 148,
      east: 119,
      west: 159,
      central: 141,
    },
    regionalPm25_1h: {
      north: 82,
      south: 98,
      east: 69,
      west: 112,
      central: 91,
    },
  },
  severe: {
    label: 'Severe Episode',
    description: 'Dense stagnant haze layer across southern & western sectors',
    wind: {
      directionLabel: 'S',
      bearingDeg: 185,
      speedKmh: 5,
      visibilityKm: 1.6,
      humidityPct: 84,
      temperatureC: 32.8,
    },
    regionalPsi: {
      north: 214,
      south: 238,
      east: 196,
      west: 254,
      central: 229,
    },
    regionalPm25_1h: {
      north: 162,
      south: 186,
      east: 144,
      west: 204,
      central: 178,
    },
  },
};

function clampInt(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function buildPollutants(psi: number, pm25Hourly: number, jitterSeed: number): PollutantReadings {
  const jitter = (offset: number) => Math.sin(jitterSeed + offset) * 0.06 + 1;
  const pm25TwentyFourHourly = clampInt(
    psi <= 50 ? psi * 0.28 : psi <= 100 ? 12 + (psi - 50) * 0.46 : 35 + (psi - 100) * 0.72,
    6,
    320
  );
  const pm10TwentyFourHourly = clampInt(pm25TwentyFourHourly * 1.48 * jitter(1), 12, 420);
  const pm10SubIndex = clampInt(psi * 0.74 * jitter(2), 10, 350);
  const o3EightHourMax = clampInt((28 + psi * 0.34) * jitter(3), 12, 220);
  const o3SubIndex = clampInt(psi * 0.56 * jitter(4), 12, 180);
  const so2TwentyFourHourly = clampInt((5 + psi * 0.09) * jitter(5), 2, 85);
  const so2SubIndex = clampInt(so2TwentyFourHourly * 0.92, 3, 90);
  const coEightHourMax = Number(((0.35 + psi * 0.0045) * jitter(6)).toFixed(2));
  const coSubIndex = clampInt(coEightHourMax * 11.5, 4, 70);
  const no2OneHourMax = clampInt((18 + psi * 0.24) * jitter(7), 8, 160);

  return {
    psi24h: psi,
    pm25Hourly,
    pm25SubIndex: psi,
    pm25TwentyFourHourly,
    pm10SubIndex,
    pm10TwentyFourHourly,
    o3SubIndex,
    o3EightHourMax,
    so2SubIndex,
    so2TwentyFourHourly,
    coSubIndex,
    coEightHourMax,
    no2OneHourMax,
  };
}

function formatSgtTimestamp(date: Date): string {
  return (
    new Intl.DateTimeFormat('en-SG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Singapore',
    }).format(date) + ' SGT'
  );
}

function formatSgtHour(date: Date): string {
  return new Intl.DateTimeFormat('en-SG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Singapore',
  }).format(date);
}

export function generateSnapshot(
  scenario: ScenarioPreset,
  now: Date = new Date(),
  pollTick: number = 0
): PsiSnapshot {
  const cfg = SCENARIO_CONFIGS[scenario];
  const regions = {} as Record<RegionId, RegionStation>;

  let maxPsi = 0;
  let sumPm25 = 0;

  MONITORING_REGION_IDS.forEach((regionId, idx) => {
    const wave = Math.round(Math.sin(pollTick * 0.85 + idx * 1.4) * (scenario === 'baseline' ? 2 : 4));
    const pmWave = Math.round(Math.cos(pollTick * 0.7 + idx * 1.1) * (scenario === 'baseline' ? 2 : 5));
    const psi = clampInt(cfg.regionalPsi[regionId] + wave, 12, 420);
    const pm25_1h = clampInt(cfg.regionalPm25_1h[regionId] + pmWave, 4, 340);
    const prevWave = Math.round(Math.sin((pollTick - 1) * 0.85 + idx * 1.4) * (scenario === 'baseline' ? 2 : 4));
    const delta1h = wave - prevWave;

    maxPsi = Math.max(maxPsi, psi);
    sumPm25 += pm25_1h;

    const meta = REGION_META[regionId];
    regions[regionId] = {
      id: regionId,
      name: meta.name,
      shortLabel: meta.shortLabel,
      landmarks: meta.landmarks,
      coordinates: { lat: meta.lat, lng: meta.lng },
      readings: buildPollutants(psi, pm25_1h, pollTick + idx * 0.9),
      delta1h,
      dominantPollutant: psi > 50 ? 'PM2.5 (24-hr)' : 'PM2.5 / O3',
    };
  });

  const nationalPm25 = Math.round(sumPm25 / MONITORING_REGION_IDS.length);
  const nationalMeta = REGION_META.national;
  const avgDelta = Math.round(
    MONITORING_REGION_IDS.reduce((acc, r) => acc + regions[r].delta1h, 0) /
      MONITORING_REGION_IDS.length
  );

  regions.national = {
    id: 'national',
    name: nationalMeta.name,
    shortLabel: nationalMeta.shortLabel,
    landmarks: nationalMeta.landmarks,
    coordinates: { lat: nationalMeta.lat, lng: nationalMeta.lng },
    readings: buildPollutants(maxPsi, nationalPm25, pollTick + 5.2),
    delta1h: avgDelta,
    dominantPollutant: maxPsi > 50 ? 'PM2.5 (24-hr)' : 'PM2.5 / O3',
  };

  // Build 24-hour rolling curve ending at `now`
  const hourlyTrend: HourlyDataPoint[] = [];
  for (let i = 23; i >= 0; i--) {
    const pointTime = new Date(now.getTime() - i * 60 * 60 * 1000);
    const progress = (23 - i) / 23; // 0 (23h ago) -> 1 (now)
    const diurnal = Math.sin(((23 - i) / 24) * Math.PI * 2 - 0.8);

    const psiMap = {} as Record<RegionId, number>;
    const pmMap = {} as Record<RegionId, number>;
    let hourMaxPsi = 0;
    let hourPmSum = 0;

    MONITORING_REGION_IDS.forEach((rId, rIdx) => {
      const currentPsi = regions[rId].readings.psi24h;
      const currentPm = regions[rId].readings.pm25Hourly;

      // Historical ramp: baseline stays steady, elevated scenarios show realistic build-up
      const rampFactor =
        scenario === 'baseline'
          ? 0.92 + progress * 0.08
          : 0.62 + progress * 0.38;

      const regionCurve =
        i === 0
          ? currentPsi
          : clampInt(
              currentPsi * rampFactor + diurnal * (scenario === 'baseline' ? 3 : 8) + Math.sin(i + rIdx) * 2,
              12,
              420
            );
      const pmCurve =
        i === 0
          ? currentPm
          : clampInt(
              currentPm * rampFactor + diurnal * (scenario === 'baseline' ? 3 : 11) + Math.cos(i + rIdx) * 3,
              4,
              360
            );

      psiMap[rId] = regionCurve;
      pmMap[rId] = pmCurve;
      hourMaxPsi = Math.max(hourMaxPsi, regionCurve);
      hourPmSum += pmCurve;
    });

    psiMap.national = i === 0 ? regions.national.readings.psi24h : hourMaxPsi;
    pmMap.national =
      i === 0
        ? regions.national.readings.pm25Hourly
        : Math.round(hourPmSum / MONITORING_REGION_IDS.length);

    hourlyTrend.push({
      hourLabel: i === 0 ? 'Now' : formatSgtHour(pointTime),
      timestampIso: pointTime.toISOString(),
      psi24h: psiMap,
      pm25Hourly: pmMap,
    });
  }

  return {
    sourceLabel: `Frontend Simulation (${cfg.label})`,
    isLiveApi: false,
    scenario,
    updatedAtIso: now.toISOString(),
    updatedAtDisplay: formatSgtTimestamp(now),
    wind: {
      ...cfg.wind,
      speedKmh: Math.max(3, cfg.wind.speedKmh + Math.round(Math.sin(pollTick) * 2)),
    },
    regions,
    hourlyTrend,
  };
}

/**
 * Adapter ready for Singapore NEA / Data.gov.sg v2 real-time PSI API:
 * Expected endpoint: https://api-open.data.gov.sg/v2/real-time/api/psi
 * Parses `data.items[0].readings` into the normalized PsiSnapshot contract.
 */
export async function fetchFromNeaCompatibleEndpoint(
  psiEndpointUrl: string,
  pm25EndpointUrl?: string
): Promise<PsiSnapshot> {
  const response = await fetch(psiEndpointUrl, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Endpoint returned HTTP ${response.status}`);
  }

  const payload = await response.json();
  const latestItem = payload?.data?.items?.[0] ?? payload?.items?.[0];
  const readings = latestItem?.readings;

  if (!readings || !readings.psi_twenty_four_hourly) {
    throw new Error('Response does not match NEA v2 PSI readings schema');
  }

  let pm25OneHourlyMap: Partial<Record<MonitoringRegionId, number>> = {};
  if (pm25EndpointUrl) {
    try {
      const pmRes = await fetch(pm25EndpointUrl, { headers: { Accept: 'application/json' } });
      if (pmRes.ok) {
        const pmJson = await pmRes.json();
        const pmItem = pmJson?.data?.items?.[0] ?? pmJson?.items?.[0];
        if (pmItem?.readings?.pm25_one_hourly) {
          pm25OneHourlyMap = pmItem.readings.pm25_one_hourly;
        }
      }
    } catch {
      // Optional secondary PM2.5 1-hourly endpoint; gracefully derive if unreachable
    }
  }

  const updatedDate = latestItem.update_timestamp
    ? new Date(latestItem.update_timestamp)
    : new Date();

  const regions = {} as Record<RegionId, RegionStation>;
  let nationalPm25Sum = 0;

  ALL_REGION_IDS.forEach((regionId) => {
    const psi24 = Number(readings.psi_twenty_four_hourly?.[regionId] ?? 0);
    const pm25_24 = Number(readings.pm25_twenty_four_hourly?.[regionId] ?? 0);
    const pm25_1h =
      regionId !== 'national' && pm25OneHourlyMap[regionId] !== undefined
        ? Number(pm25OneHourlyMap[regionId])
        : pm25_24;

    if (regionId !== 'national') {
      nationalPm25Sum += pm25_1h;
    }

    const meta = REGION_META[regionId];
    regions[regionId] = {
      id: regionId,
      name: meta.name,
      shortLabel: meta.shortLabel,
      landmarks: meta.landmarks,
      coordinates: { lat: meta.lat, lng: meta.lng },
      delta1h: 0,
      dominantPollutant: psi24 > 50 ? 'PM2.5 (24-hr)' : 'PM2.5 / O3',
      readings: {
        psi24h: psi24,
        pm25Hourly: pm25_1h,
        pm25SubIndex: Number(readings.pm25_sub_index?.[regionId] ?? psi24),
        pm25TwentyFourHourly: pm25_24,
        pm10SubIndex: Number(readings.pm10_sub_index?.[regionId] ?? 0),
        pm10TwentyFourHourly: Number(readings.pm10_twenty_four_hourly?.[regionId] ?? 0),
        o3SubIndex: Number(readings.o3_sub_index?.[regionId] ?? 0),
        o3EightHourMax: Number(readings.o3_eight_hour_max?.[regionId] ?? 0),
        so2SubIndex: Number(readings.so2_sub_index?.[regionId] ?? 0),
        so2TwentyFourHourly: Number(readings.so2_twenty_four_hourly?.[regionId] ?? 0),
        coSubIndex: Number(readings.co_sub_index?.[regionId] ?? 0),
        coEightHourMax: Number(readings.co_eight_hour_max?.[regionId] ?? 0),
        no2OneHourMax: Number(readings.no2_one_hour_max?.[regionId] ?? 0),
      },
    };
  });

  if (regions.national) {
    regions.national.readings.pm25Hourly = Math.round(
      nationalPm25Sum / MONITORING_REGION_IDS.length
    );
  }

  // Synthesize single-point or fallback 24h curve anchored to live reading
  const baseline = generateSnapshot('baseline', updatedDate, 0);
  const hourlyTrend = baseline.hourlyTrend.map((pt, idx) => {
    if (idx === baseline.hourlyTrend.length - 1) {
      const psiMap = {} as Record<RegionId, number>;
      const pmMap = {} as Record<RegionId, number>;
      ALL_REGION_IDS.forEach((id) => {
        psiMap[id] = regions[id].readings.psi24h;
        pmMap[id] = regions[id].readings.pm25Hourly;
      });
      return {
        ...pt,
        psi24h: psiMap,
        pm25Hourly: pmMap,
      };
    }
    return pt;
  });

  return {
    sourceLabel: 'Live NEA API Connection',
    isLiveApi: true,
    scenario: 'baseline',
    updatedAtIso: updatedDate.toISOString(),
    updatedAtDisplay: formatSgtTimestamp(updatedDate),
    wind: {
      directionLabel: 'SW',
      bearingDeg: 220,
      speedKmh: 12,
      visibilityKm: regions.national.readings.psi24h > 100 ? 4.2 : 12.0,
      humidityPct: 76,
      temperatureC: 30.8,
    },
    regions,
    hourlyTrend,
  };
}

export function exportSnapshotCsv(snapshot: PsiSnapshot): void {
  const headers = [
    'Region',
    'Band',
    '24h_PSI',
    '1h_PM25_ug_m3',
    '24h_PM25_ug_m3',
    '24h_PM10_ug_m3',
    '8h_O3_ug_m3',
    '24h_SO2_ug_m3',
    '8h_CO_mg_m3',
    '1h_NO2_ug_m3',
    'Updated_SGT',
  ];

  const rows = ALL_REGION_IDS.map((id) => {
    const r = snapshot.regions[id];
    const band = getPsiBand(r.readings.psi24h).label;
    return [
      `"${r.name}"`,
      band,
      r.readings.psi24h,
      r.readings.pm25Hourly,
      r.readings.pm25TwentyFourHourly,
      r.readings.pm10TwentyFourHourly,
      r.readings.o3EightHourMax,
      r.readings.so2TwentyFourHourly,
      r.readings.coEightHourMax,
      r.readings.no2OneHourMax,
      `"${snapshot.updatedAtDisplay}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute(
    'download',
    `sg-psi-snapshot-${snapshot.updatedAtIso.slice(0, 16).replace(/[:T]/g, '-')}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
