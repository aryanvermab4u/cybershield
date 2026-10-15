import React from 'react';
import { UniversalScanner } from '../components/scanner/UniversalScanner';
import { Mail, ShieldCheck, FileText, Info } from 'lucide-react';

interface EmailPageProps {
  onReportClick?: (identifier: string, category: string) => void;
}

export const EmailPage: React.FC<EmailPageProps> = ({ onReportClick }) => {
  return (
    <div className="space-y-6">
      {/* Information Header */}
      <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-brand-50 text-brand-600">
            <Mail size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-surface-900">
              Email Security & Header Cryptographic Analyzer
            </h2>
            <p className="text-xs text-surface-500 mt-0.5">
              Analyze sender addresses, display-name spoofing, lookalike domains, Reply-To mismatches, and raw RFC 5322 headers for SPF, DKIM, and DMARC alignment.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-700">
          <Info size={16} className="text-brand-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Authentication Principle:</strong> Passing SPF, DKIM, and DMARC proves domain sending authorization, but does not guarantee the email content is safe or honest. If raw headers are omitted, cryptographic checks are accurately marked as "Not checked".
          </p>
        </div>
      </div>

      <UniversalScanner
        initialTab="email"
        onReportClick={onReportClick}
      />
    </div>
  );
};
