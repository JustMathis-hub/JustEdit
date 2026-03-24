'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { UserPlus, ArrowRight, Loader2, CheckCircle, Clock } from 'lucide-react';

interface Props {
  affiliate: { id: string; code: string; status: string; total_earned_cents: number } | null;
  locale: string;
}

export function AffiliateSection({ affiliate, locale }: Props) {
  const t = useTranslations('affiliate');
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleApply = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/affiliate/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) setApplied(true);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  // Already applied (show in previous request)
  if (applied) {
    return (
      <section data-reveal>
        <div className="bg-[oklch(0.10_0_0)] border border-[oklch(0.17_0_0)] rounded-2xl p-6 flex items-center gap-4">
          <Clock size={20} className="text-yellow-400 shrink-0" />
          <div>
            <p className="text-white font-medium text-sm">{t('applicationSent')}</p>
            <p className="text-xs text-[oklch(0.45_0.005_0)]">{t('applicationPending')}</p>
          </div>
        </div>
      </section>
    );
  }

  // Active affiliate — show dashboard link
  if (affiliate?.status === 'active') {
    return (
      <section data-reveal>
        <div className="flex items-center gap-3 mb-5">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[rgba(139,26,26,0.18)] border border-[rgba(139,26,26,0.35)] shadow-[0_0_12px_rgba(139,26,26,0.2)]">
            <h2 className="text-[11px] font-black text-[#e07070] uppercase tracking-[0.18em]">
              {t('sectionTitle')}
            </h2>
          </span>
        </div>
        <div className="bg-[oklch(0.10_0_0)] border border-[oklch(0.17_0_0)] rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[rgba(139,26,26,0.15)] border border-[rgba(139,26,26,0.3)] flex items-center justify-center">
              <CheckCircle size={18} className="text-green-400" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">
                {t('activeAffiliate')} &middot; <code className="text-xs bg-[oklch(0.15_0_0)] px-2 py-0.5 rounded">{affiliate.code}</code>
              </p>
              <p className="text-xs text-[oklch(0.45_0.005_0)]">
                {t('totalEarned')}: {(affiliate.total_earned_cents / 100).toFixed(2)} &euro;
              </p>
            </div>
          </div>
          <Link
            href="/compte/affiliate"
            className="px-4 py-2 text-xs font-medium rounded-lg bg-[rgba(139,26,26,0.15)] text-[#e07070] border border-[rgba(139,26,26,0.3)] hover:bg-[rgba(139,26,26,0.25)] transition-colors flex items-center gap-2"
          >
            {t('viewDashboard')} <ArrowRight size={12} />
          </Link>
        </div>
      </section>
    );
  }

  // Pending affiliate
  if (affiliate?.status === 'pending') {
    return (
      <section data-reveal>
        <div className="bg-[oklch(0.10_0_0)] border border-[oklch(0.17_0_0)] rounded-2xl p-6 flex items-center gap-4">
          <Clock size={20} className="text-yellow-400 shrink-0" />
          <div>
            <p className="text-white font-medium text-sm">{t('applicationPendingTitle')}</p>
            <p className="text-xs text-[oklch(0.45_0.005_0)]">{t('applicationPending')}</p>
          </div>
        </div>
      </section>
    );
  }

  // Paused/rejected — don't show anything
  if (affiliate?.status === 'paused' || affiliate?.status === 'rejected') {
    return null;
  }

  // Not an affiliate — show CTA
  return (
    <section data-reveal>
      <div className="bg-[oklch(0.10_0_0)] border border-[oklch(0.17_0_0)] rounded-2xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[rgba(139,26,26,0.15)] border border-[rgba(139,26,26,0.3)] flex items-center justify-center">
            <UserPlus size={18} className="text-[#e07070]" />
          </div>
          <div>
            <p className="text-white font-medium text-sm">{t('becomeAffiliate')}</p>
            <p className="text-xs text-[oklch(0.45_0.005_0)]">{t('becomeAffiliateDesc')}</p>
          </div>
        </div>
        <button
          onClick={handleApply}
          disabled={loading}
          className="px-4 py-2 text-xs font-medium rounded-lg bg-[rgba(139,26,26,0.15)] text-[#e07070] border border-[rgba(139,26,26,0.3)] hover:bg-[rgba(139,26,26,0.25)] transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <>{t('apply')} <ArrowRight size={12} /></>}
        </button>
      </div>
    </section>
  );
}
