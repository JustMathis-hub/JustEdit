'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { X } from 'lucide-react';

// ─── Context ────────────────────────────────────────────────────────────────

interface PromoBannerContextValue {
  isBannerVisible: boolean;
  dismiss: () => void;
}

const PromoBannerContext = createContext<PromoBannerContextValue>({
  isBannerVisible: false,
  dismiss: () => {},
});

export function usePromoBanner() {
  return useContext(PromoBannerContext);
}

// ─── Provider ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'promo-banner-dismissed';
const PROMO_END = new Date('2026-04-14T23:59:59');

export function PromoBannerProvider({ children }: { children: React.ReactNode }) {
  const [isBannerVisible, setIsBannerVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    const expired = new Date() >= PROMO_END;
    if (!dismissed && !expired) {
      setIsBannerVisible(true);
    }
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, '1');
    setIsBannerVisible(false);
  }, []);

  return (
    <PromoBannerContext.Provider value={{ isBannerVisible, dismiss }}>
      {children}
    </PromoBannerContext.Provider>
  );
}

// ─── Countdown hook ──────────────────────────────────────────────────────────

function useCountdown(target: Date) {
  const calc = () => {
    const diff = Math.max(0, target.getTime() - Date.now());
    const days = Math.floor(diff / 86_400_000);
    const hours = Math.floor((diff % 86_400_000) / 3_600_000);
    const minutes = Math.floor((diff % 3_600_000) / 60_000);
    const seconds = Math.floor((diff % 60_000) / 1_000);
    return { days, hours, minutes, seconds, expired: diff === 0 };
  };

  const [time, setTime] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}

// ─── Banner component ────────────────────────────────────────────────────────

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function PromoBanner() {
  const { isBannerVisible, dismiss } = usePromoBanner();
  const t = useTranslations('promoBanner');
  const { days, hours, minutes, seconds, expired } = useCountdown(PROMO_END);

  if (!isBannerVisible || expired) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] h-10 flex items-center"
      style={{ background: 'linear-gradient(90deg, #4a0a12 0%, #8b1a1a 50%, #4a0a12 100%)' }}
    >
      {/* Clickable area */}
      <Link
        href="/boutique"
        className="flex-1 flex items-center justify-center gap-3 h-full text-white text-sm font-medium tracking-wide hover:opacity-90 transition-opacity"
      >
        <span>{t('text')}</span>
        <span className="flex items-center gap-1 text-xs font-mono bg-white/10 px-2 py-0.5 rounded">
          {pad(days)}<span className="opacity-60">j</span>
          {' '}{pad(hours)}<span className="opacity-60">h</span>
          {' '}{pad(minutes)}<span className="opacity-60">m</span>
          {' '}{pad(seconds)}<span className="opacity-60">s</span>
        </span>
      </Link>

      {/* Dismiss button */}
      <button
        onClick={(e) => { e.stopPropagation(); dismiss(); }}
        aria-label={t('close')}
        className="absolute right-3 p-1 text-white/60 hover:text-white transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}
