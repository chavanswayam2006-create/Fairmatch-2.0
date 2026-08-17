import React, { useState, useEffect } from 'react';
import { HeroLanding } from './components/HeroLanding';
import { FairMatchDashboard } from './components/FairMatchDashboard';
import { PlatformDetailsView } from './components/PlatformDetailsView';
import { PrivacyPolicyView } from './components/PrivacyPolicyView';
import { TermsView } from './components/TermsView';
import { NotFoundView } from './components/NotFoundView';
import { OccupationExplorerView } from './components/OccupationExplorerView';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { StickyMobileCTA } from './components/StickyMobileCTA';
import { updatePageMeta } from './utils/seo';
import { analytics } from './utils/analytics';

export type AppView = 'hero' | 'dashboard' | 'about' | 'privacy' | 'terms' | 'explore-jobs' | '404';

export function App() {
  const [currentView, setCurrentView] = useState<AppView>('hero');
  const [previousView, setPreviousView] = useState<AppView>('hero');
  const [selectedLibraryJob, setSelectedLibraryJob] = useState<any>(null);

  // Update SEO Page Title & Meta Description whenever currentView changes
  useEffect(() => {
    updatePageMeta(currentView);
    analytics.pageView(currentView);
  }, [currentView]);

  const navigateTo = (newView: AppView) => {
    setPreviousView(currentView);
    setCurrentView(newView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalyzeLibraryJob = (jobData: any) => {
    setSelectedLibraryJob(jobData);
    navigateTo('dashboard');
  };

  return (
    <div>
      {currentView === 'hero' ? (
        <HeroLanding
          onOpenDashboard={() => navigateTo('dashboard')}
          onOpenAbout={() => navigateTo('about')}
          onOpenPrivacy={() => navigateTo('privacy')}
          onOpenTerms={() => navigateTo('terms')}
          onExploreJobs={() => navigateTo('explore-jobs')}
        />
      ) : currentView === 'dashboard' ? (
        <FairMatchDashboard
          onBackToHero={() => navigateTo('hero')}
          onOpenAbout={() => navigateTo('about')}
          onExploreJobs={() => navigateTo('explore-jobs')}
          libraryJob={selectedLibraryJob}
          onClearLibraryJob={() => setSelectedLibraryJob(null)}
        />
      ) : currentView === 'about' ? (
        <PlatformDetailsView
          onBack={() => navigateTo(previousView === 'about' ? 'hero' : previousView)}
          onOpenDashboard={() => navigateTo('dashboard')}
        />
      ) : currentView === 'explore-jobs' ? (
        <OccupationExplorerView
          onBack={() => navigateTo('hero')}
          onAnalyzeOccupation={handleAnalyzeLibraryJob}
        />
      ) : currentView === 'privacy' ? (
        <PrivacyPolicyView
          onBack={() => navigateTo(previousView === 'privacy' ? 'hero' : previousView)}
          onOpenDashboard={() => navigateTo('dashboard')}
          onOpenTerms={() => navigateTo('terms')}
        />
      ) : currentView === 'terms' ? (
        <TermsView
          onBack={() => navigateTo(previousView === 'terms' ? 'hero' : previousView)}
          onOpenDashboard={() => navigateTo('dashboard')}
          onOpenPrivacy={() => navigateTo('privacy')}
        />
      ) : (
        <NotFoundView
          onGoHome={() => navigateTo('hero')}
          onOpenDashboard={() => navigateTo('dashboard')}
          onOpenAbout={() => navigateTo('about')}
        />
      )}

      {/* Global Cookie Consent Banner */}
      <CookieConsentBanner onOpenPrivacy={() => navigateTo('privacy')} />

      {/* Mobile Sticky CTA (Only visible on home page on mobile viewports) */}
      {currentView === 'hero' && (
        <StickyMobileCTA onOpenDashboard={() => navigateTo('dashboard')} />
      )}
    </div>
  );
}

export default App;
