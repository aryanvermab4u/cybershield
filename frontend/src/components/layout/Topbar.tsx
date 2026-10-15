import React from 'react';
import { PageId } from './Sidebar';
import { Menu, PhoneCall, Scan, Activity } from 'lucide-react';

interface TopbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenMobileMenu: () => void;
  isBackendHealthy: boolean;
}

const PAGE_METADATA: Record<PageId, { title: string; subtitle: string }> = {
  landing: { title: 'Product Overview', subtitle: 'Public landing & threat check portal' },
  overview: { title: 'Security Dashboard', subtitle: 'Threat distribution & operational analytics' },
  'scan-centre': { title: 'Universal Scan Centre', subtitle: 'Unified threat intelligence inspection console' },
  phone: { title: 'Phone & Caller Scanner', subtitle: 'Telecom circle, spoofing heuristics & call patterns' },
  email: { title: 'Email Security Analyzer', subtitle: 'Header verification, SPF/DKIM/DMARC & lookalike domains' },
  message: { title: 'SMS & WhatsApp Scanner', subtitle: 'Multilingual fraud detection (English, Hindi, Hinglish, Marathi)' },
  url: { title: 'Website & URL Safety', subtitle: 'Anti-SSRF safe navigation & credential harvesting inspection' },
  payment: { title: 'Payment & UPI Scanner', subtitle: 'VPA verification & PIN-to-receive trap detection' },
  origin: { title: 'Origin & Location Intelligence', subtitle: 'Telecom circles, routing hops & ISP infrastructure' },
  hotspots: { title: 'Scam Hotspot Map', subtitle: 'Aggregate community-reported fraud activity across India' },
  reports: { title: 'Community Reports & Moderation', subtitle: 'Crowdsourced reports with automatic PII redaction' },
  history: { title: 'Inspection Scan History', subtitle: 'Searchable audit log of local inspection records' },
  safety: { title: 'Cyber Safety Centre', subtitle: 'Official helpline 1930 guides & incident response checklists' },
  settings: { title: 'Settings & Privacy Controls', subtitle: 'Data retention preferences & API integration keys' },
};

export const Topbar: React.FC<TopbarProps> = ({
  currentPage,
  onNavigate,
  onOpenMobileMenu,
  isBackendHealthy,
}) => {
  const meta = PAGE_METADATA[currentPage] || { title: 'CyberShield', subtitle: 'Security Intelligence' };

  return (
    <header className="h-16 bg-white border-b border-surface-200 px-4 sm:px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded-lg"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <h2 className="text-base font-bold text-surface-900 leading-tight">
            {meta.title}
          </h2>
          <p className="text-xs text-surface-500 hidden sm:block">
            {meta.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Backend Connectivity Status */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            isBackendHealthy
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
          title={isBackendHealthy ? 'FastAPI Backend Engine Online' : 'Backend Engine Offline'}
        >
          <Activity size={12} className={isBackendHealthy ? 'text-emerald-600' : 'text-rose-600'} />
          <span className="hidden sm:inline">Engine:</span>
          <span>{isBackendHealthy ? 'Connected' : 'Offline'}</span>
        </div>

        {/* Cybercrime Helpline 1930 */}
        <a
          href="tel:1930"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-100 hover:bg-surface-200 text-surface-800 text-xs font-semibold border border-surface-200 transition-colors"
          title="National Cyber Crime Helpline"
        >
          <PhoneCall size={13} className="text-rose-600" />
          <span>Helpline:</span>
          <span className="text-rose-600 font-mono font-bold">1930</span>
        </a>

        {/* Global Quick Scan Action */}
        {currentPage !== 'scan-centre' && (
          <button
            type="button"
            onClick={() => onNavigate('scan-centre')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Scan size={14} />
            <span>New Scan</span>
          </button>
        )}
      </div>
    </header>
  );
};
