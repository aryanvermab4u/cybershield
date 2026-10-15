import React from 'react';
import { 
  Shield, LayoutDashboard, Scan, PhoneCall, MailCheck, 
  MessageSquareWarning, Globe, CreditCard, MapPin, 
  Map, Users, History, ShieldAlert, Settings, ExternalLink
} from 'lucide-react';

export type PageId = 
  | 'landing'
  | 'overview'
  | 'scan-centre'
  | 'phone'
  | 'email'
  | 'message'
  | 'url'
  | 'payment'
  | 'origin'
  | 'hotspots'
  | 'reports'
  | 'history'
  | 'safety'
  | 'settings';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  pendingReportsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, pendingReportsCount = 0 }) => {
  const navItems = [
    { id: 'overview' as PageId, label: 'Overview', icon: LayoutDashboard },
    { id: 'scan-centre' as PageId, label: 'Scan Centre', icon: Scan },
    { id: 'phone' as PageId, label: 'Phone & Caller', icon: PhoneCall },
    { id: 'email' as PageId, label: 'Email Security', icon: MailCheck },
    { id: 'message' as PageId, label: 'Message Scanner', icon: MessageSquareWarning },
    { id: 'url' as PageId, label: 'Website & URL', icon: Globe },
    { id: 'payment' as PageId, label: 'Payment & UPI', icon: CreditCard },
    { id: 'origin' as PageId, label: 'Origin Intelligence', icon: MapPin },
    { id: 'hotspots' as PageId, label: 'Scam Hotspot Map', icon: Map },
    { 
      id: 'reports' as PageId, 
      label: 'Community Reports', 
      icon: Users,
      badge: pendingReportsCount > 0 ? pendingReportsCount : undefined 
    },
    { id: 'history' as PageId, label: 'Scan History', icon: History },
    { id: 'safety' as PageId, label: 'Safety Centre', icon: ShieldAlert },
    { id: 'settings' as PageId, label: 'Settings & Privacy', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-surface-200 flex flex-col h-screen shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-surface-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-sm shrink-0">
          <Shield size={22} className="stroke-[2.2]" />
        </div>
        <div className="overflow-hidden">
          <h1 className="text-sm font-bold tracking-tight text-surface-900 leading-none">
            CyberShield
          </h1>
          <p className="text-[11px] font-medium text-surface-500 mt-1 truncate">
            Cyber Fraud Intelligence
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-surface-400 px-3 py-1">
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-700 font-semibold'
                  : 'text-surface-700 hover:bg-surface-100 hover:text-surface-900'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon size={16} className={isActive ? 'text-brand-600' : 'text-surface-400'} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer: Public Landing Toggle & Help */}
      <div className="p-3 border-t border-surface-100 space-y-2 bg-surface-50/50">
        <button
          onClick={() => onNavigate('landing')}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-surface-600 hover:bg-surface-100 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink size={14} className="text-surface-400" />
            <span>Product Landing Page</span>
          </span>
          <span className="text-[10px] bg-surface-200 text-surface-700 px-1.5 py-0.5 rounded">
            Public
          </span>
        </button>

        <div className="px-3 py-2 rounded-lg bg-surface-100/70 border border-surface-200/70 text-[11px] text-surface-600">
          <div className="font-semibold text-surface-900 flex items-center justify-between">
            <span>India Cyber Helpline</span>
            <span className="text-rose-600 font-bold font-mono">1930</span>
          </div>
          <p className="text-[10px] text-surface-500 mt-0.5">
            Financial cyber fraud immediate reporting
          </p>
        </div>
      </div>
    </aside>
  );
};
