import React from 'react';
import { UniversalScanner } from '../components/scanner/UniversalScanner';
import { MessageSquareWarning, Languages, Shield, Info } from 'lucide-react';

interface MessagePageProps {
  onReportClick?: (identifier: string, category: string) => void;
}

export const MessagePage: React.FC<MessagePageProps> = ({ onReportClick }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-brand-50 text-brand-600">
            <MessageSquareWarning size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-surface-900">
              SMS, WhatsApp & Social-Media Fraud Scanner
            </h2>
            <p className="text-xs text-surface-500 mt-0.5">
              Multilingual inspection engine supporting English, Hindi (Devanagari), Marathi, and common Hinglish transcripts.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-surface-600">
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-surface-50 border border-surface-200">
            <Languages size={15} className="text-brand-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-surface-900 block">Multilingual Syntax Engine:</strong>
              <span>Detects Bijli power disconnection (विद्युत बिल), bank account blocking (खाता बंद), and Marathi task scams (दररोज कमवा).</span>
            </div>
          </div>

          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-surface-50 border border-surface-200">
            <Shield size={15} className="text-brand-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-surface-900 block">TRAI DLT Header Compliance:</strong>
              <span>Flags corporate alerts sent via personal 10-digit mobile SIMs instead of approved 6-character TRAI commercial headers.</span>
            </div>
          </div>
        </div>
      </div>

      <UniversalScanner
        initialTab="message"
        onReportClick={onReportClick}
      />
    </div>
  );
};
