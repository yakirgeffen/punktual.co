// src/lib/analytics.js
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Track page views
export const pageview = (url) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Track custom events
export const event = ({ action, category, label, value }) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track traffic sources with UTM parameters
export const trackTrafficSource = () => {
    console.log('trackTrafficSource called');
    if (typeof window === 'undefined') return;
  
  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get('utm_source');
  const utmMedium = urlParams.get('utm_medium');
  const utmCampaign = urlParams.get('utm_campaign');

    console.log('UTM params:', { utmSource, utmMedium, utmCampaign });
  
  // Track UTM parameters if present
  if (utmSource || utmMedium || utmCampaign) {
    console.log('Sending gtag event');
    event({
      action: 'traffic_source',
      category: 'acquisition',
      label: `${utmSource || 'direct'}_${utmMedium || 'none'}_${utmCampaign || 'none'}`,
    });
  }
};

// Track conversions (button creation, user signup, etc.)
export const trackConversion = (conversionType, value = 1) => {
  console.log('Tracking conversion:', conversionType);
  event({
    action: 'conversion',
    category: 'business_goal',
    label: conversionType,
    value: value,
  });
};

// Push a custom event to the dataLayer
export const dlPush = (event, params = {}) => {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
};

// 1) SIGN UP
export const trackSignUp = (method = 'email') => {
  dlPush('sign_up', { method });
};

// 2) CALENDAR LINK CLICK
//    provider: 'google' | 'apple' | 'outlook' | 'ical' | etc.
//    placement: 'hero' | 'footer' | 'generator' | etc.
export const trackCalendarLinkClick = (provider, placement) => {
  dlPush('calendar_link_click', { calendar_provider: provider, placement });
};

// 3) EVENT CREATED (when a user generates an Add-to-Calendar button)
export const trackCalendarEventCreated = (context = 'generator') => {
  dlPush('calendar_event_created', { context });
};