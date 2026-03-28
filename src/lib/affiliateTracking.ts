const STORAGE_KEY = 'je_ref';
const EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Reads ?ref= from the current URL and stores it in localStorage with a timestamp.
 * Called on every page mount by AffiliateTracker (layout).
 * Uses localStorage (not sessionStorage) so the code survives across tabs
 * (e.g. when the user opens an email confirmation link in a new tab).
 */
export function captureAffiliateCode(): void {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  const code = params.get('ref');
  if (code && /^[A-Za-z0-9_-]{1,20}$/.test(code)) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ code: code.toUpperCase(), ts: Date.now() })
      );
    } catch {}
  }
}

/**
 * Returns the affiliate code.
 * Checks URL first (?ref=), then localStorage (set by AffiliateTracker
 * when the user landed on any page with ?ref= earlier).
 * Returns null if the stored code is older than 30 days.
 */
export function getAffiliateCode(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const urlCode = params.get('ref');
  if (urlCode && /^[A-Za-z0-9_-]{1,20}$/.test(urlCode)) {
    return urlCode.toUpperCase();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { code, ts } = JSON.parse(raw);
    if (typeof code === 'string' && typeof ts === 'number' && Date.now() - ts < EXPIRY_MS) {
      return code;
    }
    localStorage.removeItem(STORAGE_KEY);
    return null;
  } catch {
    return null;
  }
}
