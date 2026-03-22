'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { setAffiliateCode } from '@/lib/affiliateTracking';

/**
 * Invisible component placed in the locale layout.
 * Reads ?ref=CODE from the URL, sets the affiliate cookie,
 * and fires a non-blocking click-tracking request.
 */
export function AffiliateTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (!ref || ref.length > 50) return;

    // Set cookie (last-click attribution, 30 days)
    setAffiliateCode(ref);

    // Record click (fire-and-forget)
    fetch('/api/affiliate/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: ref,
        landingPage: window.location.pathname,
      }),
    }).catch(() => {});
  }, [searchParams]);

  return null;
}
