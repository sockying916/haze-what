import { RefreshCw } from 'lucide-react';

interface TopBarProps {
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function TopBar({ isRefreshing, onRefresh }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1380px] items-center justify-between gap-8 px-6 py-3.5">
        <a
          href="#overview"
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600"
        >
          SG HazeWatch
        </a>

        <nav
          aria-label="Primary sections"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          <a
            href="#overview"
            className="whitespace-nowrap shrink-0 py-1 hover:text-slate-950 hover:underline hover:underline-offset-4 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600"
          >
            Overview
          </a>
          <a
            href="#regional-map"
            className="whitespace-nowrap shrink-0 py-1 hover:text-slate-950 hover:underline hover:underline-offset-4 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600"
          >
            Regional Map
          </a>
          <a
            href="#trend"
            className="whitespace-nowrap shrink-0 py-1 hover:text-slate-950 hover:underline hover:underline-offset-4 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600"
          >
            24h Trend
          </a>
          <a
            href="#advisory"
            className="whitespace-nowrap shrink-0 py-1 hover:text-slate-950 hover:underline hover:underline-offset-4 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600"
          >
            Health Advisory
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-slate-800 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 cursor-pointer"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span>{isRefreshing ? 'Updating...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
