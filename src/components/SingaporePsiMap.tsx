import { Compass, Wind } from 'lucide-react';
import { useState } from 'react';
import {
  getPm25BandLabel,
  getPsiBand,
  PSI_BANDS,
} from '../services/psiAdapter';
import type {
  MapMetricMode,
  MonitoringRegionId,
  PsiSnapshot,
  RegionId,
} from '../types/psi';

interface SingaporePsiMapProps {
  snapshot: PsiSnapshot;
  selectedRegion: RegionId;
  onSelectRegion: (region: RegionId) => void;
  metricMode: MapMetricMode;
  onChangeMetricMode: (mode: MapMetricMode) => void;
}

interface RegionGeometry {
  id: MonitoringRegionId;
  polygonPoints: string;
  markerX: number;
  markerY: number;
  subLabel: string;
}

// Accurate 5-sector NEA partition clipped inside Singapore's mainland outline (820x470 viewBox)
const REGION_GEOMETRIES: RegionGeometry[] = [
  {
    id: 'west',
    polygonPoints: '40,95 275,95 292,225 268,360 40,360',
    markerX: 178,
    markerY: 242,
    subLabel: 'Jurong · Tuas',
  },
  {
    id: 'north',
    polygonPoints: '275,45 535,45 508,185 365,195 280,175',
    markerX: 374,
    markerY: 122,
    subLabel: 'Woodlands · Yishun',
  },
  {
    id: 'central',
    polygonPoints: '280,175 365,195 508,185 522,282 470,320 355,290 292,225',
    markerX: 416,
    markerY: 228,
    subLabel: 'Bishan · Toa Payoh',
  },
  {
    id: 'south',
    polygonPoints: '268,360 292,225 355,290 470,320 508,360 495,410 268,410',
    markerX: 378,
    markerY: 326,
    subLabel: 'Bukit Merah · Sentosa',
  },
  {
    id: 'east',
    polygonPoints: '535,45 775,45 775,355 508,360 522,282 508,185',
    markerX: 604,
    markerY: 214,
    subLabel: 'Tampines · Changi',
  },
];

// Main Singapore island silhouette path
const SINGAPORE_MAINLAND_PATH =
  'M 64 252 L 82 222 L 104 214 L 122 192 L 136 168 L 168 148 L 194 126 L 218 104 L 254 96 L 284 74 L 318 68 L 352 62 L 384 68 L 418 86 L 448 106 L 478 108 L 516 122 L 548 136 L 584 152 L 626 154 L 664 142 L 692 154 L 716 184 L 702 214 L 662 238 L 614 266 L 568 282 L 520 296 L 494 322 L 468 336 L 434 334 L 402 346 L 372 342 L 342 328 L 308 312 L 274 304 L 236 300 L 196 296 L 160 302 L 128 326 L 96 340 L 72 332 L 64 294 Z';

const JURONG_ISLAND_PATH =
  'M 128 346 L 178 336 L 222 344 L 238 362 L 212 384 L 164 388 L 132 372 Z';

const SENTOSA_PATH =
  'M 362 362 L 398 358 L 414 370 L 396 382 L 366 376 Z';

const PULAU_UBIN_PATH =
  'M 564 106 L 604 98 L 636 108 L 622 124 L 578 122 Z';

const PULAU_TEKONG_PATH =
  'M 664 96 L 716 86 L 738 108 L 714 134 L 670 128 Z';

const LANDMARK_LABELS = [
  { name: 'Tuas', x: 96, y: 292 },
  { name: 'Woodlands', x: 306, y: 92 },
  { name: 'Punggol', x: 518, y: 142 },
  { name: 'Changi', x: 682, y: 186 },
  { name: 'Marina Bay', x: 454, y: 312 },
];

