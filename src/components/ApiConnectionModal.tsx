import { X } from 'lucide-react';
import { useState } from 'react';

interface ApiConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLiveApi: boolean;
  onConnectLiveApi: (psiUrl: string, pm25Url: string) => Promise<void>;
  onDisconnectToSimulation: () => void;
}

const DEFAULT_NEA_PSI_URL = 'https://api-open.data.gov.sg/v2/real-time/api/psi';
const DEFAULT_NEA_PM25_URL = 'https://api-open.data.gov.sg/v2/real-time/api/pm25';

export function ApiConnectionModal({
  isOpen,
  onClose,
  isLiveApi,
  onConnectLiveApi,
  onDisconnectToSimulation,
}: ApiConnectionModalProps) {
  const [psiUrl, setPsiUrl] = useState(DEFAULT_NEA_PSI_URL);
  const [pm25Url, setPm25Url] = useState(DEFAULT_NEA_PM25_URL);
  const [isTesting, setIsTesting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

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
          : 'Unable to reach endpoint. Check CORS or endpoint response schema.'
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
              Connect Live Singapore PSI Endpoint
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Frontend adapter is pre-mapped to Data.gov.sg / NEA v2 real-time JSON
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
              24-hr PSI Endpoint URL
            </label>
            <input
              id="psi-endpoint-input"
              type="url"
              required
              value={psiUrl}
              onChange={(e) => setPsiUrl(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="pm25-endpoint-input"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              1-hr PM2.5 Endpoint URL (Optional)
            </label>
            <input
              id="pm25-endpoint-input"
              type="url"
              value={pm25Url}
              onChange={(e) => setPm25Url(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800">
              Expected Adapter Path: <code className="font-mono">src/services/psiAdapter.ts</code>
            </div>
            <p>
              Reads <code className="font-mono">data.items[0].readings.psi_twenty_four_hourly</code>{' '}
              across <code className="font-mono">north, south, east, west, central, national</code>.
            </p>
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
                Revert to Simulation
              </button>
            ) : (
              <span className="text-xs text-slate-400">
                Currently using local frontend simulation
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
                {isTesting ? 'Connecting...' : 'Fetch Live Endpoint'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
