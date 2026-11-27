import { Activity, X } from 'lucide-react';
import { useState } from 'react';
import { type ApiHealthResult, checkApiHealth } from '../services/psiAdapter';

interface ApiConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLiveApi: boolean;
  onConnectLiveApi: (psiUrl: string, pm25Url: string) => Promise<void>;
  onDisconnectToSimulation: () => void;
}

const DEFAULT_SERVERLESS_PSI_URL = '/api/psi';

export function ApiConnectionModal({
  isOpen,
  onClose,
  isLiveApi,
  onConnectLiveApi,
  onDisconnectToSimulation,
}: ApiConnectionModalProps) {
  const [psiUrl, setPsiUrl] = useState(DEFAULT_SERVERLESS_PSI_URL);
  const [pm25Url, setPm25Url] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [healthResult, setHealthResult] = useState<ApiHealthResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleHealthCheck = async () => {
    setErrorMsg(null);
    setIsCheckingHealth(true);
    try {
      const result = await checkApiHealth(true);
      setHealthResult(result);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Unable to reach /api/health.'
      );
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsTesting(true);
    try {
      await onConnectLiveApi(psiUrl.trim(), pm25Url.trim());
      onClose();
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Unable to reach endpoint. Check /api/health or upstream availability.'
      );
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
    >
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2
              id="api-modal-title"
              className="font-display text-base font-semibold text-slate-900"
            >
              Serverless Data.gov.sg Connection
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Proxied via <code className="font-mono">/api/psi</code> to{' '}
              <code className="font-mono">api-open.data.gov.sg</code>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label
              htmlFor="psi-endpoint-input"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              PSI Endpoint URL
            </label>
            <input
              id="psi-endpoint-input"
              type="text"
              required
              value={psiUrl}
              onChange={(e) => setPsiUrl(e.target.value)}
              placeholder="/api/psi"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="pm25-endpoint-input"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Optional Custom 1-hr PM2.5 URL (already merged by /api/psi)
            </label>
            <input
              id="pm25-endpoint-input"
              type="text"
              value={pm25Url}
              onChange={(e) => setPm25Url(e.target.value)}
              placeholder="Leave blank when using /api/psi"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-800">
                Serverless Functions: <code className="font-mono">/api/psi.ts</code> &amp;{' '}
                <code className="font-mono">/api/health.ts</code>
              </span>
              <button
                type="button"
                onClick={handleHealthCheck}
                disabled={isCheckingHealth}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60 cursor-pointer"
              >
                <Activity className="h-3 w-3" aria-hidden="true" />
                <span>{isCheckingHealth ? 'Checking...' : 'Check /api/health'}</span>
              </button>
            </div>

            {healthResult && (
              <div className="border-t border-slate-200 pt-2 font-mono text-[11px] text-slate-700 tabular-nums">
                Status: <strong>{healthResult.status}</strong>
                {healthResult.upstream && (
                  <>
                    {' '}
                    · Upstream:{' '}
                    {healthResult.upstream.reachable
                      ? `Reachable (${healthResult.upstream.latencyMs} ms)`
                      : healthResult.upstream.error || 'Unreachable'}
                  </>
                )}
              </div>
            )}
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
            >
              {errorMsg}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            {isLiveApi ? (
              <button
                type="button"
                onClick={() => {
                  onDisconnectToSimulation();
                  onClose();
                }}
                className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Switch to Simulation
              </button>
            ) : (
              <span className="text-xs text-slate-400">
                Currently using simulation preset
              </span>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isTesting}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60 cursor-pointer"
              >
                {isTesting ? 'Connecting...' : 'Fetch Live PSI'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
