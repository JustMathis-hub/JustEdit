'use client';

import { useEffect } from 'react';
import { captureAffiliateCode } from '@/lib/affiliateTracking';

/**
 * Invisible component mounted in the root layout.
 * Captures ?ref= on every page load and persists it in sessionStorage
 * so LicensePurchase can read it even after navigation.
 */
export function AffiliateTracker() {
  useEffect(() => {
    captureAffiliateCode();
  }, []);
  return null;
}
