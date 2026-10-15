import React, { useState } from 'react';
import { 
  MapPin, PhoneCall, Mail, Globe, MessageSquare, 
  ShieldAlert, Info, AlertTriangle, CheckCircle, Search, Server
} from 'lucide-react';
import { INDIAN_PREFIX_CIRCLES } from '../utils/constants';

export const OriginIntelligencePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'phone' | 'email' | 'website' | 'sms'>('phone');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample lookup demo data
  const sampleData = {
    phone: {
      entity: '+91 9810123456',
      source: 'Department of Telecommunications (DoT) National Numbering Plan',
      isApproximate: true,
      country: 'India (+91)',
      circle: 'Delhi & NCR Circle (Leading prefix 9810)',
      carrier: 'Bharti Airtel Limited (Initial Allocation)',
      confidence: 0.75,
      limitations: [
        'Mobile Number Portability (MNP) enables subscribers to switch carriers without changing prefix.',
        'Real-time handset GPS or cell-tower triangulation is legally protected and restricted to authorized law enforcement.',
        'Caller ID can be manipulated over VoIP SIP trunking.'
      ]
    },
    email: {
      entity: 'alert@sbi-online-service.top',
      source: 'MTA Received Header Hop Analysis & DNS MX Records',
      isApproximate: true,
      clientIp: '198.51.100.42',
      relayHost: 'mail-relay-02.bulletproof-host.net',
      datacenterGeo: 'Frankfurt, Germany (Approximate Server Location)',
      confidence: 0.65,
      limitations: [
        'The sending IP identifies the outbound SMTP relay server, NOT the scammer’s physical laptop or mobile device.',
        'Commercial VPNs and compromised proxy relays are regularly utilized to mask actor provenance.',
        'Intermediate Received headers from untrusted upstream relays may be fabricated.'
      ]
    },
    website: {
      entity: 'sbi-netbanking-kyc.xyz',
      source: 'Public DNS Recursive Resolution & BGP Autonomous System (ASN)',
      isApproximate: true,
      resolvedIp: '104.21.72.18',
      asnInfo: 'AS13335 (Cloudflare, Inc. Reverse Proxy)',
      datacenterGeo: 'Anycast Distributed Edge Network',
      confidence: 0.70,
      limitations: [
        'Content Delivery Networks (CDNs) and Cloudflare proxies shield the true origin server IP.',
        'Hosting location denotes where web files reside, which has zero legal correlation to the perpetrator’s nationality.'
      ]
    },
    sms: {
      entity: 'AD-SBINB',
      source: 'TRAI Distributed Ledger Technology (DLT) Commercial Header Specification',
      isApproximate: false,
      headerType: 'Promotional / Transactional Commercial Header',
      tsp: 'A = Bharti Airtel (Telecom Service Provider)',
      circle: 'D = Delhi Telecom Circle',
      principalEntity: 'State Bank of India (Registered Enterprise)',
      confidence: 0.90,
      limitations: [
        'TRAI DLT registration verifies sender header assignment, but compromised enterprise SMS APIs have occasionally leaked credentials.',
        'Unregistered messages from 10-digit mobile SIMs possess zero corporate provenance.'
      ]
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-brand-50 text-brand-600">
            <MapPin size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-surface-900">
              Origin & Location Intelligence Console
            </h2>
            <p className="text-xs text-surface-500 mt-0.5">
              Inspect numbering allocations, mail relay hops, DNS server footprints, and TRAI commercial SMS header attribution.
            </p>
          </div>
        </div>

        {/* Ethical / Scientific Disclaimer */}
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-700">
          <Info size={16} className="text-brand-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-semibold block">Data Integrity & Scientific Transparency:</strong>
            <p className="leading-relaxed">
              CyberShield presents technical infrastructure provenance strictly derived from open telecom and network standards. We <strong>never invent fake live GPS device locations</strong>, fabricate physical home addresses, or claim unauthorized access to private telecom CDR logs.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-200 bg-white rounded-t-xl p-1 gap-1">
        {[
          { id: 'phone' as const, label: 'Phone Numbering Circles', icon: PhoneCall },
          { id: 'email' as const, label: 'Email Relay Hops', icon: Mail },
          { id: 'website' as const, label: 'Website DNS & Datacenter', icon: Globe },
          { id: 'sms' as const, label: 'SMS TRAI Headers', icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-brand-50 text-brand-700 border border-brand-200'
                  : 'text-surface-600 hover:bg-surface-50'
              }`}
            >
              <Icon size={15} className={isActive ? 'text-brand-600' : 'text-surface-400'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white p-6 rounded-b-xl border border-surface-200 shadow-sm space-y-6">
        {activeTab === 'phone' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Provenance Card */}
              <div className="p-5 rounded-xl bg-surface-50 border border-surface-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-surface-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-surface-600">
                    Inspected Entity
                  </span>
                  <span className="text-[11px] bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded">
                    Approximate Metadata
                  </span>
                </div>
                <div className="font-mono text-lg font-bold text-surface-900">
                  {sampleData.phone.entity}
                </div>
                <div className="space-y-1.5 text-xs text-surface-700">
                  <div><span className="text-surface-500">Source:</span> {sampleData.phone.source}</div>
                  <div><span className="text-surface-500">Numbering Country:</span> {sampleData.phone.country}</div>
                  <div><span className="text-surface-500">Telecom Circle:</span> <strong className="text-surface-900">{sampleData.phone.circle}</strong></div>
                  <div><span className="text-surface-500">Initial Carrier:</span> {sampleData.phone.carrier}</div>
                  <div><span className="text-surface-500">Provenance Confidence:</span> {(sampleData.phone.confidence * 100).toFixed(0)}%</div>
                </div>
              </div>

              {/* Limitations & Legal Constraints */}
              <div className="p-5 rounded-xl bg-amber-50/50 border border-amber-200 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
                  <AlertTriangle size={15} className="text-amber-700" />
                  <span>Technical Limitations & Caveats</span>
                </div>
                <ul className="space-y-2 text-xs text-amber-900">
                  {sampleData.phone.limitations.map((lim, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                      <span>{lim}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Indian Telecom Circles Reference Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-surface-700 mb-3">
                Indian Mobile Numbering Series (DoT Circle Reference)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
                {Object.entries(INDIAN_PREFIX_CIRCLES).slice(0, 16).map(([prefix, circle]) => (
                  <div key={prefix} className="p-2.5 rounded-lg bg-surface-50 border border-surface-200">
                    <span className="font-mono font-bold text-brand-700 mr-2">+{prefix}</span>
                    <span className="text-surface-700 text-[11px]">{circle}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-surface-50 border border-surface-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-surface-200">
                <span className="text-xs font-bold uppercase tracking-wider text-surface-600">
                  Mail Server Relay Footprint
                </span>
                <span className="text-[11px] bg-slate-200 text-slate-800 font-medium px-2 py-0.5 rounded">
                  Approximate Server Node
                </span>
              </div>
              <div className="font-mono text-sm font-bold text-surface-900 truncate">
                {sampleData.email.entity}
              </div>
              <div className="space-y-2 text-xs text-surface-700">
                <div><span className="text-surface-500">Source:</span> {sampleData.email.source}</div>
                <div><span className="text-surface-500">Client Relay IP:</span> <strong className="font-mono">{sampleData.email.clientIp}</strong></div>
                <div><span className="text-surface-500">MTA Relay Host:</span> <strong className="font-mono">{sampleData.email.relayHost}</strong></div>
                <div><span className="text-surface-500">Datacenter Region:</span> {sampleData.email.datacenterGeo}</div>
                <div><span className="text-surface-500">Confidence:</span> {(sampleData.email.confidence * 100).toFixed(0)}%</div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-amber-50/50 border border-amber-200 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
                <AlertTriangle size={15} className="text-amber-700" />
                <span>Email Header Routing Constraints</span>
              </div>
              <ul className="space-y-2 text-xs text-amber-900">
                {sampleData.email.limitations.map((lim, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                    <span>{lim}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'website' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-surface-50 border border-surface-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-surface-200">
                <span className="text-xs font-bold uppercase tracking-wider text-surface-600">
                  Web Infrastructure Provenance
                </span>
                <span className="text-[11px] bg-slate-200 text-slate-800 font-medium px-2 py-0.5 rounded">
                  DNS Resolution
                </span>
              </div>
              <div className="font-mono text-sm font-bold text-surface-900 truncate">
                {sampleData.website.entity}
              </div>
              <div className="space-y-2 text-xs text-surface-700">
                <div><span className="text-surface-500">Source:</span> {sampleData.website.source}</div>
                <div><span className="text-surface-500">Resolved Anycast IP:</span> <strong className="font-mono">{sampleData.website.resolvedIp}</strong></div>
                <div><span className="text-surface-500">BGP Autonomous System:</span> {sampleData.website.asnInfo}</div>
                <div><span className="text-surface-500">Datacenter Edge:</span> {sampleData.website.datacenterGeo}</div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-amber-50/50 border border-amber-200 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
                <AlertTriangle size={15} className="text-amber-700" />
                <span>Web Hosting Attribution Caveats</span>
              </div>
              <ul className="space-y-2 text-xs text-amber-900">
                {sampleData.website.limitations.map((lim, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                    <span>{lim}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'sms' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-surface-50 border border-surface-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-surface-200">
                <span className="text-xs font-bold uppercase tracking-wider text-surface-600">
                  TRAI Commercial DLT Registry
                </span>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded">
                  Regulatory Standard
                </span>
              </div>
              <div className="font-mono text-lg font-bold text-surface-900">
                {sampleData.sms.entity}
              </div>
              <div className="space-y-2 text-xs text-surface-700">
                <div><span className="text-surface-500">Source:</span> {sampleData.sms.source}</div>
                <div><span className="text-surface-500">Header Classification:</span> {sampleData.sms.headerType}</div>
                <div><span className="text-surface-500">Telecom Provider Code:</span> {sampleData.sms.tsp}</div>
                <div><span className="text-surface-500">Circle Code:</span> {sampleData.sms.circle}</div>
                <div><span className="text-surface-500">Principal Entity:</span> <strong className="text-surface-900">{sampleData.sms.principalEntity}</strong></div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-amber-50/50 border border-amber-200 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
                <AlertTriangle size={15} className="text-amber-700" />
                <span>SMS Sender ID Limitations</span>
              </div>
              <ul className="space-y-2 text-xs text-amber-900">
                {sampleData.sms.limitations.map((lim, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                    <span>{lim}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
