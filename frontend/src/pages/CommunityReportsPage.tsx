import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { CommunityReport } from '../types';
import { 
  Users, Plus, CheckCircle2, AlertTriangle, ShieldCheck, 
  Clock, ShieldAlert, Check, X, Search, Filter, Loader2, Sparkles, Info
} from 'lucide-react';

interface CommunityReportsPageProps {
  initialIdentifier?: string;
  initialCategory?: string;
}

export const CommunityReportsPage: React.FC<CommunityReportsPageProps> = ({
  initialIdentifier = '',
  initialCategory = ''
}) => {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(!!initialIdentifier);

  // Submission Form State
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [scamType, setScamType] = useState(initialCategory || 'Bank KYC Phishing');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [state, setState] = useState('Delhi');
  const [district, setDistrict] = useState('New Delhi');
  const [description, setDescription] = useState('');
  const [lossAmount, setLossAmount] = useState<number | undefined>();
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Moderation Note Modal
  const [moderatingId, setModeratingId] = useState<number | null>(null);
  const [moderationNote, setModerationNote] = useState('');

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const data = await api.getCommunityReports(statusFilter === 'all' ? undefined : statusFilter);
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await api.createCommunityReport({
        identifier: identifier.trim(),
        scam_type: scamType,
        incident_date: incidentDate,
        location_state: state.trim(),
        location_district: district.trim(),
        description: description.trim(),
        loss_amount: lossAmount,
        evidence_notes: evidenceNotes.trim() || undefined,
      });

      setSuccessMessage('Your report has been submitted for moderation. Sensitive PII (Aadhaar, PAN, phone) has been automatically redacted.');
      setShowSubmitModal(false);
      // Reset form
      setIdentifier('');
      setDescription('');
      setEvidenceNotes('');
      setLossAmount(undefined);
      fetchReports();
    } catch (err: any) {
      alert(err.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModeration = async (reportId: number, newStatus: string) => {
    try {
      await api.updateReportStatus(
        reportId, 
        newStatus, 
        moderationNote.trim() || `Status updated to ${newStatus} by analyst.`
      );
      setModeratingId(null);
      setModerationNote('');
      fetchReports();
    } catch (err: any) {
      alert(err.message || 'Failed to update moderation status');
    }
  };

  const filteredReports = reports.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.identifier.toLowerCase().includes(q) ||
      r.scam_type.toLowerCase().includes(q) ||
      r.location_district.toLowerCase().includes(q) ||
      r.location_state.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-brand-50 text-brand-600">
            <Users size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-surface-900">
              Community Scam Reporting & Moderation Portal
            </h2>
            <p className="text-xs text-surface-500 mt-0.5">
              Crowdsourced incident repository with automatic PII redaction and multi-tier evidence verification.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs shrink-0"
        >
          <Plus size={15} />
          <span>Submit Scam Report</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start justify-between">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 font-bold ml-2">×</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <Search size={16} className="text-surface-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reports by identifier, category, state, district..."
            className="w-full bg-surface-50 border border-surface-200 rounded-lg px-3 py-1.5 text-xs text-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-surface-400" />
          <span className="font-semibold text-surface-700">Moderation State:</span>
          <div className="flex rounded-lg border border-surface-200 p-0.5 bg-surface-50">
            {['all', 'verified', 'reviewed', 'pending', 'rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition-colors ${
                  statusFilter === st
                    ? 'bg-white text-surface-900 shadow-2xs'
                    : 'text-surface-600 hover:text-surface-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-50 border-b border-surface-200 text-surface-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Reported Identifier</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Incident Area</th>
                <th className="px-4 py-3">Description & Redacted Evidence</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3 text-right">Moderation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filteredReports.length > 0 ? (
                filteredReports.map((r) => {
                  let statusBg = 'bg-slate-100 text-slate-800';
                  if (r.status === 'verified') statusBg = 'bg-emerald-100 text-emerald-800';
                  if (r.status === 'reviewed') statusBg = 'bg-blue-100 text-blue-800';
                  if (r.status === 'rejected') statusBg = 'bg-rose-100 text-rose-800';

                  return (
                    <tr key={r.id} className="hover:bg-surface-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-surface-900">
                        {r.identifier}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-surface-800">{r.scam_type}</span>
                        <div className="text-[10px] text-surface-400">{r.incident_date}</div>
                      </td>
                      <td className="px-4 py-3 text-surface-700">
                        {r.location_district}, {r.location_state}
                      </td>
                      <td className="px-4 py-3 max-w-xs sm:max-w-md">
                        <p className="text-surface-800 line-clamp-2 leading-relaxed">
                          {r.description}
                        </p>
                        {r.evidence_notes && (
                          <div className="mt-1 text-[11px] text-surface-500 italic">
                            Evidence: {r.evidence_notes}
                          </div>
                        )}
                        {r.loss_amount && r.loss_amount > 0 && (
                          <div className="mt-0.5 text-[11px] text-rose-600 font-semibold font-mono">
                            Reported Loss: Rs {r.loss_amount.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${statusBg}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-medium text-surface-700">
                        {(r.confidence_score * 100).toFixed(0)}%
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleModeration(r.id, 'verified')}
                            title="Verify Report"
                            className="p-1 hover:bg-emerald-50 text-emerald-600 rounded transition-colors"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleModeration(r.id, 'rejected')}
                            title="Reject Report"
                            className="p-1 hover:bg-rose-50 text-rose-600 rounded transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-surface-400">
                    No community reports found matching current filter parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-surface-200 shadow-xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-surface-100">
              <div className="flex items-center gap-2 text-surface-900 font-bold text-sm">
                <ShieldAlert size={18} className="text-brand-600" />
                <span>Submit Scam Incident Report</span>
              </div>
              <button onClick={() => setShowSubmitModal(false)} className="text-surface-400 hover:text-surface-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-surface-700 mb-1">
                  Suspected Identifier (Phone, UPI ID, URL, or Email)*
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="+91 9876543210 or scam-domain.xyz"
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-surface-700 mb-1">
                    Scam Category*
                  </label>
                  <select
                    value={scamType}
                    onChange={(e) => setScamType(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-50 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option value="Bank KYC Phishing">Bank KYC Phishing</option>
                    <option value="Digital Arrest / Police Impersonation">Digital Arrest / Police Extortion</option>
                    <option value="Electricity Bill Disconnection">Electricity Bill Disconnection</option>
                    <option value="UPI Collect Request Fraud">UPI Collect Request Fraud</option>
                    <option value="Part-Time Telegram Task">Part-Time Telegram Task</option>
                    <option value="Courier / Customs Seizure">Courier / Customs Seizure</option>
                    <option value="Fake Online Shopping">Fake Online Shopping</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-surface-700 mb-1">
                    Incident Date*
                  </label>
                  <input
                    type="date"
                    required
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-50 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-surface-700 mb-1">
                    State (India)*
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Maharashtra, Delhi, Karnataka"
                    className="w-full px-3 py-2 bg-surface-50 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-surface-700 mb-1">
                    District / City*
                  </label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Pune, New Delhi, Bengaluru"
                    className="w-full px-3 py-2 bg-surface-50 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-surface-700 mb-1">
                  Incident Description (Anonymized)*
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what occurred. Personal identifiers (Aadhaar, PAN, phone numbers) will be automatically masked."
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-surface-700 mb-1">
                    Loss Amount (Rs, Optional)
                  </label>
                  <input
                    type="number"
                    value={lossAmount ?? ''}
                    onChange={(e) => setLossAmount(e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-surface-50 border border-surface-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-surface-700 mb-1">
                    Supporting Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={evidenceNotes}
                    onChange={(e) => setEvidenceNotes(e.target.value)}
                    placeholder="e.g. Received via WhatsApp, fake PDF notice"
                    className="w-full px-3 py-2 bg-surface-50 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-surface-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-3 py-2 rounded-lg text-surface-600 hover:bg-surface-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit for Moderation</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
