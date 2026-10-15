import React from 'react';
import { PageId } from './Sidebar';
import { 
  X, Shield, LayoutDashboard, Scan, PhoneCall, MailCheck, 
  MessageSquareWarning, Globe, CreditCard, MapPin, 
  Map, Users, History, ShieldAlert, Settings, ExternalLink
} from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  pendingReportsCount?: number;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currentPage,
  onNavigate,
  pendingReportsCount = 0,
}) => {
  if (!isOpen) return null;

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

  const handleSelect = (id: PageId) => {
    onNavigate(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-72 max-w-[80vw] bg-white h-full flex flex-col z-10 shadow-xl">
        <div className="p-4 border-b border-surface-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <Shield size={20} />
            </div>
            <span className="font-bold text-surface-900 text-sm">CyberShield</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-surface-400 hover:text-surface-700 rounded-md"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : 'text-surface-700 hover:bg-surface-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-brand-600' : 'text-surface-400'} />
                  <span>{item.label}</span>
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

        <div className="p-3 border-t border-surface-200">
          <button
            onClick={() => handleSelect('landing')}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-surface-600 hover:bg-surface-100 rounded-lg"
          >
            <ExternalLink size={15} />
            <span>Product Landing Page</span>
          </button>
        </div>
      </div>
    </div>
  );
};
