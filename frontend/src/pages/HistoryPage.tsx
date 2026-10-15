import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { ScanResult } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { ResultCard } from '../components/common/ResultCard';
import { 
  History, Search, Filter, Download, Trash2, 
  Eye, RefreshCw, X, ShieldAlert 
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [historyItems, setHistoryItems] = useState<ScanResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await api.getHistory(
        typeFilter === 'all' ? undefined : typeFilter,
        riskFilter === 'all' ? undefined : riskFilter,
        search.trim() || undefined
      );
      setHistoryItems(data);
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [typeFilter, riskFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleDeleteItem = async (id?: number) => {
    if (!id) return;
    if (!window.confirm('Delete this scan inspection record?')) return;
    try {
      await api.deleteHistoryItem(id);
      setHistoryItems(prev => prev.filter(item => item.id !== id));
      if (selectedScan?.id === id) setSelectedScan(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete record');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear your entire local inspection history? This action cannot be undone.')) return;
    try {
      await api.clearAllHistory();
      setHistoryItems([]);
      setSelectedScan(null);
    } catch (err: any) {
      alert(err.message || 'Failed to clear history');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-brand-50 text-brand-600">
            <History size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-surface-900">
              Inspection Scan History
            </h2>
            <p className="text-xs text-surface-500 mt-0.5">
              Local audit trail of analyzed phone numbers, email headers, messages, and web destinations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={api.getExportCsvUrl()}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-100 hover:bg-surface-200 text-surface-800 text-xs font-semibold rounded-lg border border-surface-300 transition-colors"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </a>

          {historyItems.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200 transition-colors"
            >
              <Trash2 size={14} />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <form onSubmit={handleSearch} className="bg-white p-4 rounded-xl border border-surface-200 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search size={15} className="text-surface-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search targets or keywords..."
            className="w-full bg-surface-50 border border-surface-200 rounded-lg px-3 py-1.5 text-xs text-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-surface-600">Scan Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2 py-1.5 bg-surface-50 border border-surface-200 rounded-lg text-surface-800 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="phone">Phone</option>
              <option value="email">Email</option>
              <option value="message">Message</option>
              <option value="url">URL</option>
              <option value="payment">Payment</option>
              <option value="qr">QR</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-surface-600">Risk Level:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-2 py-1.5 bg-surface-50 border border-surface-200 rounded-lg text-surface-800 focus:outline-none"
            >
              <option value="all">All Levels</option>
              <option value="very_high_risk">Very High Risk</option>
              <option value="high_risk">High Risk</option>
              <option value="caution">Caution</option>
              <option value="lower_risk">Lower Risk</option>
            </select>
          </div>
        </div>
      </form>

      {/* History Table */}
      <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-50 border-b border-surface-200 text-surface-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Target / Preview</th>
                <th className="px-4 py-3">Score & Level</th>
                <th className="px-4 py-3">Categories</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {historyItems.length > 0 ? (
                historyItems.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-50/70 transition-colors">
                    <td className="px-4 py-3 text-surface-400 whitespace-nowrap">
                      {item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3 uppercase font-bold text-[10px] text-surface-600">
                      {item.scan_type}
                    </td>
                    <td className="px-4 py-3 font-mono text-surface-900 max-w-xs truncate">
                      {item.input_preview}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-surface-800">
                          {item.risk_score}
                        </span>
                        <RiskBadge level={item.risk_level} size="sm" />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-surface-600">
                      {item.categories.slice(0, 2).join(', ') || 'General Inspection'}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedScan(item)}
                          className="px-2 py-1 bg-surface-100 hover:bg-brand-50 text-surface-700 hover:text-brand-700 rounded transition-colors flex items-center gap-1"
                        >
                          <Eye size={13} />
                          <span>View Details</span>
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 text-surface-400 hover:text-rose-600 rounded transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-surface-400">
                    No inspection records found. Run a new scan in the Scan Centre to build your history.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-surface-200 shadow-xl max-w-4xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-surface-100">
              <h3 className="text-sm font-bold text-surface-900">
                Inspection Detail View
              </h3>
              <button
                onClick={() => setSelectedScan(null)}
                className="text-surface-400 hover:text-surface-700 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <ResultCard result={selectedScan} />
          </div>
        </div>
      )}
    </div>
  );
};
