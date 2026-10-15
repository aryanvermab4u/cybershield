import React from 'react';
import { UniversalScanner } from '../components/scanner/UniversalScanner';
import { CreditCard, AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';

interface PaymentPageProps {
  onReportClick?: (identifier: string, category: string) => void;
}

export const PaymentPage: React.FC<PaymentPageProps> = ({ onReportClick }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-brand-50 text-brand-600">
            <CreditCard size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-surface-900">
              Payment & UPI Fraud Defense Scanner
            </h2>
            <p className="text-xs text-surface-500 mt-0.5">
              Inspect UPI Virtual Payment Addresses (VPAs), collect request strings, and advance-fee transaction demands.
            </p>
          </div>
        </div>

        {/* The Golden Rule of UPI Banner */}
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-950">
          <AlertOctagon size={18} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold text-sm text-rose-900 block">
              The Golden Rule of UPI Safety:
            </strong>
            <p className="leading-relaxed">
              Your UPI PIN is entered <strong>ONLY TO SEND MONEY</strong>. You NEVER need to enter your PIN, approve a collect request, or scan a QR code to receive cashback, rewards, or refunds. Any prompt asking for a PIN to receive funds is 100% fraud.
            </p>
          </div>
        </div>
      </div>

      <UniversalScanner
        initialTab="payment"
        onReportClick={onReportClick}
      />
    </div>
  );
};
