import { useMemo, useState } from 'react';
import { ALL_REGION_IDS, REGION_META } from '../services/psiAdapter';
import type { MapMetricMode, PsiSnapshot, RegionId } from '../types/psi';

interface HourlyTrendChartProps {
  snapshot: PsiSnapshot;
  selectedRegion: RegionId;
  onSelectRegion: (region: RegionId) => void;
}

const REGION_LINE_COLORS: Record<RegionId, string> = {
  national: '#0F172A',
  north: '#0284C7',
  south: '#D97706',
  east: '#16A34A',
  west: '#DC2626',
  central: '#7C3AED',
};

export function HourlyTrendChart({
  snapshot,
  selectedRegion,
  onSelectRegion,
}: HourlyTrendChartProps) {
  const [chartMetric, setChartMetric] = useState<MapMetricMode>('psi24h');
  const [visibleRegions, setVisibleRegions] = useState<Record<RegionId, boolean>>({
    national: true,
    north: true,
    south: true,
    east: true,
    west: true,
    central: true,
  });
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const toggleRegion = (id: RegionId) => {
    setVisibleRegions((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      // Ensure at least one series stays visible
      if (!Object.values(next).some(Boolean)) {
        return prev;
      }
      return next;
    });
  };

  const points = snapshot.hourlyTrend;
  const activeRegions = ALL_REGION_IDS.filter((r) => visibleRegions[r]);

  const { yMax, yTicks } = useMemo(() => {
    let peak = 60;
    points.forEach((pt) => {
      activeRegions.forEach((r) => {
        const val = chartMetric === 'psi24h' ? pt.psi24h[r] : pt.pm25Hourly[r];
        if (val > peak) peak = val;
      });
    });

    const step = peak <= 80 ? 25 : peak <= 160 ? 50 : 75;
    const roundedMax = Math.ceil((peak + 15) / step) * step;
    const ticks: number[] = [];
    for (let v = 0; v <= roundedMax; v += step) {
      ticks.push(v);
    }
    return { yMax: roundedMax, yTicks: ticks };
  }, [points, activeRegions, chartMetric]);

  const width = 960;
  const height = 270;
  const padLeft = 46;
  const padRight = 22;
  const padTop = 18;
  const padBottom = 34;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const getX = (idx: number) =>
    padLeft + (idx / Math.max(1, points.length - 1)) * plotWidth;
  const getY = (val: number) =>
    padTop + plotHeight - Math.min(1, Math.max(0, val / yMax)) * plotHeight;

  const activeHoverIdx =
    hoverIndex !== null && hoverIndex >= 0 && hoverIndex < points.length
      ? hoverIndex
      : points.length - 1;
  const hoveredPoint = points[activeHoverIdx];

  const thresholdMarkers =
    chartMetric === 'psi24h'
      ? [
          { value: 50, label: '50 Good', color: '#16A34A' },
          { value: 100, label: '100 Moderate', color: '#D97706' },
          { value: 200, label: '200 Very Unhealthy', color: '#DC2626' },
        ]
      : [
          { value: 55, label: '55 Elevated', color: '#D97706' },
          { value: 150, label: '150 High', color: '#DC2626' },
        ];

  return (
    <section
      id="trend"
      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
    >
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-3.5">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900">
            24-Hour Regional Trajectory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Hourly progression across Singapore monitoring sectors · Hover chart to inspect exact readings
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            role="group"
            aria-label="Chart metric"
            className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5"
          >
            <button
              type="button"
              onClick={() => setChartMetric('psi24h')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer ${
                chartMetric === 'psi24h'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              24h PSI
            </button>
            <button
              type="button"
              onClick={() => setChartMetric('pm25_1h')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer ${
                chartMetric === 'pm25_1h'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1h PM2.5 (µg/m³)
            </button>
          </div>
        </div>
      </div>

      {/* Series Filter Strip + Live Crosshair Readout */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {ALL_REGION_IDS.map((regionId) => {
            const visible = visibleRegions[regionId];
            const isSelected = selectedRegion === regionId;
            return (
              <button
                key={regionId}
                type="button"
                onClick={() => {
                  toggleRegion(regionId);
                  onSelectRegion(regionId);
                }}
                aria-pressed={visible}
                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer ${
                  visible
                    ? isSelected
                      ? 'border-slate-900 bg-white text-slate-950'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    : 'border-transparent bg-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <span
                  className="inline-block h-2 w-2 rounded-xs shrink-0"
                  style={{
                    backgroundColor: visible ? REGION_LINE_COLORS[regionId] : '#CBD5E1',
                  }}
                  aria-hidden="true"
                />
                <span>{REGION_META[regionId].shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Crosshair Readout Summary */}
        {hoveredPoint && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono tabular-nums">
            <span className="font-semibold text-slate-900">
              {hoveredPoint.hourLabel}
            </span>
            {activeRegions.map((rId) => {
              const val =
                chartMetric === 'psi24h'
                  ? hoveredPoint.psi24h[rId]
                  : hoveredPoint.pm25Hourly[rId];
              return (
                <span key={rId} className="inline-flex items-center gap-1 text-slate-600">
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: REGION_LINE_COLORS[rId] }}
                    aria-hidden="true"
                  />
                  <span>{REGION_META[rId].shortLabel}:</span>
                  <strong className="text-slate-900">{val}</strong>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* SVG Line Chart */}
      <div className="px-4 py-3">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[290px] cursor-crosshair select-none"
          onMouseLeave={() => setHoverIndex(null)}
          role="img"
          aria-label="24-hour regional air quality trend chart"
        >
          {/* Horizontal Y-Axis Gridlines */}
          {yTicks.map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-slate-400 font-mono text-[10px] tabular-nums"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* NEA Threshold Reference Lines */}
          {thresholdMarkers
            .filter((t) => t.value <= yMax)
            .map((t) => {
              const y = getY(t.value);
              return (
                <g key={t.label}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={width - padRight}
                    y2={y}
                    stroke={t.color}
                    strokeOpacity="0.45"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={width - padRight}
                    y={y - 4}
                    textAnchor="end"
                    fill={t.color}
                    className="font-mono text-[9.5px] font-medium"
                  >
                    {t.label}
                  </text>
                </g>
              );
            })}

          {/* X-Axis Time Labels */}
          {points.map((pt, idx) => {
            if (idx % 3 !== 0 && idx !== points.length - 1) return null;
            const x = getX(idx);
            return (
              <text
                key={pt.timestampIso}
                x={x}
                y={height - 10}
                textAnchor={
                  idx === 0 ? 'start' : idx === points.length - 1 ? 'end' : 'middle'
                }
                className="fill-slate-500 font-mono text-[10px] tabular-nums"
              >
                {pt.hourLabel}
              </text>
            );
          })}

          {/* Region Data Polyline Curves */}
          {activeRegions.map((regionId) => {
            const pathD = points
              .map((pt, idx) => {
                const val =
                  chartMetric === 'psi24h'
                    ? pt.psi24h[regionId]
                    : pt.pm25Hourly[regionId];
                return `${idx === 0 ? 'M' : 'L'} ${getX(idx).toFixed(1)} ${getY(val).toFixed(1)}`;
              })
              .join(' ');

            const isFocused = selectedRegion === regionId;

            return (
              <path
                key={regionId}
                d={pathD}
                fill="none"
                stroke={REGION_LINE_COLORS[regionId]}
                strokeWidth={isFocused ? 2.8 : regionId === 'national' ? 2.2 : 1.5}
                strokeOpacity={
                  selectedRegion === 'national' || isFocused ? 0.95 : 0.45
                }
                strokeDasharray={regionId === 'national' ? undefined : undefined}
              />
            );
          })}

          {/* Active Crosshair Vertical Line & Snapped Points */}
          {hoveredPoint && (
            <g pointerEvents="none">
              <line
                x1={getX(activeHoverIdx)}
                y1={padTop}
                x2={getX(activeHoverIdx)}
                y2={padTop + plotHeight}
                stroke="#94A3B8"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              {activeRegions.map((regionId) => {
                const val =
                  chartMetric === 'psi24h'
                    ? hoveredPoint.psi24h[regionId]
                    : hoveredPoint.pm25Hourly[regionId];
                return (
                  <circle
                    key={`dot-${regionId}`}
                    cx={getX(activeHoverIdx)}
                    cy={getY(val)}
                    r={selectedRegion === regionId ? 4.5 : 3.2}
                    fill="#FFFFFF"
                    stroke={REGION_LINE_COLORS[regionId]}
                    strokeWidth="2"
                  />
                );
              })}
            </g>
          )}

          {/* Invisible Hover Hit Columns */}
          {points.map((pt, idx) => {
            const colWidth = plotWidth / Math.max(1, points.length - 1);
            const x = getX(idx) - colWidth / 2;
            return (
              <rect
                key={`hit-${pt.timestampIso}`}
                x={Math.max(padLeft, x)}
                y={padTop}
                width={colWidth}
                height={plotHeight}
                fill="transparent"
                onMouseEnter={() => setHoverIndex(idx)}
                onClick={() => setHoverIndex(idx)}
              />
            );
          })}
        </svg>
      </div>
    </section>
  );
}
