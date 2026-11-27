import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import {
  ALL_REGION_IDS,
  getPm25BandLabel,
  getPsiBand,
} from '../services/psiAdapter';
import type { PsiSnapshot, RegionId } from '../types/psi';

interface RegionTelemetryPanelProps {
  snapshot: PsiSnapshot;
  selectedRegion: RegionId;
  onSelectRegion: (region: RegionId) => void;
}

export function RegionTelemetryPanel({
  snapshot,
  selectedRegion,
  onSelectRegion,
}: RegionTelemetryPanelProps) {
  const station = snapshot.regions[selectedRegion];
  const band = getPsiBand(station.readings.psi24h);
  const pmBand = getPm25BandLabel(station.readings.pm25Hourly);

  const delta = station.delta1h;
  const deltaLabel =
    delta > 0 ? `+${delta} vs 1h ago` : delta < 0 ? `${delta} vs 1h ago` : 'Steady vs 1h ago';

  const pollutantRows = [
    {
      name: '1-hr PM2.5',
      value: `${station.readings.pm25Hourly}`,
      unit: 'µg/m³',
      pct: Math.min(100, (station.readings.pm25Hourly / 250) * 100),
      barColor: pmBand.accentHex,
      note: pmBand.label,
    },
    {
      name: '24-hr PM2.5',
      value: `${station.readings.pm25TwentyFourHourly}`,
      unit: 'µg/m³',
      pct: Math.min(100, (station.readings.pm25TwentyFourHourly / 250) * 100),
      barColor: band.accentHex,
      note: `Sub-index ${station.readings.pm25SubIndex}`,
    },
    {
      name: '24-hr PM10',
      value: `${station.readings.pm10TwentyFourHourly}`,
      unit: 'µg/m³',
      pct: Math.min(100, (station.readings.pm10TwentyFourHourly / 350) * 100),
      barColor: '#475569',
      note: `Sub-index ${station.readings.pm10SubIndex}`,
    },
    {
      name: '8-hr Ozone (O₃)',
      value: `${station.readings.o3EightHourMax}`,
      unit: 'µg/m³',
      pct: Math.min(100, (station.readings.o3EightHourMax / 200) * 100),
      barColor: '#0284C7',
      note: `Sub-index ${station.readings.o3SubIndex}`,
    },
    {
      name: '24-hr SO₂',
      value: `${station.readings.so2TwentyFourHourly}`,
      unit: 'µg/m³',
      pct: Math.min(100, (station.readings.so2TwentyFourHourly / 100) * 100),
      barColor: '#64748B',
      note: `Sub-index ${station.readings.so2SubIndex}`,
    },
    {
      name: '8-hr CO',
      value: `${station.readings.coEightHourMax.toFixed(2)}`,
      unit: 'mg/m³',
      pct: Math.min(100, (station.readings.coEightHourMax / 10) * 100),
      barColor: '#64748B',
      note: `Sub-index ${station.readings.coSubIndex}`,
    },
    {
      name: '1-hr NO₂',
      value: `${station.readings.no2OneHourMax}`,
      unit: 'µg/m³',
      pct: Math.min(100, (station.readings.no2OneHourMax / 200) * 100),
      barColor: '#64748B',
      note: 'Hourly max',
    },
  ];

  return (
    <aside className="flex-1 rounded-xl border border-slate-200 bg-white flex flex-col divide-y divide-slate-200">
      {/* Primary Active Reading Summary */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs font-medium text-slate-500">
              Active Monitoring Sector
            </div>
            <h2 className="font-display text-lg font-bold text-slate-950 truncate mt-0.5">
              {station.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {station.landmarks}
            </p>
          </div>

          <div className="text-right shrink-0">
            <div
              className="inline-flex items-center gap-1.5 text-xs font-semibold"
              style={{ color: band.accentHex }}
            >
              <span aria-hidden="true">{band.glyph}</span>
              <span>{band.label}</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 tabular-nums mt-0.5">
              NEA {band.rangeLabel}
            </div>
          </div>
        </div>

        {/* Dominant Metric Display */}
        <div className="mt-4 flex items-end justify-between gap-4">
          <div className="flex items-baseline gap-2.5">
            <span className="font-mono text-5xl font-bold tracking-tight text-slate-950 tabular-nums leading-none">
              {station.readings.psi24h}
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-700">24-hr PSI</span>
              <span className="inline-flex items-center gap-1 text-xs font-mono text-slate-500 tabular-nums">
                {delta > 0 ? (
                  <ArrowUpRight className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
                ) : delta < 0 ? (
                  <ArrowDownRight className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                ) : (
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                )}
                {deltaLabel}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-500">1-hr PM2.5</div>
            <div className="font-mono text-xl font-semibold text-slate-900 tabular-nums">
              {station.readings.pm25Hourly}
              <span className="ml-1 text-xs font-normal text-slate-500">µg/m³</span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
          <span>Primary driver: {station.dominantPollutant}</span>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <span className="tabular-nums">
            Visibility {snapshot.wind.visibilityKm.toFixed(1)} km
          </span>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <span className="tabular-nums">{snapshot.wind.temperatureC.toFixed(1)} °C</span>
        </div>
      </div>

      {/* 6-Region Selector Matrix */}
      <div className="p-4">
        <div className="text-xs font-medium text-slate-500 mb-2.5">
          Select Region
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {ALL_REGION_IDS.map((regionId) => {
            const item = snapshot.regions[regionId];
            const itemBand = getPsiBand(item.readings.psi24h);
            const active = selectedRegion === regionId;

            return (
              <button
                key={regionId}
                type="button"
                onClick={() => onSelectRegion(regionId)}
                className={`flex flex-col items-start rounded-lg border px-2.5 py-2 text-left transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-600 ${
                  active
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-slate-50/70 text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span
                  className={`text-[11px] font-medium truncate w-full ${
                    active ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {item.shortLabel}
                </span>
                <div className="mt-0.5 flex items-baseline justify-between w-full gap-1">
                  <span className="font-mono text-base font-bold tabular-nums">
                    {item.readings.psi24h}
                  </span>
                  <span
                    className="text-[10px] font-semibold truncate"
                    style={{ color: active ? '#E2E8F0' : itemBand.accentHex }}
                  >
                    {itemBand.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pollutant Concentration & Sub-Index Breakdown */}
      <div className="p-5 flex-1">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-700">
            Pollutant Sub-Indices &amp; Concentrations
          </h3>
          <span className="text-[11px] font-mono text-slate-400">NEA Standard</span>
        </div>

        <div className="space-y-2.5">
          {pollutantRows.map((row) => (
            <div key={row.name}>
              <div className="flex items-baseline justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">{row.name}</span>
                <div className="flex items-baseline gap-2 tabular-nums">
                  <span className="text-[11px] text-slate-400">{row.note}</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {row.value}{' '}
                    <span className="font-normal text-slate-400 text-[11px]">
                      {row.unit}
                    </span>
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-200"
                  style={{
                    width: `${Math.max(4, row.pct)}%`,
                    backgroundColor: row.barColor,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
