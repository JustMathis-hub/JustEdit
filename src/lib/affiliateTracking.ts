const COOKIE_NAME = 'je_ref';
const COOKIE_DAYS = 30;

/**
 * Read the affiliate code from the je_ref cookie (client-side).
 * Cookie format: CODE|TIMESTAMP
 */
export function getAffiliateCode(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.split('; ').find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  const value = decodeURIComponent(match.split('=')[1] ?? '');
  const [code, ts] = value.split('|');
  if (!code || !ts) return null;
  // Check 30-day expiry
  const setAt = parseInt(ts, 10);
  if (isNaN(setAt) || Date.now() - setAt > COOKIE_DAYS * 24 * 60 * 60 * 1000) return null;
  return code;
}

/**
 * Set the affiliate code cookie (client-side). Last-click attribution.
 */
export function setAffiliateCode(code: string): void {
  if (typeof document === 'undefined') return;
  const value = `${code}|${Date.now()}`;
  const expires = new Date(Date.now() + COOKIE_DAYS * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; path=/; expires=${expires}; SameSite=Lax`;
}

/**
 * Clear the affiliate cookie (client-side).
 */
export function clearAffiliateCode(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}
