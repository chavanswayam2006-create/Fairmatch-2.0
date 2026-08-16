/**
 * Analytics Utility — Privacy-friendly event tracking.
 * Tracks meaningful user interactions without PII.
 * Uses console logging in development, can be wired to an analytics endpoint in production.
 */

type EventCategory = 'navigation' | 'cta' | 'form' | 'analysis' | 'consent';

interface AnalyticsEvent {
  category: EventCategory;
  action: string;
  label?: string;
}

const IS_DEV = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const eventQueue: AnalyticsEvent[] = [];

export function trackEvent(category: EventCategory, action: string, label?: string): void {
  const event: AnalyticsEvent = { category, action, label };

  if (IS_DEV) {
    console.debug('[Analytics]', event);
    return;
  }

  eventQueue.push(event);

  // Batch send every 10 events or after idle
  if (eventQueue.length >= 10) {
    flushEvents();
  }
}

function flushEvents(): void {
  if (eventQueue.length === 0) return;

  // In production, this would POST to an analytics endpoint.
  // For now, we log and clear the queue.
  // Replace with: navigator.sendBeacon('/api/analytics', JSON.stringify(eventQueue));
  const batch = eventQueue.splice(0, eventQueue.length);
  if (IS_DEV) {
    console.debug('[Analytics Flush]', batch);
  }
}

// Flush remaining events on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushEvents();
    }
  });
}

// Pre-built event helpers
export const analytics = {
  ctaClick: (label: string) => trackEvent('cta', 'click', label),
  pageView: (page: string) => trackEvent('navigation', 'page_view', page),
  formSubmit: (form: string) => trackEvent('form', 'submit', form),
  analysisComplete: (jobTitle: string) => trackEvent('analysis', 'complete', jobTitle),
  cookieConsent: (accepted: boolean) => trackEvent('consent', accepted ? 'accepted' : 'declined', 'cookies'),
};
