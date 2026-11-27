import { ArrowUpDown, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ALL_REGION_IDS, getPsiBand } from '../services/psiAdapter';
import type { PsiSnapshot, RegionId, RegionStation } from '../types/psi';

interface RegionalMatrixTableProps {
  snapshot: PsiSnapshot;
  selectedRegion: RegionId;
  onSelectRegion: (region: RegionId) => void;
}

type SortKey = 'name' | 'psi24h' | 'pm25Hourly' | 'pm25_24h' | 'pm10' | 'o3' | 'so2';

export function RegionalMatrixTable({
  snapshot,
  selectedRegion,
  onSelectRegion,
}: RegionalMatrixTableProps) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('psi24h');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortAsc(key === 'name');
    }
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list: RegionStation[] = ALL_REGION_IDS.map((id) => snapshot.regions[id]).filter(
      (r) =>
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.landmarks.toLowerCase().includes(q) ||
        getPsiBand(r.readings.psi24h).label.toLowerCase().includes(q)
    );

    list.sort((a, b) => {
      let diff = 0;
      switch (sortKey) {
        case 'name':
          diff = a.name.localeCompare(b.name);
          break;
        case 'psi24h':
          diff = a.readings.psi24h - b.readings.psi24h;
          break;
        case 'pm25Hourly':
          diff = a.readings.pm25Hourly - b.readings.pm25Hourly;
          break;
        case 'pm25_24h':
          diff = a.readings.pm25TwentyFourHourly - b.readings.pm25TwentyFourHourly;
          break;
        case 'pm10':
          diff = a.readings.pm10TwentyFourHourly - b.readings.pm10TwentyFourHourly;
          break;
        case 'o3':
          diff = a.readings.o3EightHourMax - b.readings.o3EightHourMax;
          break;
        case 'so2':
          diff = a.readings.so2TwentyFourHourly - b.readings.so2TwentyFourHourly;
          break;
      }
      return sortAsc ? diff : -diff;
    });

    return list;
  }, [snapshot, query, sortKey, sortAsc]);

  const columns: { key: SortKey; label: string; align: 'left' | 'right' }[] = [
    { key: 'name', label: 'Monitoring Sector', align: 'left' },
    { key: 'psi24h', label: '24h PSI', align: 'right' },
    { key: 'pm25Hourly', label: '1h PM2.5 (µg/m³)', align: 'right' },
    { key: 'pm25_24h', label: '24h PM2.5', align: 'right' },
    { key: 'pm10', label: '24h PM10', align: 'right' },
    { key: 'o3', label: '8h O₃', align: 'right' },
    { key: 'so2', label: '24h SO₂', align: 'right' },
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-3.5">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900">
            Regional Pollutant Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any row to focus that sector on the Singapore map and telemetry console
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter region, town, or band..."
            aria-label="Filter monitoring regions"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-2.5 text-[11px] font-semibold text-slate-600 whitespace-nowrap ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSort(col.key)}
                    className={`inline-flex items-center gap-1 hover:text-slate-950 cursor-pointer ${
                      col.align === 'right' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <span>{col.label}</span>
                    <ArrowUpDown
                      className={`h-3 w-3 ${
                        sortKey === col.key ? 'text-slate-900' : 'text-slate-400'
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                </th>
              ))}
              <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-600 text-right whitespace-nowrap">
                8h CO (mg/m³)
              </th>
              <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-600 text-right whitespace-nowrap">
                Air Quality Band
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-8 text-center text-xs text-slate-500">
                  No monitoring sectors match "{query}".{' '}
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="font-semibold text-sky-700 hover:underline cursor-pointer"
                  >
                    Clear filter
                  </button>
                </td>
              </tr>
            ) : (
              rows.map((station) => {
                const band = getPsiBand(station.readings.psi24h);
                const isSelected = selectedRegion === station.id;

                return (
                  <tr
                    key={station.id}
                    onClick={() => onSelectRegion(station.id)}
                    className={`cursor-pointer transition-colors duration-100 ${
                      isSelected ? 'bg-sky-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-semibold text-slate-900 whitespace-nowrap">
                          {station.name}
                        </span>
                        <span className="hidden lg:inline text-[11px] text-slate-400 truncate max-w-[230px]">
                          {station.landmarks}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs font-bold text-slate-950 tabular-nums">
                      {station.readings.psi24h}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs font-medium text-slate-800 tabular-nums">
                      {station.readings.pm25Hourly}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-slate-600 tabular-nums">
                      {station.readings.pm25TwentyFourHourly}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-slate-600 tabular-nums">
                      {station.readings.pm10TwentyFourHourly}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-slate-600 tabular-nums">
                      {station.readings.o3EightHourMax}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-slate-600 tabular-nums">
                      {station.readings.so2TwentyFourHourly}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-slate-600 tabular-nums">
                      {station.readings.coEightHourMax.toFixed(2)}
                    </td>
                    <td
                      className="px-4 py-2.5 text-right text-xs font-semibold whitespace-nowrap"
                      style={{ color: band.accentHex }}
                    >
                      {band.glyph} {band.label}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
