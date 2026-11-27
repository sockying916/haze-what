import { getPsiBand, PSI_BANDS } from '../services/psiAdapter';
import type { PsiBandKey, PsiSnapshot, RegionId } from '../types/psi';

interface HealthAdvisorySectionProps {
  snapshot: PsiSnapshot;
  selectedRegion: RegionId;
}

const BAND_ADVISORIES: Record<
  PsiBandKey,
  {
    generalPublic: string;
    vulnerableGroups: string;
    outdoorActivity: string;
    indoorAndMasks: string;
  }
> = {
  good: {
    generalPublic: 'Continue normal daily routines and outdoor commuting without restriction.',
    vulnerableGroups: 'No special precautions required for elderly, children, or respiratory patients.',
    outdoorActivity: 'All school physical education and vigorous outdoor sports may proceed normally.',
    indoorAndMasks: 'Natural cross-ventilation is suitable; respiratory masks are not required.',
  },
  moderate: {
    generalPublic: 'Normal outdoor activities may continue; monitor hourly PM2.5 if haze thickens.',
    vulnerableGroups: 'Individuals with asthma, COPD, or heart conditions should keep reliever medication accessible.',
    outdoorActivity: 'Sustained endurance training can proceed; watch for mild throat or eye irritation.',
    indoorAndMasks: 'N95 masks are not needed for short errands; keep air purifiers on standby.',
  },
  unhealthy: {
    generalPublic: 'Reduce prolonged or strenuous outdoor exertion, especially during afternoon peaks.',
    vulnerableGroups: 'Elderly, pregnant women, and chronic heart/lung patients should minimise outdoor exposure.',
    outdoorActivity: 'Schools and workplaces should scale down intense outdoor drills and move sessions indoors.',
    indoorAndMasks: 'Close windows facing prevailing wind; run HEPA purifiers. Wear N95 if outdoors for hours.',
  },
  'very-unhealthy': {
    generalPublic: 'Avoid prolonged or strenuous outdoor physical exertion across all sectors.',
    vulnerableGroups: 'Remain indoors with doors and windows sealed; seek medical care promptly if breathless.',
    outdoorActivity: 'Cancel outdoor sports events, school field sessions, and non-essential outdoor labour.',
    indoorAndMasks: 'Run indoor HEPA filtration continuously. Properly fitted N95 masks advised for outdoor travel.',
  },
  hazardous: {
    generalPublic: 'Minimise all outdoor activity; postpone outdoor travel wherever possible.',
    vulnerableGroups: 'Stay indoors in air-conditioned or HEPA-filtered rooms at all times.',
    outdoorActivity: 'Suspend outdoor work and outdoor recreational venues immediately.',
    indoorAndMasks: 'Seal indoor gaps, operate HEPA cleaners on high, and wear fitted N95 masks for essential transit.',
  },
};

export function HealthAdvisorySection({
  snapshot,
  selectedRegion,
}: HealthAdvisorySectionProps) {
  const station = snapshot.regions[selectedRegion];
  const band = getPsiBand(station.readings.psi24h);
  const guidance = BAND_ADVISORIES[band.key];

  const pillars = [
    { title: 'General Public', body: guidance.generalPublic },
    { title: 'Vulnerable Groups', body: guidance.vulnerableGroups },
    { title: 'Outdoor Activity & Schools', body: guidance.outdoorActivity },
    { title: 'Indoor Air & N95 Readiness', body: guidance.indoorAndMasks },
  ];

  return (
    <section
      id="advisory"
      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-3.5">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900">
            Health &amp; Activity Advisory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Guidance calibrated to {station.name} · PSI {station.readings.psi24h} (
            <span className="font-semibold" style={{ color: band.accentHex }}>
              {band.label}
            </span>
            )
          </p>
        </div>

        <span className="text-xs text-slate-500">
          Aligned with Singapore MOH / NEA Haze Guidelines
        </span>
      </div>

      {/* 4-column Guidance Grid separated by clean hairlines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
        {pillars.map((pillar) => (
          <div key={pillar.title} className="p-5">
            <h3 className="text-xs font-semibold text-slate-900 mb-2">
              {pillar.title}
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">{pillar.body}</p>
          </div>
        ))}
      </div>

      {/* Reference Band Summary Strip */}
      <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600">
          <span className="font-semibold text-slate-800">NEA Thresholds:</span>
          {PSI_BANDS.map((item) => (
            <span
              key={item.key}
              className={`inline-flex items-center gap-1.5 ${
                item.key === band.key ? 'font-semibold text-slate-950' : ''
              }`}
            >
              <span style={{ color: item.accentHex }} aria-hidden="true">
                {item.glyph}
              </span>
              <span>
                {item.label} ({item.rangeLabel})
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
