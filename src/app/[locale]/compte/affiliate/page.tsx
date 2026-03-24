'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import { Copy, Check, Loader2, ArrowLeft, TrendingUp, MousePointerClick, DollarSign, Wallet } from 'lucide-react';

interface Stats {
  clicks30d: number;
  clicksTotal: number;
  conversions: number;
  conversionRate: number;
  pendingCents: number;
  totalEarnedCents: number;
  totalPaidCents: number;
  balanceCents: number;
}

interface Commission {
  id: string;
  sale_amount_cents: number;
  commission_cents: number;
  commission_rate: number;
  status: string;
  created_at: string;
  product: { name_fr: string; name_en: string } | null;
}

interface Payout {
  id: string;
  amount_cents: number;
  payout_method: string;
  reference: string | null;
  created_at: string;
}

interface AffiliateData {
  affiliate: { code: string; commission_rate: number; status: string; payout_method: string | null; payout_details: string | null };
  stats: Stats;
  commissions: Commission[];
  payouts: Payout[];
}

export default function AffiliateDashboardPage() {
  const t = useTranslations('affiliate');
  const [data, setData] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [editingPayout, setEditingPayout] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState('paypal');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [saving, setSaving] = useState(false);

  const supabase = createClient();
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    fetch('/api/affiliate/stats')
      .then((r) => r.ok ? r.json() : null)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const copyLink = () => {
    if (!data) return;
    navigator.clipboard.writeText(`${siteUrl}?ref=${data.affiliate.code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const savePayout = async () => {
    if (!data) return;
    setSaving(true);
    await supabase
      .from('affiliates')
      .update({ payout_method: payoutMethod, payout_details: payoutDetails })
      .eq('code', data.affiliate.code);
    setEditingPayout(false);
    setSaving(false);
    // Refresh
    const r = await fetch('/api/affiliate/stats');
    if (r.ok) setData(await r.json());
  };

  const fmt = (cents: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(cents / 100);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex justify-center">
        <Loader2 size={24} className="animate-spin text-[oklch(0.45_0.005_0)]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen pt-32 px-4 text-center">
        <p className="text-[oklch(0.55_0.005_0)] mb-4">{t('notAffiliate')}</p>
        <Link href="/compte" className="text-[#8b1a1a] hover:text-[#c0392b] text-sm font-medium">
          ← {t('backToAccount')}
        </Link>
      </div>
    );
  }

  const { affiliate, stats, commissions, payouts } = data;

  return (
    <div className="relative min-h-screen pt-24 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-[oklch(0.07_0_0)]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8b1a1a] to-transparent opacity-60" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">

        <Link href="/compte" className="inline-flex items-center gap-1.5 text-sm text-[oklch(0.45_0.005_0)] hover:text-white transition-colors">
          <ArrowLeft size={14} /> {t('backToAccount')}
        </Link>

        <div>
          <h1 className="text-2xl font-black text-white">{t('title')}</h1>
          <p className="text-sm text-[oklch(0.45_0.005_0)] mt-1">{t('subtitle')}</p>
        </div>

        {/* Referral link */}
        <div className="bg-[oklch(0.10_0_0)] border border-[oklch(0.18_0_0)] rounded-2xl p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[oklch(0.45_0.005_0)] mb-3">{t('yourLink')}</p>
          <div className="flex items-center gap-3">
            <code className="flex-1 bg-[oklch(0.07_0_0)] border border-[oklch(0.15_0_0)] rounded-lg px-4 py-3 text-sm text-white truncate">
              {siteUrl}?ref={affiliate.code}
            </code>
            <button
              onClick={copyLink}
              className="shrink-0 px-4 py-3 rounded-lg text-sm font-medium bg-[rgba(139,26,26,0.15)] text-[#e07070] border border-[rgba(139,26,26,0.3)] hover:bg-[rgba(139,26,26,0.25)] transition-colors flex items-center gap-2"
            >
              {copied ? <><Check size={14} /> {t('copied')}</> : <><Copy size={14} /> {t('copy')}</>}
            </button>
          </div>
          <p className="text-xs text-[oklch(0.35_0.005_0)] mt-2">{t('commissionInfo', { rate: affiliate.commission_rate })}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[oklch(0.10_0_0)] border border-[oklch(0.18_0_0)] rounded-xl p-5">
            <MousePointerClick size={16} className="text-[#8b1a1a] mb-2" />
            <div className="text-2xl font-black text-white">{stats.clicks30d}</div>
            <div className="text-[10px] text-[oklch(0.45_0.005_0)] uppercase tracking-wider">{t('clicks30d')}</div>
          </div>
          <div className="bg-[oklch(0.10_0_0)] border border-[oklch(0.18_0_0)] rounded-xl p-5">
            <TrendingUp size={16} className="text-[#8b1a1a] mb-2" />
            <div className="text-2xl font-black text-white">{stats.conversions}</div>
            <div className="text-[10px] text-[oklch(0.45_0.005_0)] uppercase tracking-wider">{t('conversions')}</div>
          </div>
          <div className="bg-[oklch(0.10_0_0)] border border-[oklch(0.18_0_0)] rounded-xl p-5">
            <DollarSign size={16} className="text-[#8b1a1a] mb-2" />
            <div className="text-2xl font-black text-white">{fmt(stats.totalEarnedCents)}</div>
            <div className="text-[10px] text-[oklch(0.45_0.005_0)] uppercase tracking-wider">{t('totalEarned')}</div>
          </div>
          <div className="bg-[oklch(0.10_0_0)] border border-[oklch(0.18_0_0)] rounded-xl p-5">
            <Wallet size={16} className="text-[#8b1a1a] mb-2" />
            <div className="text-2xl font-black text-white" style={{ color: stats.balanceCents > 0 ? '#e07070' : undefined }}>
              {fmt(stats.balanceCents)}
            </div>
            <div className="text-[10px] text-[oklch(0.45_0.005_0)] uppercase tracking-wider">{t('balance')}</div>
          </div>
        </div>

        {/* Payout info */}
        <div className="bg-[oklch(0.10_0_0)] border border-[oklch(0.18_0_0)] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[oklch(0.45_0.005_0)]">{t('payoutInfo')}</p>
            {!editingPayout && (
              <button onClick={() => { setEditingPayout(true); setPayoutMethod(affiliate.payout_method ?? 'paypal'); setPayoutDetails(affiliate.payout_details ?? ''); }}
                className="text-xs text-[#8b1a1a] hover:text-[#c0392b] font-medium transition-colors">
                {t('edit')}
              </button>
            )}
          </div>
          {editingPayout ? (
            <div className="space-y-3">
              <select value={payoutMethod} onChange={(e) => setPayoutMethod(e.target.value)}
                className="w-full bg-[oklch(0.07_0_0)] border border-[oklch(0.15_0_0)] rounded-lg px-3 py-2 text-sm text-white">
                <option value="paypal">PayPal</option>
                <option value="bank_transfer">{t('bankTransfer')}</option>
              </select>
              <input
                type="text"
                value={payoutDetails}
                onChange={(e) => setPayoutDetails(e.target.value)}
                placeholder={payoutMethod === 'paypal' ? t('paypalPlaceholder') : t('ibanPlaceholder')}
                className="w-full bg-[oklch(0.07_0_0)] border border-[oklch(0.15_0_0)] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[oklch(0.35_0_0)]"
              />
              <div className="flex gap-2">
                <button onClick={savePayout} disabled={saving}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-[rgba(139,26,26,0.15)] text-[#e07070] border border-[rgba(139,26,26,0.3)] hover:bg-[rgba(139,26,26,0.25)] transition-colors disabled:opacity-50">
                  {saving ? <Loader2 size={12} className="animate-spin" /> : t('save')}
                </button>
                <button onClick={() => setEditingPayout(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg text-[oklch(0.55_0.005_0)] hover:text-white transition-colors">
                  {t('cancel')}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-white">
              {affiliate.payout_method ? (
                <>{affiliate.payout_method === 'paypal' ? 'PayPal' : t('bankTransfer')} : {affiliate.payout_details ?? '—'}</>
              ) : (
                <span className="text-[oklch(0.45_0.005_0)]">{t('noPayoutConfigured')}</span>
              )}
            </div>
          )}
        </div>

        {/* Commissions table */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">{t('commissionsTitle')}</h2>
          {commissions.length === 0 ? (
            <p className="text-sm text-[oklch(0.45_0.005_0)]">{t('noCommissions')}</p>
          ) : (
            <div className="bg-[oklch(0.10_0_0)] border border-[oklch(0.18_0_0)] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[oklch(0.18_0_0)] text-[oklch(0.45_0.005_0)] text-xs uppercase tracking-wider">
                    <th className="text-left px-5 py-3 font-medium">{t('date')}</th>
                    <th className="text-left px-5 py-3 font-medium">{t('product')}</th>
                    <th className="text-right px-5 py-3 font-medium">{t('sale')}</th>
                    <th className="text-right px-5 py-3 font-medium">{t('commission')}</th>
                    <th className="text-left px-5 py-3 font-medium">{t('status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((c, i) => (
                    <tr key={c.id} className={i < commissions.length - 1 ? 'border-b border-[oklch(0.15_0_0)]' : ''}>
                      <td className="px-5 py-3 text-[oklch(0.55_0.005_0)]">
                        {new Date(c.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-5 py-3 text-white">{c.product?.name_fr ?? '—'}</td>
                      <td className="px-5 py-3 text-right text-white">{fmt(c.sale_amount_cents)}</td>
                      <td className="px-5 py-3 text-right font-bold text-[#e07070]">{fmt(c.commission_cents)}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          c.status === 'paid' ? 'bg-green-950/40 text-green-400' :
                          c.status === 'approved' ? 'bg-blue-950/40 text-blue-400' :
                          'bg-yellow-950/40 text-yellow-400'
                        }`}>
                          {c.status === 'paid' ? t('statusPaid') : c.status === 'approved' ? t('statusApproved') : t('statusPending')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payouts table */}
        {payouts.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4">{t('payoutsTitle')}</h2>
            <div className="bg-[oklch(0.10_0_0)] border border-[oklch(0.18_0_0)] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[oklch(0.18_0_0)] text-[oklch(0.45_0.005_0)] text-xs uppercase tracking-wider">
                    <th className="text-left px-5 py-3 font-medium">{t('date')}</th>
                    <th className="text-right px-5 py-3 font-medium">{t('amount')}</th>
                    <th className="text-left px-5 py-3 font-medium">{t('method')}</th>
                    <th className="text-left px-5 py-3 font-medium">{t('reference')}</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p, i) => (
                    <tr key={p.id} className={i < payouts.length - 1 ? 'border-b border-[oklch(0.15_0_0)]' : ''}>
                      <td className="px-5 py-3 text-[oklch(0.55_0.005_0)]">{new Date(p.created_at).toLocaleDateString('fr-FR')}</td>
                      <td className="px-5 py-3 text-right font-bold text-white">{fmt(p.amount_cents)}</td>
                      <td className="px-5 py-3 text-white">{p.payout_method === 'paypal' ? 'PayPal' : t('bankTransfer')}</td>
                      <td className="px-5 py-3 text-[oklch(0.55_0.005_0)]">{p.reference ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
