import React, { useState } from 'react';
import { api } from '../api/client';
import { Settings, Shield, Key, Database, Trash2, CheckCircle2, Info, Lock } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [retentionDays, setRetentionDays] = useState('30');
  const [autoRedactPii, setAutoRedactPii] = useState(true);
  const [saveLocalHistory, setSaveLocalHistory] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSavePreferences = () => {
    localStorage.setItem('cybershield_retention', retentionDays);
    localStorage.setItem('cybershield_redact_pii', String(autoRedactPii));
    localStorage.setItem('cybershield_save_history', String(saveLocalHistory));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Delete all scan records stored in local database?')) return;
    try {
      await api.clearAllHistory();
      alert('All local scan history successfully purged.');
    } catch (err: any) {
      alert(err.message || 'Failed to clear history');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-brand-50 text-brand-600">
            <Settings size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-surface-900">
              Settings & Privacy Preferences
            </h2>
            <p className="text-xs text-surface-500 mt-0.5">
              Control local data retention, PII scrubbing parameters, and view external threat API connection statuses.
            </p>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>Preferences updated successfully!</span>
        </div>
      )}

      {/* Privacy & Retention Controls */}
      <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-surface-100 text-surface-900 font-bold text-xs uppercase tracking-wider">
          <Lock size={15} className="text-brand-600" />
          <span>Data Privacy & Storage Controls</span>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-50 border border-surface-200">
            <div>
              <strong className="text-surface-900 block font-semibold">
                Automatic PII Redaction
              </strong>
              <p className="text-surface-500 text-[11px] mt-0.5">
                Automatically masks Indian phone numbers, 12-digit Aadhaar, and PAN cards in community submissions.
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoRedactPii}
              onChange={(e) => setAutoRedactPii(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded border-surface-300"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-50 border border-surface-200">
            <div>
              <strong className="text-surface-900 block font-semibold">
                Save Scan History Locally
              </strong>
              <p className="text-surface-500 text-[11px] mt-0.5">
                Records inspection results in local SQLite database for personal review and CSV export.
              </p>
            </div>
            <input
              type="checkbox"
              checked={saveLocalHistory}
              onChange={(e) => setSaveLocalHistory(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded border-surface-300"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-50 border border-surface-200">
            <div>
              <strong className="text-surface-900 block font-semibold">
                Data Retention Window
              </strong>
              <p className="text-surface-500 text-[11px] mt-0.5">
                Duration to persist completed scans before automatic purging.
              </p>
            </div>
            <select
              value={retentionDays}
              onChange={(e) => setRetentionDays(e.target.value)}
              className="px-3 py-1.5 bg-white border border-surface-300 rounded-lg text-surface-800 text-xs focus:outline-none"
            >
              <option value="7">7 Days</option>
              <option value="30">30 Days</option>
              <option value="90">90 Days</option>
              <option value="forever">Indefinite (Local Dev)</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleClearHistory}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-medium border border-rose-200 transition-colors"
            >
              <Trash2 size={14} />
              <span>Purge All Local History</span>
            </button>

            <button
              type="button"
              onClick={handleSavePreferences}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg transition-colors shadow-xs"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>

      {/* External Integration Configuration Status */}
      <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-surface-100">
          <div className="flex items-center gap-2 text-surface-900 font-bold text-xs uppercase tracking-wider">
            <Key size={15} className="text-brand-600" />
            <span>Threat Intelligence API Integration Status</span>
          </div>
          <span className="text-[11px] text-surface-400">Environment Config</span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-lg bg-surface-50 border border-surface-200 flex items-center justify-between">
            <div>
              <strong className="text-surface-900 block font-semibold">Google Safe Browsing API (v4)</strong>
              <span className="text-[11px] text-surface-500">Global URL malware and phishing intelligence</span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
              Heuristic Fallback Active
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-surface-50 border border-surface-200 flex items-center justify-between">
            <div>
              <strong className="text-surface-900 block font-semibold">DoT National Numbering Allocation</strong>
              <span className="text-[11px] text-surface-500">Indian Department of Telecommunications circle metadata</span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
              Local Registry Embedded
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-surface-50 border border-surface-200 flex items-center justify-between">
            <div>
              <strong className="text-surface-900 block font-semibold">Anti-SSRF Network Resolver</strong>
              <span className="text-[11px] text-surface-500">Private IP, loopback, and cloud metadata filter</span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
              Active Protection
            </span>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-surface-50 border border-surface-200 text-xs text-surface-600 space-y-2">
          <strong className="text-surface-900 font-semibold block">Administrator Setup Instructions:</strong>
          <p className="text-[11px] leading-relaxed">
            To integrate optional live Google Safe Browsing or VirusTotal API keys, define the environment variables in your backend environment:
          </p>
          <pre className="p-2.5 bg-surface-900 text-emerald-400 rounded-lg font-mono text-[11px] overflow-x-auto">
{`GOOGLE_SAFE_BROWSING_API_KEY="your-google-api-key"
VIRUSTOTAL_API_KEY="your-virustotal-api-key"
DATABASE_URL="sqlite+aiosqlite:///./cybershield.db"`}
          </pre>
        </div>
      </div>
    </div>
  );
};
