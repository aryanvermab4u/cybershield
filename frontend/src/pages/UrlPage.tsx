import React from 'react';
import { UniversalScanner } from '../components/scanner/UniversalScanner';
import { Globe, Lock, ShieldCheck, AlertCircle } from 'lucide-react';

interface UrlPageProps {
  onReportClick?: (identifier: string, category: string) => void;
}

export const UrlPage: React.FC<UrlPageProps> = ({ onReportClick }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-brand-50 text-brand-600">
            <Globe size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-surface-900">
              Website & URL Safety Inspector
            </h2>
            <p className="text-xs text-surface-500 mt-0.5">
              Probe destination links safely with Server-Side Request Forgery (SSRF) protection, redirect tracing, and lookalike domain detection.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-900">
          <ShieldCheck size={16} className="text-emerald-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-semibold block">Sandboxed Anti-SSRF Architecture:</strong>
            <p className="leading-relaxed">
              CyberShield strictly rejects private IPv4/IPv6 ranges (127.0.0.1, 10.0.0.0/8, 192.168.0.0/16, 172.16.0.0/12), loopback, link-local, and cloud metadata (169.254.169.254). Links are never rendered in your browser and JavaScript is never executed.
            </p>
          </div>
        </div>
      </div>

      <UniversalScanner
        initialTab="url"
        onReportClick={onReportClick}
      />
    </div>
  );
};
