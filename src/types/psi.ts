export type RegionId = 'national' | 'north' | 'south' | 'east' | 'west' | 'central';

export type MonitoringRegionId = Exclude<RegionId, 'national'>;

export type PsiBandKey = 'good' | 'moderate' | 'unhealthy' | 'very-unhealthy' | 'hazardous';

export type ScenarioPreset = 'baseline' | 'moderate' | 'unhealthy' | 'severe';

export type MapMetricMode = 'psi24h' | 'pm25_1h';

export interface PollutantReadings {
  psi24h: number;
  pm25Hourly: number;
  pm25SubIndex: number;
  pm25TwentyFourHourly: number;
  pm10SubIndex: number;
  pm10TwentyFourHourly: number;
  o3SubIndex: number;
  o3EightHourMax: number;
  so2SubIndex: number;
  so2TwentyFourHourly: number;
  coSubIndex: number;
  coEightHourMax: number;
  no2OneHourMax: number;
}

export interface RegionStation {
  id: RegionId;
  name: string;
  shortLabel: string;
  landmarks: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  readings: PollutantReadings;
  delta1h: number;
  dominantPollutant: string;
}

export interface HourlyDataPoint {
  hourLabel: string;
  timestampIso: string;
  psi24h: Record<RegionId, number>;
  pm25Hourly: Record<RegionId, number>;
}

export interface WindTelemetry {
  directionLabel: string;
  bearingDeg: number;
  speedKmh: number;
  visibilityKm: number;
  humidityPct: number;
  temperatureC: number;
}

export interface PsiSnapshot {
  sourceLabel: string;
  isLiveApi: boolean;
  scenario: ScenarioPreset;
  updatedAtIso: string;
  updatedAtDisplay: string;
  wind: WindTelemetry;
  regions: Record<RegionId, RegionStation>;
  hourlyTrend: HourlyDataPoint[];
}

export interface PsiBandMeta {
  key: PsiBandKey;
  label: string;
  rangeLabel: string;
  textClass: string;
  surfaceClass: string;
  borderClass: string;
  accentHex: string;
  fillHex: string;
  glyph: string;
  summary: string;
}
