'use client';
import { useEffect } from 'react';
import { trackTrafficSource, pageview } from '@/lib/analytics';

export default function TrafficTracker(): null {
  useEffect(() => {
    // Track traffic source and page view when component mounts
    trackTrafficSource();
    pageview(window.location.pathname);
  }, []);

  return null; // This component doesn't render anything
}