import React, { useState, useEffect } from 'react';
import { api } from './api/client';
import { PageId } from './components/layout/Sidebar';
import { AppShell } from './components/layout/AppShell';

// Pages
import { LandingPage } from './pages/LandingPage';
import { OverviewPage } from './pages/OverviewPage';
import { ScanCentrePage } from './pages/ScanCentrePage';
import { PhonePage } from './pages/PhonePage';
import { EmailPage } from './pages/EmailPage';
import { MessagePage } from './pages/MessagePage';
import { UrlPage } from './pages/UrlPage';
import { PaymentPage } from './pages/PaymentPage';
import { OriginIntelligencePage } from './pages/OriginIntelligencePage';
import { HotspotMapPage } from './pages/HotspotMapPage';
import { CommunityReportsPage } from './pages/CommunityReportsPage';
import { HistoryPage } from './pages/HistoryPage';
import { SafetyCentrePage } from './pages/SafetyCentrePage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('overview');
  const [isBackendHealthy, setIsBackendHealthy] = useState(false);
  const [pendingReportsCount, setPendingReportsCount] = useState(0);

  // Pre-fill state when transferring from a scan result to Community Reports
  const [reportPrefill, setReportPrefill] = useState<{ identifier: string; category: string } | null>(null);

  // Initial health check
  useEffect(() => {
    api.checkHealth()
      .then((res) => {
        if (res.status === 'healthy') setIsBackendHealthy(true);
      })
      .catch(() => setIsBackendHealthy(false));

    api.getCommunityReports('pending')
      .then((reps) => setPendingReportsCount(reps.length))
      .catch(() => {});
  }, []);

  const handleNavigate = (page: PageId) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReportClick = (identifier: string, category: string) => {
    setReportPrefill({ identifier, category });
    setCurrentPage('reports');
  };

  const handleQuickAnalyzeFromLanding = (input: string) => {
    setCurrentPage('scan-centre');
  };

  // If on landing page, display standalone product homepage
  if (currentPage === 'landing') {
    return (
      <LandingPage
        onEnterApp={(target) => handleNavigate(target || 'overview')}
        onQuickAnalyze={handleQuickAnalyzeFromLanding}
      />
    );
  }

  return (
    <AppShell
      currentPage={currentPage}
      onNavigate={handleNavigate}
      pendingReportsCount={pendingReportsCount}
      isBackendHealthy={isBackendHealthy}
    >
      {currentPage === 'overview' && <OverviewPage onNavigate={handleNavigate} />}
      {currentPage === 'scan-centre' && <ScanCentrePage onReportClick={handleReportClick} />}
      {currentPage === 'phone' && <PhonePage onReportClick={handleReportClick} />}
      {currentPage === 'email' && <EmailPage onReportClick={handleReportClick} />}
      {currentPage === 'message' && <MessagePage onReportClick={handleReportClick} />}
      {currentPage === 'url' && <UrlPage onReportClick={handleReportClick} />}
      {currentPage === 'payment' && <PaymentPage onReportClick={handleReportClick} />}
      {currentPage === 'origin' && <OriginIntelligencePage />}
      {currentPage === 'hotspots' && <HotspotMapPage />}
      {currentPage === 'reports' && (
        <CommunityReportsPage
          initialIdentifier={reportPrefill?.identifier || ''}
          initialCategory={reportPrefill?.category || ''}
        />
      )}
      {currentPage === 'history' && <HistoryPage />}
      {currentPage === 'safety' && <SafetyCentrePage />}
      {currentPage === 'settings' && <SettingsPage />}
    </AppShell>
  );
};

export default App;