export function SingaporePsiMap({
  snapshot,
  selectedRegion,
  onSelectRegion,
  metricMode,
  onChangeMetricMode,
}: SingaporePsiMapProps) {
  const [showWindVectors, setShowWindVectors] = useState(true);
  const [hoveredRegion, setHoveredRegion] = useState<MonitoringRegionId | null>(null);

  const windRadians = ((snapshot.wind.bearingDeg + 180) * Math.PI) / 180;
  const windDx = Math.sin(windRadians) * 44;
  const windDy = -Math.cos(windRadians) * 44;

  const windStreamSeeds = [
    { x: 140, y: 170 },
    { x: 290, y: 160 },
    { x: 470, y: 165 },
    { x: 640, y: 180 },
    { x: 220, y: 290 },
    { x: 430, y: 280 },
    { x: 575, y: 268 },
  ];

  return (
    <section
      id="regional-map"
      className="flex-1 flex flex-col justify-between rounded-xl border border-slate-200 bg-white overflow-hidden"
    >
      {/* Map Header & Layer Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-3.5">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900">
            Singapore Regional Air Quality Map
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any NEA monitoring sector to inspect pollutant breakdown and 24-hour curve
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Map metric mode"
            className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5"
          >
            <button
              type="button"
              onClick={() => onChangeMetricMode('psi24h')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer ${
                metricMode === 'psi24h'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              24h PSI
            </button>
            <button
              type="button"
              onClick={() => onChangeMetricMode('pm25_1h')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer ${
                metricMode === 'pm25_1h'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1h PM2.5
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowWindVectors((prev) => !prev)}
            aria-pressed={showWindVectors}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer ${
              showWindVectors
                ? 'border-sky-300 bg-sky-50 text-sky-800'
                : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wind className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Wind Vectors</span>
          </button>
        </div>
      </div>

      {/* Interactive SVG Cartographic Canvas */}
      <div className="relative bg-slate-50/70 px-3 pt-3 pb-2">
        {/* Top-left Coordinate & Compass HUD */}
        <div className="pointer-events-none absolute left-6 top-5 z-10 flex items-center gap-3 text-[11px] font-mono text-slate-500 tabular-nums">
          <span>1.3521° N, 103.8198° E</span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
            <Compass className="h-3 w-3 text-slate-500" aria-hidden="true" />
            {snapshot.wind.directionLabel} {snapshot.wind.speedKmh} km/h
          </span>
        </div>

        {/* Top-right National Reset Quick Button */}
        {selectedRegion !== 'national' && (
          <button
            type="button"
            onClick={() => onSelectRegion('national')}
            className="absolute right-6 top-5 z-10 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Reset to National
          </button>
        )}

        <svg
          viewBox="0 0 820 430"
          className="w-full h-auto max-h-[450px] select-none"
          role="img"
          aria-label="Interactive map of Singapore showing PSI and PM2.5 levels across North, South, East, West, and Central regions"
        >
          <defs>
            <clipPath id="sg-mainland-clip">
              <path d={SINGAPORE_MAINLAND_PATH} />
            </clipPath>
            <marker
              id="wind-arrow"
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0284C7" fillOpacity="0.55" />
            </marker>
          </defs>

          {/* Subtle Oceanographic Gridlines */}
          <g stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 4">
            <line x1="160" y1="20" x2="160" y2="410" />
            <line x1="410" y1="20" x2="410" y2="410" />
            <line x1="660" y1="20" x2="660" y2="410" />
            <line x1="30" y1="115" x2="790" y2="115" />
            <line x1="30" y1="245" x2="790" y2="245" />
            <line x1="30" y1="365" x2="790" y2="365" />
          </g>

          {/* Strait Water Labels */}
          <text
            x="405"
            y="42"
            textAnchor="middle"
            className="fill-slate-400 text-[10px] font-mono tracking-widest uppercase"
          >
            Johor Strait
          </text>
          <text
            x="430"
            y="414"
            textAnchor="middle"
            className="fill-slate-400 text-[10px] font-mono tracking-widest uppercase"
          >
            Singapore Strait
          </text>

          {/* Offshore Islands */}
          <g className="transition-colors duration-200">
            <path
              d={JURONG_ISLAND_PATH}
              fill={getPsiBand(snapshot.regions.west.readings.psi24h).fillHex}
              stroke="#94A3B8"
              strokeWidth="1.2"
            />
            <path
              d={SENTOSA_PATH}
              fill={getPsiBand(snapshot.regions.south.readings.psi24h).fillHex}
              stroke="#94A3B8"
              strokeWidth="1.2"
            />
            <path
              d={PULAU_UBIN_PATH}
              fill={getPsiBand(snapshot.regions.east.readings.psi24h).fillHex}
              stroke="#94A3B8"
              strokeWidth="1.2"
            />
            <path
              d={PULAU_TEKONG_PATH}
              fill={getPsiBand(snapshot.regions.east.readings.psi24h).fillHex}
              stroke="#94A3B8"
              strokeWidth="1.2"
            />
          </g>

          {/* Clipped 5 Interactive NEA Sectors */}
          <g clipPath="url(#sg-mainland-clip)">
            {REGION_GEOMETRIES.map((geom) => {
              const station = snapshot.regions[geom.id];
              const band = getPsiBand(station.readings.psi24h);
              const isSelected = selectedRegion === geom.id;
              const isHovered = hoveredRegion === geom.id;

              return (
                <polygon
                  key={geom.id}
                  points={geom.polygonPoints}
                  fill={band.fillHex}
                  fillOpacity={isSelected ? 0.98 : isHovered ? 0.9 : 0.72}
                  stroke={isSelected ? band.accentHex : '#94A3B8'}
                  strokeWidth={isSelected ? 2.4 : 1}
                  className="cursor-pointer transition-opacity duration-150 outline-none"
                  role="button"
                  tabIndex={0}
                  aria-label={`${station.name} region: PSI ${station.readings.psi24h}, ${band.label}`}
                  onClick={() => onSelectRegion(geom.id)}
                  onMouseEnter={() => setHoveredRegion(geom.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectRegion(geom.id);
                    }
                  }}
                />
              );
            })}
          </g>

          {/* Crisp Outer Mainland Coastline */}
          <path
            d={SINGAPORE_MAINLAND_PATH}
            fill="none"
            stroke="#475569"
            strokeWidth="1.6"
            pointerEvents="none"
          />

          {/* Subtle Town / District Landmarks */}
          <g pointerEvents="none">
            {LANDMARK_LABELS.map((lm) => (
              <g key={lm.name} transform={`translate(${lm.x}, ${lm.y})`}>
                <circle r="2" fill="#64748B" />
                <text
                  x="5"
                  y="3"
                  className="fill-slate-600 text-[10px] font-medium"
                >
                  {lm.name}
                </text>
              </g>
            ))}
          </g>

          {/* Animated Wind Drift Vectors */}
          {showWindVectors && (
            <g pointerEvents="none">
              {windStreamSeeds.map((seed, idx) => (
                <line
                  key={idx}
                  x1={seed.x - windDx * 0.5}
                  y1={seed.y - windDy * 0.5}
                  x2={seed.x + windDx * 0.5}
                  y2={seed.y + windDy * 0.5}
                  stroke="#0284C7"
                  strokeOpacity="0.45"
                  strokeWidth="1.5"
                  strokeDasharray="6 6"
                  className="animate-wind-drift"
                  markerEnd="url(#wind-arrow)"
                />
              ))}
            </g>
          )}

          {/* Regional Station Telemetry Markers */}
          {REGION_GEOMETRIES.map((geom) => {
            const station = snapshot.regions[geom.id];
            const band = getPsiBand(station.readings.psi24h);
            const pmBand = getPm25BandLabel(station.readings.pm25Hourly);
            const isSelected = selectedRegion === geom.id;
            const isHovered = hoveredRegion === geom.id;
            const value =
              metricMode === 'psi24h'
                ? station.readings.psi24h
                : station.readings.pm25Hourly;
            const accent =
              metricMode === 'psi24h' ? band.accentHex : pmBand.accentHex;
            const statusText =
              metricMode === 'psi24h' ? band.label : `${pmBand.label}`;

            return (
              <g
                key={`marker-${geom.id}`}
                transform={`translate(${geom.markerX}, ${geom.markerY})`}
                className="cursor-pointer"
                onClick={() => onSelectRegion(geom.id)}
                onMouseEnter={() => setHoveredRegion(geom.id)}
                onMouseLeave={() => setHoveredRegion(null)}
              >
                <rect
                  x="-54"
                  y="-30"
                  width="108"
                  height="58"
                  rx="8"
                  fill="#FFFFFF"
                  fillOpacity={isSelected || isHovered ? 0.98 : 0.94}
                  stroke={isSelected ? accent : '#CBD5E1'}
                  strokeWidth={isSelected ? 2 : 1}
                />
                {/* Top region label */}
                <text
                  x="-44"
                  y="-12"
                  className="fill-slate-600 text-[10px] font-semibold tracking-wide uppercase"
                >
                  {station.shortLabel}
                </text>
                {/* Metric value */}
                <text
                  x="-44"
                  y="14"
                  className="fill-slate-950 font-mono text-[20px] font-bold tabular-nums"
                >
                  {value}
                </text>
                {/* Unit or band label right-aligned */}
                <text
                  x="44"
                  y="14"
                  textAnchor="end"
                  fill={accent}
                  className="text-[10px] font-semibold"
                >
                  {metricMode === 'psi24h' ? statusText : 'µg/m³'}
                </text>
                {/* Sub-caption line */}
                <text
                  x="-44"
                  y="24"
                  className="fill-slate-400 text-[9px] font-mono tabular-nums"
                >
                  {metricMode === 'psi24h'
                    ? `PM2.5 ${station.readings.pm25Hourly} µg/m³`
                    : `${statusText} · PSI ${station.readings.psi24h}`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* NEA PSI Scale Legend Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 border-t border-slate-200 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 bg-white">
        {PSI_BANDS.map((band) => (
          <div key={band.key} className="flex items-center justify-between px-3.5 py-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="text-xs font-bold shrink-0"
                style={{ color: band.accentHex }}
                aria-hidden="true"
              >
                {band.glyph}
              </span>
              <span className="text-xs font-medium text-slate-800 truncate">
                {band.label}
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-500 tabular-nums ml-2 shrink-0">
              {band.rangeLabel}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
