const STORAGE_KEY = 'je_ref';

/**
 * Reads ?ref= from the current URL and stores it in sessionStorage.
 * Called on every page mount by AffiliateTracker (layout).
 */
export function captureAffiliateCode(): void {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  const code = params.get('ref');
  if (code && /^[A-Za-z0-9_-]{1,20}$/.test(code)) {
    try {
      sessionStorage.setItem(STORAGE_KEY, code.toUpperCase());
    } catch {}
  }
}

/**
 * Returns the affiliate code for the current session.
 * Checks URL first (?ref=), then sessionStorage (set by AffiliateTracker
 * when the user landed on any page with ?ref= earlier in the session).
 */
export function getAffiliateCode(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const urlCode = params.get('ref');
  if (urlCode && /^[A-Za-z0-9_-]{1,20}$/.test(urlCode)) {
    return urlCode.toUpperCase();
  }
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
