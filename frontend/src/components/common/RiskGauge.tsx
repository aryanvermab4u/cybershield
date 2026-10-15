import React from 'react';

interface RiskGaugeProps {
  score: number;
  size?: number;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, size = 180 }) => {
  const clampedScore = Math.max(0, Math.min(100, score));
  
  // Calculate needle rotation angle (-90 to +90 degrees)
  const angle = -90 + (clampedScore / 100) * 180;

  let color = '#16a34a'; // Lower risk
  let categoryLabel = 'Lower Detected Risk';

  if (clampedScore >= 75) {
    color = '#dc2626'; // Very high
    categoryLabel = 'Very High Risk';
  } else if (clampedScore >= 50) {
    color = '#ea580c'; // High
    categoryLabel = 'High Risk';
  } else if (clampedScore >= 25) {
    color = '#d97706'; // Caution
    categoryLabel = 'Caution';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size * 0.65 }}>
        <svg
          viewBox="0 0 200 125"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#16a34a" />
              <stop offset="30%" stopColor="#d97706" />
              <stop offset="65%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>

          {/* Background Track Arc */}
          <path
            d="M 25 110 A 75 75 0 0 1 175 110"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Colored Gradient Track Arc */}
          <path
            d="M 25 110 A 75 75 0 0 1 175 110"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="14"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Gauge Center Pivot */}
          <circle cx="100" cy="110" r="7" fill="#1e293b" />
          <circle cx="100" cy="110" r="3" fill="#ffffff" />

          {/* Needle Pointer */}
          <g transform={`rotate(${angle} 100 110)`} className="transition-transform duration-700 ease-out">
            <line
              x1="100"
              y1="110"
              x2="100"
              y2="42"
              stroke="#0f172a"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="100" cy="40" r="2.5" fill="#0f172a" />
          </g>

          {/* Score Marks */}
          <text x="22" y="123" fontSize="9" fill="#94a3b8" textAnchor="middle" fontWeight="500">0</text>
          <text x="75" y="44" fontSize="8" fill="#94a3b8" textAnchor="middle" fontWeight="500">25</text>
          <text x="100" y="30" fontSize="8" fill="#94a3b8" textAnchor="middle" fontWeight="500">50</text>
          <text x="125" y="44" fontSize="8" fill="#94a3b8" textAnchor="middle" fontWeight="500">75</text>
          <text x="178" y="123" fontSize="9" fill="#94a3b8" textAnchor="middle" fontWeight="500">100</text>
        </svg>

        {/* Center Score Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1 pointer-events-none">
          <span className="text-3xl font-bold tracking-tight text-surface-900 font-mono">
            {clampedScore}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-surface-500">
            / 100
          </span>
        </div>
      </div>

      <div className="mt-2 text-center">
        <span
          className="text-xs font-semibold px-2.5 py-0.5 rounded-full inline-block"
          style={{
            backgroundColor: `${color}15`,
            color: color,
            border: `1px solid ${color}30`
          }}
        >
          {categoryLabel}
        </span>
      </div>
    </div>
  );
};
