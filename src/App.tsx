import { Download, Link2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiConnectionModal } from './components/ApiConnectionModal';
import { HealthAdvisorySection } from './components/HealthAdvisorySection';
import { HourlyTrendChart } from './components/HourlyTrendChart';
import { RegionalMatrixTable } from './components/RegionalMatrixTable';
import { RegionTelemetryPanel } from './components/RegionTelemetryPanel';
import { SingaporePsiMap } from './components/SingaporePsiMap';
import { TopBar } from './components/TopBar';
import {
  exportSnapshotCsv,
  fetchFromNeaCompatibleEndpoint,
  fetchLivePsiFromServerless,
  generateSnapshot,
  getPm25BandLabel,
  getPsiBand,
  MONITORING_REGION_IDS,
  SCENARIO_CONFIGS,
} from './services/psiAdapter';
import type {
  MapMetricMode,
  PsiSnapshot,
  RegionId,
  ScenarioPreset,
} from './types/psi';

const SCENARIO_KEYS: ScenarioPreset[] = ['baseline', 'moderate', 'unhealthy', 'severe'];

export default function App() {
  const [scenario, setScenario] = useState<ScenarioPreset>('baseline');
  const [pollTick, setPollTick] = useState<number>(0);
  const [selectedRegion, setSelectedRegion] = useState<RegionId>('national');
  const [metricMode, setMetricMode] = useState<MapMetricMode>('psi24h');
  const [autoPoll, setAutoPoll] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [liveSnapshot, setLiveSnapshot] = useState<PsiSnapshot | null>(null);
  const [liveEndpoints, setLiveEndpoints] = useState<{
    psiUrl: string;
    pm25Url?: string;
  } | null>({ psiUrl: '/api/psi' });
  const [apiNotice, setApiNotice] = useState<string | null>(null);
  const [isApiModalOpen, setIsApiModalOpen] = useState<boolean>(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<Date>(() => new Date());

  const snapshot: PsiSnapshot = useMemo(() => {
    if (liveSnapshot) return liveSnapshot;
    return generateSnapshot(scenario, lastUpdatedTime, pollTick);
  }, [liveSnapshot, scenario, lastUpdatedTime, pollTick]);

  const loadLiveServerless = useCallback(async () => {
    setIsRefreshing(true);
    setApiNotice(null);
    try {
      const nextLive = await fetchLivePsiFromServerless();
      setLiveSnapshot(nextLive);
      setLiveEndpoints({ psiUrl: '/api/psi' });
    } catch (err) {
      setLiveSnapshot(null);
      setLiveEndpoints(null);
      setLastUpdatedTime(new Date());
      setApiNotice(
        err instanceof Error
          ? `Live feed unavailable (${err.message}); showing simulation fallback.`
          : 'Live feed unavailable; showing simulation fallback.'
      );
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Automatically fetch live Singapore PSI via /api/psi on initial load
  useEffect(() => {
    void loadLiveServerless();
  }, [loadLiveServerless]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setApiNotice(null);
    try {
      if (liveEndpoints) {
        const nextLive = await fetchFromNeaCompatibleEndpoint(
          liveEndpoints.psiUrl,
          liveEndpoints.pm25Url
        );
        setLiveSnapshot(nextLive);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 260));
        setLastUpdatedTime(new Date());
        setPollTick((prev) => prev + 1);
      }
    } catch (err) {
      setLastUpdatedTime(new Date());
      setPollTick((prev) => prev + 1);
      if (liveEndpoints) {
        setApiNotice(
          err instanceof Error
            ? `Refresh error (${err.message}); retaining fallback readings.`
            : 'Refresh error; retaining fallback readings.'
        );
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [liveEndpoints]);

  useEffect(() => {
    if (!autoPoll) return;
    const timer = window.setInterval(() => {
      void handleRefresh();
    }, 30000);
    return () => window.clearInterval(timer);
  }, [autoPoll, handleRefresh]);

  const handleSelectScenario = (nextScenario: ScenarioPreset) => {
    setApiNotice(null);
    setLiveSnapshot(null);
    setLiveEndpoints(null);
    setScenario(nextScenario);
    setLastUpdatedTime(new Date());
  };

  const handleConnectLiveApi = async (psiUrl: string, pm25Url: string) => {
    const nextLive = await fetchFromNeaCompatibleEndpoint(
      psiUrl,
      pm25Url || undefined
    );
    setApiNotice(null);
    setLiveSnapshot(nextLive);
    setLiveEndpoints({ psiUrl, pm25Url: pm25Url || undefined });
  };

  const handleDisconnectToSimulation = () => {
    setApiNotice(null);
    setLiveSnapshot(null);
    setLiveEndpoints(null);
    setLastUpdatedTime(new Date());
  };

  // Compute island-wide peak monitoring sector for the KPI summary strip
  const peakSector = useMemo(() => {
    let best = snapshot.regions[MONITORING_REGION_IDS[0]];
    MONITORING_REGION_IDS.forEach((id) => {
      if (snapshot.regions[id].readings.psi24h > best.readings.psi24h) {
        best = snapshot.regions[id];
      }
    });
    return best;
  }, [snapshot]);

  const national = snapshot.regions.national;
  const nationalBand = getPsiBand(national.readings.psi24h);
  const peakBand = getPsiBand(peakSector.readings.psi24h);
  const nationalPmBand = getPm25BandLabel(national.readings.pm25Hourly);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <TopBar isRefreshing={isRefreshing} onRefresh={handleRefresh} />

      <main className="mx-auto w-full max-w-[1380px] flex-1 px-6 py-6 space-y-6">
        {/* Overview Header & Workspace Controls */}
        <section
          id="overview"
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-4"
        >
          <div className="space-y-1.5">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 text-balance">
              Singapore Live PSI &amp; Haze Tracker
            </h1>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-600">
              <span className="font-mono tabular-nums text-slate-700">
                Updated {snapshot.updatedAtDisplay}
              </span>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <span>{snapshot.sourceLabel}</span>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <span>
                Prevailing {snapshot.wind.directionLabel} wind at{' '}
                <span className="font-mono tabular-nums">{snapshot.wind.speedKmh} km/h</span>
              </span>
            </div>
            {apiNotice && (
              <p className="text-xs text-amber-700">{apiNotice}</p>
            )}
          </div>

          {/* Workspace Toolbar: Live + Scenario Presets + Auto-Poll + API + Export */}
          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label="Data source and haze condition presets"
              className="inline-flex flex-wrap items-center rounded-lg border border-slate-200 bg-white p-0.5"
            >
              <button
                type="button"
                onClick={() => void loadLiveServerless()}
                className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer ${
                  snapshot.isLiveApi
                    ? 'bg-emerald-700 text-white'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Live (data.gov.sg)
              </button>
              {SCENARIO_KEYS.map((key) => {
                const active = !snapshot.isLiveApi && scenario === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectScenario(key)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer ${
                      active
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    {SCENARIO_CONFIGS[key].label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setAutoPoll((prev) => !prev)}
              aria-pressed={autoPoll}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer ${
                autoPoll
                  ? 'border-sky-300 bg-sky-50 text-sky-800'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              Auto-Poll: {autoPoll ? 'On (30s)' : 'Off'}
            </button>

            <button
              type="button"
              onClick={() => setIsApiModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 whitespace-nowrap shrink-0 hover:bg-slate-100 transition-colors duration-150 cursor-pointer"
            >
              <Link2 className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
              <span>{snapshot.isLiveApi ? 'API Status' : 'Connect API'}</span>
            </button>

            <button
              type="button"
              onClick={() => exportSnapshotCsv(snapshot)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 whitespace-nowrap shrink-0 hover:bg-slate-100 transition-colors duration-150 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
              <span>Export CSV</span>
            </button>
          </div>
        </section>

        {/* 4-Column National Summary Strip */}
        <section
          aria-label="National air quality summary"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 rounded-xl border border-slate-200 bg-white divide-y sm:divide-y-0 sm:divide-x divide-slate-200"
        >
          <div className="p-4 sm:p-5">
            <div className="text-xs font-medium text-slate-500">
              National 24-hr PSI
            </div>
            <div className="mt-1.5 flex items-baseline justify-between gap-2">
              <span className="font-mono text-3xl font-bold text-slate-950 tabular-nums">
                {national.readings.psi24h}
              </span>
              <span
                className="text-xs font-semibold"
                style={{ color: nationalBand.accentHex }}
              >
                {nationalBand.glyph} {nationalBand.label}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              NEA band {nationalBand.rangeLabel} · {national.dominantPollutant}
            </p>
          </div>

          <div className="p-4 sm:p-5">
            <div className="text-xs font-medium text-slate-500">
              Highest Regional Sector
            </div>
            <div className="mt-1.5 flex items-baseline justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedRegion(peakSector.id)}
                className="font-display text-2xl font-bold text-slate-950 hover:text-sky-700 transition-colors cursor-pointer text-left"
              >
                {peakSector.shortLabel}
              </button>
              <span
                className="font-mono text-sm font-bold tabular-nums"
                style={{ color: peakBand.accentHex }}
              >
                PSI {peakSector.readings.psi24h}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 truncate">
              {peakSector.landmarks}
            </p>
          </div>

          <div className="p-4 sm:p-5">
            <div className="text-xs font-medium text-slate-500">
              Island Mean 1-hr PM2.5
            </div>
            <div className="mt-1.5 flex items-baseline justify-between gap-2">
              <span className="font-mono text-3xl font-bold text-slate-950 tabular-nums">
                {national.readings.pm25Hourly}
                <span className="ml-1 text-xs font-normal text-slate-500">µg/m³</span>
              </span>
              <span
                className="text-xs font-semibold"
                style={{ color: nationalPmBand.accentHex }}
              >
                {nationalPmBand.label}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 tabular-nums">
              24-hr PM2.5 mean: {national.readings.pm25TwentyFourHourly} µg/m³
            </p>
          </div>

          <div className="p-4 sm:p-5">
            <div className="text-xs font-medium text-slate-500">
              Surface Wind &amp; Visibility
            </div>
            <div className="mt-1.5 flex items-baseline justify-between gap-2">
              <span className="font-mono text-3xl font-bold text-slate-950 tabular-nums">
                {snapshot.wind.visibilityKm.toFixed(1)}
                <span className="ml-1 text-xs font-normal text-slate-500">km</span>
              </span>
              <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums">
                {snapshot.wind.directionLabel} {snapshot.wind.speedKmh} km/h
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 tabular-nums">
              {snapshot.wind.temperatureC.toFixed(1)} °C · RH {snapshot.wind.humidityPct}%
            </p>
          </div>
        </section>

        {/* Primary Split Console: Interactive Singapore Map + Active Sector Telemetry */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 flex flex-col">
            <SingaporePsiMap
              snapshot={snapshot}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              metricMode={metricMode}
              onChangeMetricMode={setMetricMode}
            />
          </div>

          <div className="lg:col-span-5 flex flex-col">
            <RegionTelemetryPanel
              snapshot={snapshot}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
            />
          </div>
        </div>

        {/* 24-Hour Time-Series Comparison Chart */}
        <HourlyTrendChart
          snapshot={snapshot}
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
        />

        {/* Regional Pollutant Matrix Table */}
        <RegionalMatrixTable
          snapshot={snapshot}
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
        />

        {/* Dynamic Health Advisory */}
        <HealthAdvisorySection snapshot={snapshot} selectedRegion={selectedRegion} />
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-slate-200 bg-white mt-8">
        <div className="mx-auto flex max-w-[1380px] flex-wrap items-center justify-between gap-4 px-6 py-4 text-xs text-slate-500">
          <span>
            SG HazeWatch · Singapore 5-region NEA PSI &amp; PM2.5 telemetry
          </span>
          <span>
            Serverless routes: <code className="font-mono text-slate-700">/api/psi</code> &amp;{' '}
            <code className="font-mono text-slate-700">/api/health</code>
          </span>
        </div>
      </footer>

      <ApiConnectionModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        isLiveApi={snapshot.isLiveApi}
        onConnectLiveApi={handleConnectLiveApi}
        onDisconnectToSimulation={handleDisconnectToSimulation}
      />
    </div>
  );
}
