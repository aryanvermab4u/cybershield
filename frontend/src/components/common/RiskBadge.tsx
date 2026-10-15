import React from 'react';
import { RiskLevel } from '../../types';
import { ShieldCheck, AlertTriangle, ShieldAlert, AlertOctagon, HelpCircle } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md', showIcon = true }) => {
  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = 'Unknown Risk';
  let Icon = HelpCircle;

  switch (level) {
    case 'lower_risk':
      bg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      label = 'Lower Risk';
      Icon = ShieldCheck;
      break;
    case 'caution':
      bg = 'bg-amber-50 text-amber-800 border-amber-200';
      label = 'Caution';
      Icon = AlertTriangle;
      break;
    case 'high_risk':
      bg = 'bg-orange-50 text-orange-800 border-orange-200';
      label = 'High Risk';
      Icon = ShieldAlert;
      break;
    case 'very_high_risk':
      bg = 'bg-rose-50 text-rose-800 border-rose-200';
      label = 'Very High Risk';
      Icon = AlertOctagon;
      break;
    case 'insufficient_evidence':
      bg = 'bg-slate-100 text-slate-700 border-slate-300';
      label = 'Insufficient Evidence';
      Icon = HelpCircle;
      break;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  }[size];

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-md border ${bg} ${sizeClasses} transition-colors`}
    >
      {showIcon && <Icon size={iconSizes} className="shrink-0" />}
      <span>{label}</span>
    </span>
  );
};
