import React from 'react';
import { UniversalScanner } from '../components/scanner/UniversalScanner';
import { PhoneCall, ShieldAlert, AlertTriangle, Info } from 'lucide-react';

interface PhonePageProps {
  onReportClick?: (identifier: string, category: string) => void;
}

export const PhonePage: React.FC<PhonePageProps> = ({ onReportClick }) => {
  return (
    <div className="space-y-6">
      {/* Information Header */}
      <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-brand-50 text-brand-600">
            <PhoneCall size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-surface-900">
              Phone Number & Call Description Scanner
            </h2>
            <p className="text-xs text-surface-500 mt-0.5">
              Inspect telephone numbering formats, Indian telecom circle allocation, known call description heuristics, and spoofing patterns.
            </p>
          </div>
        </div>

        {/* Critical Disclaimer Banner on Caller ID Spoofing */}
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
          <AlertTriangle size={16} className="text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-semibold block">Critical Note on Caller ID Spoofing:</strong>
            <p className="leading-relaxed">
              Legitimate telephone numbers can be forged on your handset display using VoIP SIP trunking. Even if an incoming call displays an official police station or bank number, never disclose OTPs, PINs, or accept Skype video call trial demands.
            </p>
          </div>
        </div>
      </div>

      {/* Embedded Scanner focused on Phone */}
      <UniversalScanner
        initialTab="phone"
        onReportClick={onReportClick}
      />
    </div>
  );
};
