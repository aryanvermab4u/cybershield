import React from 'react';
import { UniversalScanner } from '../components/scanner/UniversalScanner';

interface ScanCentrePageProps {
  onReportClick?: (identifier: string, category: string) => void;
}

export const ScanCentrePage: React.FC<ScanCentrePageProps> = ({ onReportClick }) => {
  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-surface-200">
        <h2 className="text-base font-bold text-surface-900">
          Universal Security Scan Centre
        </h2>
        <p className="text-xs text-surface-500 mt-0.5">
          Unified analysis console. Select a dedicated vector tab or paste any suspicious artifact into Universal Auto mode.
        </p>
      </div>

      <UniversalScanner
        initialTab="auto"
        onReportClick={onReportClick}
      />
    </div>
  );
};
