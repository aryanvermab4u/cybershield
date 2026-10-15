import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { OverviewStats } from '../types';
import { PageId } from '../components/layout/Sidebar';
import { 
  ShieldCheck, AlertTriangle, ShieldAlert, AlertOctagon, 
  Scan, PhoneCall, Mail, MessageSquare, Globe, CreditCard, 
  Users, TrendingUp, RefreshCw, ExternalLink, Shield
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area 
} from 'recharts';

interface OverviewPageProps {
  onNavigate: (page: PageId) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const data = await api.getOverviewStats();
      setStats(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Could not load platform metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const scannerShortcuts = [
    { id: 'phone' as PageId, label: 'Phone & Caller', icon: PhoneCall, desc: 'Telecom circle & call pattern heuristics' },
    { id: 'email' as PageId, label: 'Email Security', icon: Mail, desc: 'SPF/DKIM/DMARC & lookalike domain detection' },
    { id: 'message' as PageId, label: 'SMS & WhatsApp', icon: MessageSquare, desc: 'Multilingual Hindi/Hinglish/Marathi engine' },
    { id: 'url' as PageId, label: 'Website & URL', icon: Globe, desc: 'Anti-SSRF destination inspection' },
    { id: 'payment' as PageId, label: 'Payment & UPI', icon: CreditCard, desc: 'VPA validity & PIN-to-receive trap defense' },
    { id: 'hotspots' as PageId, label: 'Scam Hotspot Map', icon: Users, desc: 'Aggregate community cybercrime clusters' },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <RefreshCw size={24} className="text-brand-600 animate-spin" />
        <span className="text-xs text-surface-500 font-medium">
          Loading platform intelligence telemetry...
        </span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2">
        <h3 className="font-bold">Operational Error</h3>
        <p>{error || 'Platform stats unavailable.'}</p>
        <button
          onClick={fetchStats}
          className="px-3 py-1.5 bg-rose-600 text-white rounded font-medium hover:bg-rose-700"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Scans */}
        <div className="p-5 rounded-xl bg-white border border-surface-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-surface-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Scans Run</span>
            <Scan size={18} className="text-brand-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-surface-900 font-mono">
              {stats.total_scans}
            </span>
            <span className="text-xs text-surface-400">inspections</span>
          </div>
          <p className="text-[11px] text-surface-500 pt-1 border-t border-surface-100">
            Across phone, email, messages & web
          </p>
        </div>

        {/* High & Very High Risk */}
        <div className="p-5 rounded-xl bg-white border border-surface-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-surface-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">High Risk Detected</span>
            <AlertOctagon size={18} className="text-rose-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600 font-mono">
              {stats.high_risk_scans}
            </span>
            <span className="text-xs text-rose-600/80">threats identified</span>
          </div>
          <p className="text-[11px] text-surface-500 pt-1 border-t border-surface-100">
            Score ≥ 50 / 100 threshold
          </p>
        </div>

        {/* Caution Scans */}
        <div className="p-5 rounded-xl bg-white border border-surface-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-surface-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Caution Level</span>
            <AlertTriangle size={18} className="text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600 font-mono">
              {stats.caution_scans}
            </span>
            <span className="text-xs text-amber-600/80">suspicious signals</span>
          </div>
          <p className="text-[11px] text-surface-500 pt-1 border-t border-surface-100">
            Score 25 – 49 threshold
          </p>
        </div>

        {/* Lower Risk Scans */}
        <div className="p-5 rounded-xl bg-white border border-surface-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-surface-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Lower Risk</span>
            <ShieldCheck size={18} className="text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 font-mono">
              {stats.lower_risk_scans}
            </span>
            <span className="text-xs text-emerald-600/80">standard patterns</span>
          </div>
          <p className="text-[11px] text-surface-500 pt-1 border-t border-surface-100">
            Score 0 – 24 threshold
          </p>
        </div>
      </div>

      {/* Visual Analytics Charts (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Distribution Pie Chart */}
        <div className="lg:col-span-5 p-5 bg-white rounded-xl border border-surface-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-surface-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-700">
              Risk Level Breakdown
            </h3>
            <span className="text-[11px] text-surface-400">Cumulative Telemetry</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.risk_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {stats.risk_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value} scans`, 'Volume']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-surface-100 text-xs">
            {stats.risk_distribution.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-surface-600 text-[11px] truncate">{item.name}:</span>
                <strong className="text-surface-900 ml-auto font-mono">{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Scam Categories Bar Chart */}
        <div className="lg:col-span-7 p-5 bg-white rounded-xl border border-surface-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-surface-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-700">
              Top Scam Vectors Detected
            </h3>
            <span className="text-[11px] text-surface-400">Classified Signatures</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.category_distribution}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis
                  type="category"
                  dataKey="category"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  width={110}
                />
                <Tooltip
                  formatter={(value: any) => [`${value} instances`, 'Count']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-surface-500 pt-2 border-t border-surface-100">
            Distribution drawn directly from local inspection records and verified community reports.
          </p>
        </div>
      </div>

      {/* 7-Day Activity Trend */}
      <div className="p-5 bg-white rounded-xl border border-surface-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-surface-100">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-brand-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-700">
              Inspection Activity & Threats Over Time (Past 7 Days)
            </h3>
          </div>
          <span className="text-[11px] text-surface-400">Temporal Telemetry</span>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.timeline_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scansGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="threatsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="scans" stroke="#2563eb" fillOpacity={1} fill="url(#scansGrad)" name="Total Scans" strokeWidth={2} />
              <Area type="monotone" dataKey="threats" stroke="#dc2626" fillOpacity={1} fill="url(#threatsGrad)" name="Threats Flagged" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Access to Scanner Modules */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-surface-600">
            Quick Scanner Modules
          </h3>
          <button
            onClick={() => onNavigate('scan-centre')}
            className="text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors"
          >
            Open Universal Console →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scannerShortcuts.map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.id}
                onClick={() => onNavigate(mod.id)}
                className="p-4 rounded-xl bg-white border border-surface-200 hover:border-brand-400 hover:shadow-xs transition-all text-left flex items-start gap-3.5 group"
              >
                <div className="p-2.5 rounded-lg bg-surface-50 group-hover:bg-brand-50 text-surface-600 group-hover:text-brand-600 transition-colors shrink-0">
                  <Icon size={20} />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-surface-900 group-hover:text-brand-700 transition-colors">
                    {mod.label}
                  </h4>
                  <p className="text-[11px] text-surface-500 mt-0.5 line-clamp-2">
                    {mod.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Latest Moderated Community Reports Feed */}
      <div className="p-5 bg-white rounded-xl border border-surface-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-surface-100">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-700">
              Latest Moderated Community Reports
            </h3>
            <p className="text-[11px] text-surface-500">
              Crowdsourced incident reports reviewed under evidence verification guidelines
            </p>
          </div>
          <button
            onClick={() => onNavigate('reports')}
            className="text-xs font-semibold text-brand-600 hover:underline"
          >
            View All Reports ({stats.recent_reports.length})
          </button>
        </div>

        <div className="divide-y divide-surface-100">
          {stats.recent_reports.slice(0, 4).map((rep) => (
            <div key={rep.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-surface-900">
                    {rep.identifier}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-100 text-surface-700">
                    {rep.scam_type}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50">
                    {rep.status}
                  </span>
                </div>
                <p className="text-surface-600 line-clamp-1">
                  {rep.description}
                </p>
              </div>

              <div className="text-[11px] text-surface-400 shrink-0 sm:text-right">
                <div>{rep.location_district}, {rep.location_state}</div>
                <div>{rep.incident_date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
