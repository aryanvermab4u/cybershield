import React, { useState } from 'react';
import { Sidebar, PageId } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileDrawer } from './MobileDrawer';

interface AppShellProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  pendingReportsCount?: number;
  isBackendHealthy: boolean;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentPage,
  onNavigate,
  pendingReportsCount = 0,
  isBackendHealthy,
  children,
}) => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-50 font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar
          currentPage={currentPage}
          onNavigate={onNavigate}
          pendingReportsCount={pendingReportsCount}
        />
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        currentPage={currentPage}
        onNavigate={onNavigate}
        pendingReportsCount={pendingReportsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Topbar
          currentPage={currentPage}
          onNavigate={onNavigate}
          onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
          isBackendHealthy={isBackendHealthy}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
