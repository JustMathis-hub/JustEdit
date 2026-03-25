'use client';

import { useState } from 'react';
import { Copy, Check, TrendingUp, DollarSign, Clock, BadgeCheck } from 'lucide-react';
import type { Affiliate, AffiliateCommission, Product } from '@/types';

interface Props {
  affiliate: Affiliate;
  commissions: (AffiliateCommission & { product: Product })[];
  locale: string;
}

const fmt = (cents: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(cents / 100);

const fmtDate = (iso: string, locale: string) =>
  new Date(iso).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const STATUS_LABEL: Record<string, { fr: string; en: string; color: string }> = {
  pending:  { fr: 'En attente', en: 'Pending',  color: 'rgba(200,160,40,0.9)' },
  approved: { fr: 'Approuvée',  en: 'Approved', color: 'rgba(40,180,100,0.9)' },
  paid:     { fr: 'Versée',     en: 'Paid',      color: 'rgba(40,140,220,0.9)' },
  rejected: { fr: 'Rejetée',    en: 'Rejected',  color: 'rgba(200,60,60,0.9)' },
};

export function AffiliateDashboard({ affiliate, commissions, locale }: Props) {
  const [copied, setCopied] = useState(false);
  const siteUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://justedit.store';
  const affiliateLink = `${siteUrl}/boutique?ref=${affiliate.code}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(affiliateLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const pendingCents = affiliate.total_earned_cents - affiliate.total_paid_cents;
  const totalSales = commissions.length;
  const totalRevenue = commissions.reduce((s, c) => s + c.sale_amount_cents, 0);

  const t = (fr: string, en: string) => locale === 'fr' ? fr : en;

  const stats = [
    {
      icon: TrendingUp,
      label: t('Ventes générées', 'Sales generated'),
      value: totalSales.toString(),
      sub: t(`${totalRevenue > 0 ? fmt(totalRevenue) + ' de CA' : '—'}`, `${totalRevenue > 0 ? fmt(totalRevenue) + ' revenue' : '—'}`),
    },
    {
      icon: DollarSign,
      label: t('Commissions gagnées', 'Total earned'),
      value: fmt(affiliate.total_earned_cents),
      sub: t(`Taux : ${affiliate.commission_rate}%`, `Rate: ${affiliate.commission_rate}%`),
    },
    {
      icon: Clock,
      label: t('En attente', 'Pending payout'),
      value: fmt(pendingCents),
      sub: t('Non encore versé', 'Not yet paid out'),
    },
    {
      icon: BadgeCheck,
      label: t('Déjà versé', 'Already paid'),
      value: fmt(affiliate.total_paid_cents),
      sub: t('Total versé à ce jour', 'Total paid to date'),
    },
  ];

  return (
    <div className="relative min-h-screen pt-24 pb-20 overflow-hidden">

      {/* Background — même DA que /compte */}
      <div className="absolute inset-0 bg-[oklch(0.07_0_0)]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8b1a1a] to-transparent opacity-60" />
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,26,26,0.8) 0%, transparent 65%)' }} />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] opacity-8 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,26,26,0.6) 0%, transparent 65%)' }} />
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(oklch(0.95 0.005 0) 1px, transparent 1px), linear-gradient(90deg, oklch(0.95 0.005 0) 1px, transparent 1px)`,
          backgroundSize: '56px 56px',
        }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 space-y-10">

        {/* ── Header ── */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[rgba(139,26,26,0.18)] border border-[rgba(139,26,26,0.35)] shadow-[0_0_12px_rgba(139,26,26,0.2)]">
            <h1 className="text-[11px] font-black text-[#e07070] uppercase tracking-[0.18em]">
              {t('Programme Affiliation', 'Affiliate Program')}
            </h1>
          </span>
        </div>

        {/* ── Affiliate link card ── */}
        <div className="rounded-2xl p-6 border border-[oklch(0.16_0_0)] bg-[oklch(0.095_0_0)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[oklch(0.35_0.005_0)] mb-3">
            {t('Ton lien affilié', 'Your affiliate link')}
          </p>
          <div className="flex items-center gap-3">
            <div
              className="flex-1 rounded-xl px-4 py-3 font-mono text-sm text-[oklch(0.75_0.005_0)] select-all truncate"
              style={{ background: 'oklch(0.07_0_0)', border: '1px solid oklch(0.14_0_0)' }}
            >
              {affiliateLink}
            </div>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-200"
              style={{
                background: copied ? 'rgba(40,180,100,0.15)' : 'rgba(139,26,26,0.15)',
                border: copied ? '1px solid rgba(40,180,100,0.35)' : '1px solid rgba(139,26,26,0.35)',
                color: copied ? 'rgba(40,200,100,0.9)' : '#e07070',
              }}
            >
              {copied
                ? <><Check size={14} />{t('Copié !', 'Copied!')}</>
                : <><Copy size={14} />{t('Copier', 'Copy')}</>
              }
            </button>
          </div>
          <p className="mt-3 text-[11px] text-[oklch(0.30_0.005_0)]">
            {t(
              `Commission de ${affiliate.commission_rate}% sur le montant net (après frais Stripe) de chaque vente via ce lien.`,
              `${affiliate.commission_rate}% commission on the net amount (after Stripe fees) of each sale via this link.`
            )}
          </p>
        </div>

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map(({ icon: Icon, label, value, sub }) => (
            <div
              key={label}
              className="rounded-2xl p-5 border border-[oklch(0.15_0_0)] bg-[oklch(0.095_0_0)] flex flex-col gap-2"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(139,26,26,0.12)', border: '1px solid rgba(139,26,26,0.2)' }}>
                <Icon size={15} style={{ color: '#c84040' }} />
              </div>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[oklch(0.32_0.005_0)] mt-1">
                {label}
              </p>
              <p className="text-lg font-black text-white leading-none">{value}</p>
              <p className="text-[10px] text-[oklch(0.30_0.005_0)]">{sub}</p>
            </div>
          ))}
        </div>

        {/* ── Commission history ── */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[rgba(139,26,26,0.18)] border border-[rgba(139,26,26,0.35)] shadow-[0_0_12px_rgba(139,26,26,0.2)]">
              <h2 className="text-[11px] font-black text-[#e07070] uppercase tracking-[0.18em]">
                {t('Historique des commissions', 'Commission history')}
              </h2>
            </span>
          </div>

          {commissions.length === 0 ? (
            <div className="rounded-2xl p-12 text-center border border-[oklch(0.14_0_0)] bg-[oklch(0.095_0_0)]">
              <p className="text-sm text-[oklch(0.35_0.005_0)]">
                {t('Aucune vente pour le moment. Partage ton lien !', 'No sales yet. Share your link!')}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden border border-[oklch(0.14_0_0)] bg-[oklch(0.095_0_0)]">
              {/* Header row */}
              <div className="grid grid-cols-12 px-5 py-3 border-b border-[oklch(0.13_0_0)]">
                {(['Date', t('Produit', 'Product'), t('Vente', 'Sale'), 'Commission', 'Statut'] as const).map((h, i) => (
                  <p key={h} className={`text-[9px] font-bold uppercase tracking-[0.16em] text-[oklch(0.28_0.005_0)] ${i === 0 ? 'col-span-2' : i === 1 ? 'col-span-4' : 'col-span-2'}`}>
                    {h}
                  </p>
                ))}
              </div>
              {/* Rows */}
              {commissions.map((c) => {
                const productName = locale === 'fr' ? c.product?.name_fr : c.product?.name_en;
                const statusInfo = STATUS_LABEL[c.status] ?? STATUS_LABEL.pending;
                return (
                  <div
                    key={c.id}
                    className="grid grid-cols-12 px-5 py-4 border-b border-[oklch(0.11_0_0)] last:border-b-0 hover:bg-[oklch(0.10_0_0)] transition-colors"
                  >
                    <p className="col-span-2 text-[11px] text-[oklch(0.40_0.005_0)] self-center">
                      {fmtDate(c.created_at, locale)}
                    </p>
                    <p className="col-span-4 text-[12px] text-[oklch(0.75_0.005_0)] font-medium self-center truncate pr-3">
                      {productName ?? '—'}
                    </p>
                    <p className="col-span-2 text-[12px] text-[oklch(0.55_0.005_0)] self-center">
                      {fmt(c.sale_amount_cents)}
                    </p>
                    <p className="col-span-2 text-[12px] font-bold text-white self-center">
                      {fmt(c.commission_cents)}
                    </p>
                    <div className="col-span-2 self-center">
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md"
                        style={{
                          background: `${statusInfo.color}15`,
                          border: `1px solid ${statusInfo.color}40`,
                          color: statusInfo.color,
                        }}
                      >
                        {locale === 'fr' ? statusInfo.fr : statusInfo.en}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
