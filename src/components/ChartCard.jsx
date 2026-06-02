import { useState } from 'react';

const PERIODS = ['1W', '1M', '3M', '6M'];

export default function ChartCard({ title, subtitle, type = 'line', height = '200px' }) {
  const [activePeriod, setActivePeriod] = useState('1M');

  return (
    <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-on-surface leading-snug tracking-tight truncate">{title}</h3>
          {subtitle && (
            <p className="text-[11px] text-on-surface-variant/60 mt-0.5 leading-snug truncate">{subtitle}</p>
          )}
        </div>

        {/* Period selector */}
        <div className="flex gap-1 ml-4 flex-shrink-0 bg-surface-container rounded-lg p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setActivePeriod(p)}
              className={`text-[10px] font-bold px-2.5 py-1.5 rounded-md transition-all duration-200 uppercase tracking-wider ${
                activePeriod === p
                  ? 'bg-primary/15 text-primary shadow-sm'
                  : 'text-on-surface-variant/50 hover:text-on-surface-variant'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div style={{ height }} className="relative w-full">
        {type === 'line' ? (
          <>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradientGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#59de9b" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#59de9b" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="chartGradientGold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#e9c349" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#e9c349" stopOpacity="0" />
                </linearGradient>
                <filter id="chartGlow">
                  <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Subtle grid */}
              {[20, 40, 60, 80].map((y) => (
                <line key={y} x1="0" y1={y} x2="100" y2={y}
                  stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" strokeDasharray="3 3" />
              ))}

              {/* Gold expense line */}
              <path d="M 0 82 Q 25 72 50 62 T 100 52"
                fill="none" stroke="#e9c349" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

              {/* Emerald income fill */}
              <path d="M 0 88 Q 20 55 40 62 T 80 22 T 100 12 L 100 100 L 0 100 Z"
                fill="url(#chartGradientGreen)" />
              {/* Emerald income line */}
              <path d="M 0 88 Q 20 55 40 62 T 80 22 T 100 12"
                fill="none" stroke="#59de9b" strokeWidth="2" strokeLinecap="round"
                filter="url(#chartGlow)" />

              {/* Active dot */}
              <circle cx="80" cy="22" r="3" fill="#59de9b" filter="url(#chartGlow)" />
              <circle cx="80" cy="22" r="5" fill="none" stroke="#59de9b" strokeWidth="0.8" opacity="0.4" />
            </svg>

            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 text-[9px] text-on-surface-variant/40 font-mono">Peak</div>
            <div className="absolute left-0 bottom-0 text-[9px] text-on-surface-variant/40 font-mono">Base</div>

            {/* Legend */}
            <div className="absolute right-0 bottom-0 flex flex-col gap-1 items-end">
              <span className="flex items-center gap-1 text-[9px] text-primary font-bold">
                <span className="w-3 h-0.5 bg-primary rounded inline-block" /> Income
              </span>
              <span className="flex items-center gap-1 text-[9px] text-secondary font-bold">
                <span className="w-3 h-0.5 bg-secondary rounded inline-block" /> Expense
              </span>
            </div>
          </>
        ) : (
          /* Bar chart */
          <div className="flex items-end justify-between w-full h-full gap-1.5 pb-4">
            {[45, 60, 35, 75, 55, 90, 80, 65, 85, 70, 95, 100].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group/bar">
                <div
                  className="w-full rounded-t transition-all duration-300 group-hover/bar:brightness-125"
                  style={{
                    height: `${val}%`,
                    background: `linear-gradient(to top, rgba(89,222,155,0.1), rgba(89,222,155,${0.3 + val / 250}))`,
                  }}
                />
                <span className="text-[8px] text-on-surface-variant/30 mt-1.5 font-mono">
                  {['J','F','M','A','M','J','J','A','S','O','N','D'][idx]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
