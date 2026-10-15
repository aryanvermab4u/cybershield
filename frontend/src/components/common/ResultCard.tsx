import React from 'react';
import { ScanResult } from '../../types';
import { RiskBadge } from './RiskBadge';
import { RiskGauge } from './RiskGauge';
import { SafeNextSteps } from './SafeNextSteps';
import { 
  AlertTriangle, CheckCircle, Info, Shield, 
  MapPin, Clock, Server, ArrowUpRight, Share2, AlertOctagon
} from 'lucide-react';

interface ResultCardProps {
  result: ScanResult;
  onReportClick?: (identifier: string, category: string) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, onReportClick }) => {
  const origin = result.origin_intelligence;

  return (
    <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden transition-all animate-fadeIn">
      {/* Top Header Banner */}
      <div className="px-6 py-4 border-b border-surface-100 bg-surface-50/70 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg border border-surface-200 shadow-2xs">
            <Shield className="text-brand-600" size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-surface-500">
                {result.scan_type} Inspection Analysis
              </span>
              <RiskBadge level={result.risk_level} size="sm" />
            </div>
            <h3 className="text-base font-bold text-surface-900 font-mono mt-0.5 truncate max-w-md">
              {result.input_preview}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-surface-500">
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            <span>Checked: {result.created_at ? new Date(result.created_at).toLocaleTimeString() : 'Just now'}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-surface-100 rounded-md font-medium text-surface-700">
            <span>Evidence: <strong className="capitalize">{result.evidence_quality}</strong></span>
            <span className="text-surface-300">|</span>
            <span>Confidence: <strong>{Math.round(result.confidence * 100)}%</strong></span>
          </div>
        </div>
      </div>

      {/* Main Body Grid */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Gauge & Summary Score */}
        <div className="lg:col-span-4 flex flex-col items-center justify-between p-5 bg-surface-50/50 rounded-xl border border-surface-200/70">
          <div className="w-full text-center">
            <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider block mb-1">
              Risk Score Assessment
            </span>
            <RiskGauge score={result.risk_score} size={190} />
          </div>

          <div className="w-full mt-4 space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-surface-200/60">
              <span className="text-surface-600">Categories Detected:</span>
              <span className="font-semibold text-surface-900 text-right">
                {result.categories.length > 0 ? result.categories.join(', ') : 'None'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-surface-200/60">
              <span className="text-surface-600">Model Confidence:</span>
              <span className="font-semibold text-surface-900">
                {(result.confidence * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-surface-600">Evidence Quality:</span>
              <span className="font-semibold capitalize text-surface-900">
                {result.evidence_quality}
              </span>
            </div>
          </div>

          {onReportClick && (
            <button
              type="button"
              onClick={() => onReportClick(result.input_preview, result.categories[0] || 'Suspected Scam')}
              className="w-full mt-4 flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-surface-100 border border-surface-300 rounded-lg text-xs font-medium text-surface-700 transition-colors shadow-2xs"
            >
              <Share2 size={13} />
              <span>Flag or Report this Target</span>
            </button>
          )}
        </div>

        {/* Right Column: Detailed Explainable Reasons & Findings */}
        <div className="lg:col-span-8 space-y-5">
          {/* Overall Assessment Statement */}
          <div className="p-4 rounded-lg bg-surface-100/60 border border-surface-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-surface-600 mb-1">
              Overall Security Assessment
            </h4>
            <p className="text-sm font-medium text-surface-900 leading-relaxed">
              {result.overall_assessment}
            </p>
          </div>

          {/* Strongest Warning Signs */}
          {result.warning_signs && result.warning_signs.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 mb-2 flex items-center gap-1.5">
                <AlertOctagon size={14} className="text-rose-600" />
                Strongest Warning Signs Detected
              </h4>
              <ul className="space-y-1.5">
                {result.warning_signs.map((sign, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 p-2.5 rounded-md bg-rose-50/70 border border-rose-200/70 text-xs text-rose-950 font-medium"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>{sign}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed Explainable Reasons */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-surface-600 mb-2 flex items-center gap-1.5">
              <Info size={14} className="text-brand-600" />
              Detailed Analytical Reasons
            </h4>
            <div className="space-y-2">
              {result.reasons.map((reason, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-md bg-white border border-surface-200 text-xs text-surface-800"
                >
                  <span className="text-surface-400 font-mono mt-0.5 font-bold">
                    {idx + 1}.
                  </span>
                  <span className="leading-relaxed">{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Origin Intelligence Summary Box if available */}
          {origin && (
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                  <MapPin size={14} className="text-brand-600" />
                  <span>Origin Intelligence ({origin.item_type.toUpperCase()})</span>
                </div>
                <span className="text-[11px] bg-slate-200 px-2 py-0.5 rounded text-slate-700 font-medium">
                  {origin.is_approximate ? 'Approximate Metadata' : 'Verified Metadata'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-slate-700">
                {origin.region_or_circle && (
                  <div>
                    <span className="text-slate-500">Region / Circle: </span>
                    <strong className="text-slate-900">{origin.region_or_circle}</strong>
                  </div>
                )}
                {origin.country && (
                  <div>
                    <span className="text-slate-500">Country: </span>
                    <strong className="text-slate-900">{origin.country}</strong>
                  </div>
                )}
                {origin.isp_or_carrier && (
                  <div>
                    <span className="text-slate-500">Carrier / ISP: </span>
                    <strong className="text-slate-900">{origin.isp_or_carrier}</strong>
                  </div>
                )}
                {origin.hosting_provider && (
                  <div>
                    <span className="text-slate-500">Host: </span>
                    <strong className="text-slate-900">{origin.hosting_provider}</strong>
                  </div>
                )}
                {origin.resolved_ip && (
                  <div>
                    <span className="text-slate-500">IP: </span>
                    <strong className="font-mono text-slate-900">{origin.resolved_ip}</strong>
                  </div>
                )}
              </div>

              {origin.limitations && origin.limitations.length > 0 && (
                <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-200">
                  <span className="font-semibold text-slate-600">Limitations: </span>
                  {origin.limitations[0]}
                </div>
              )}
            </div>
          )}

          {/* Legitimate Explanations & Missing Evidence (Nuance & Scientific Rigor) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.legitimate_explanations && result.legitimate_explanations.length > 0 && (
              <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200/60 text-xs">
                <span className="font-semibold text-emerald-900 flex items-center gap-1 mb-1">
                  <CheckCircle size={13} className="text-emerald-700" />
                  Potential Legitimate Explanations:
                </span>
                <p className="text-emerald-800 leading-relaxed text-[11px]">
                  {result.legitimate_explanations[0]}
                </p>
              </div>
            )}

            {result.missing_evidence && result.missing_evidence.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200/60 text-xs">
                <span className="font-semibold text-amber-900 flex items-center gap-1 mb-1">
                  <AlertTriangle size={13} className="text-amber-700" />
                  Missing Evidence / Unknowns:
                </span>
                <p className="text-amber-800 leading-relaxed text-[11px]">
                  {result.missing_evidence[0]}
                </p>
              </div>
            )}
          </div>

          {/* Actionable Safe Next Steps Checklist */}
          {result.safe_next_actions && result.safe_next_actions.length > 0 && (
            <SafeNextSteps
              actions={result.safe_next_actions}
              riskScore={result.risk_score}
              onReportClick={() =>
                onReportClick &&
                onReportClick(result.input_preview, result.categories[0] || 'Suspected Scam')
              }
            />
          )}

          {/* Disclaimer Footer */}
          <div className="text-[11px] text-surface-400 leading-normal pt-2 border-t border-surface-100">
            <strong>Platform Limitation Notice:</strong> {result.disclaimer}
          </div>
        </div>
      </div>
    </div>
  );
};
