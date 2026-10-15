import React, { useState } from 'react';
import { CheckCircle2, Circle, ShieldAlert, PhoneCall, ExternalLink } from 'lucide-react';

interface SafeNextStepsProps {
  actions: string[];
  riskScore: number;
  onReportClick?: () => void;
}

export const SafeNextSteps: React.FC<SafeNextStepsProps> = ({ actions, riskScore, onReportClick }) => {
  const [completed, setCompleted] = useState<Record<number, boolean>>({});

  const toggleCheck = (idx: number) => {
    setCompleted(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const isHighRisk = riskScore >= 50;

  return (
    <div className={`rounded-lg border p-4 ${isHighRisk ? 'bg-rose-50/40 border-rose-200' : 'bg-surface-50 border-surface-200'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert size={18} className={isHighRisk ? 'text-rose-600' : 'text-brand-600'} />
          <h4 className="text-sm font-semibold text-surface-900">
            Recommended Safe Actions
          </h4>
        </div>
        <span className="text-xs text-surface-500">
          Check off actions as completed
        </span>
      </div>

      <div className="space-y-2.5">
        {actions.map((act, idx) => {
          const isDone = !!completed[idx];
          return (
            <div
              key={idx}
              onClick={() => toggleCheck(idx)}
              className={`flex items-start gap-2.5 p-2 rounded-md cursor-pointer transition-colors text-xs leading-relaxed ${
                isDone
                  ? 'bg-emerald-50/80 text-emerald-900 line-through'
                  : 'bg-white hover:bg-surface-100 text-surface-800 border border-surface-200/80'
              }`}
            >
              <button
                type="button"
                className="mt-0.5 text-surface-400 hover:text-emerald-600 shrink-0"
              >
                {isDone ? (
                  <CheckCircle2 size={16} className="text-emerald-600" />
                ) : (
                  <Circle size={16} />
                )}
              </button>
              <span className="select-none">{act}</span>
            </div>
          );
        })}
      </div>

      {isHighRisk && (
        <div className="mt-4 pt-3 border-t border-rose-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-rose-800 font-medium">
            <PhoneCall size={14} className="text-rose-600 shrink-0" />
            <span>National Cybercrime Helpline:</span>
            <a
              href="tel:1930"
              className="bg-rose-600 text-white px-2 py-0.5 rounded font-mono font-bold hover:bg-rose-700 transition-colors"
            >
              1930
            </a>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://cybercrime.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-brand-700 hover:text-brand-900 font-medium hover:underline"
            >
              Official Portal (cybercrime.gov.in)
              <ExternalLink size={12} />
            </a>
            {onReportClick && (
              <button
                type="button"
                onClick={onReportClick}
                className="bg-surface-900 hover:bg-surface-800 text-white px-2.5 py-1 rounded text-xs font-medium transition-colors ml-2"
              >
                Submit Community Report
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
