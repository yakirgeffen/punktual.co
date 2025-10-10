// src/app/RouteTracker.tsx

'use client';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { pageview } from '@/lib/analytics';

export default function RouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    pageview(url); // pushes { event: 'spa_page_view', page_location, page_path, page_title }
  }, [pathname, searchParams]);

  return null;
}
