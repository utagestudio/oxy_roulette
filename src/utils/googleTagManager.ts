export type TrackingConsent = 'unknown' | 'granted' | 'denied';

export const TRACKING_CONSENT_STORAGE_KEY = 'stellar-picker-tracking-consent';

const GTM_SCRIPT_ID = 'google-tag-manager-script';
const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export const getGoogleTagManagerId = (): string => {
  const rawId = import.meta.env.VITE_GTM_ID || import.meta.env.VITE_GTAG_ID || '';
  const id = rawId.trim().toUpperCase();

  if (!id) {
    return '';
  }

  if (!GTM_ID_PATTERN.test(id)) {
    console.warn('VITE_GTM_ID must be a Google Tag Manager container ID such as GTM-XXXXXXX.');
    return '';
  }

  return id;
};

export const loadTrackingConsent = (): TrackingConsent => {
  const stored = window.localStorage.getItem(TRACKING_CONSENT_STORAGE_KEY);

  if (stored === 'granted' || stored === 'denied') {
    return stored;
  }

  return 'unknown';
};

export const saveTrackingConsent = (consent: Exclude<TrackingConsent, 'unknown'>): void => {
  window.localStorage.setItem(TRACKING_CONSENT_STORAGE_KEY, consent);
};

export const clearTrackingConsent = (): void => {
  window.localStorage.removeItem(TRACKING_CONSENT_STORAGE_KEY);
};

export const loadGoogleTagManager = (containerId: string): void => {
  if (!containerId || document.getElementById(GTM_SCRIPT_ID)) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js',
  });

  const script = document.createElement('script');
  script.id = GTM_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}`;
  document.head.appendChild(script);
};
