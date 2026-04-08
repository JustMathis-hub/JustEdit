'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, ExternalLink, CheckCircle2, AlertCircle, Copy } from 'lucide-react';

interface Props {
  affiliateId: string;
  affiliateName: string;
  currentStatus: string;
  currentRate: number;
  balance: number;
  payoutMethod: string | null;
  stripeConnectAccountId: string | null;
}

export function AffiliateActions({
  affiliateId,
  affiliateName,
  currentStatus,
  currentRate,
  balance,
  payoutMethod,
  stripeConnectAccountId,
}: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutNote, setPayoutNote] = useState('');
  const [newRate, setNewRate] = useState(currentRate.toString());
  const [onboardingUrl, setOnboardingUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const updateStatus = async (status: string) => {
    setLoading(status);
    await supabase
      .from('affiliates')
      .update({ status })
      .eq('id', affiliateId);
    router.refresh();
    setLoading('');
  };

  const updateRate = async () => {
    const rate = parseInt(newRate, 10);
    if (isNaN(rate) || rate < 1 || rate > 100) return;
    setLoading('rate');
    await supabase
      .from('affiliates')
      .update({ commission_rate: rate })
      .eq('id', affiliateId);
    router.refresh();
    setLoading('');
  };

  const generateOnboardingLink = async () => {
    setLoading('connect');
    setError('');
    try {
      const res = await fetch(`/api/admin/affiliates/${affiliateId}/connect`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur');
      setOnboardingUrl(data.url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la creation du compte Stripe');
    }
    setLoading('');
  };

  const generateDashboardLink = async () => {
    setLoading('dashboard');
    setError('');
    try {
      const res = await fetch(`/api/admin/affiliates/${affiliateId}/connect`, { method: 'GET' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur');
      setOnboardingUrl(data.url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la generation du lien');
    }
    setLoading('');
  };

  const copyOnboardingUrl = async () => {
    await navigator.clipboard.writeText(onboardingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const recordPayout = async () => {
    const cents = Math.round(parseFloat(payoutAmount) * 100);
    if (isNaN(cents) || cents <= 0 || cents > balance) return;
    setLoading('payout');
    setError('');

    try {
      const res = await fetch(`/api/admin/affiliates/${affiliateId}/payout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount_cents: cents, note: payoutNote || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur');
      setPayoutAmount('');
      setPayoutNote('');
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors du versement');
    }
    setLoading('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status actions */}
        <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[oklch(0.45_0.005_0)] mb-3">Statut</h3>
          <div className="flex flex-wrap gap-2">
            {currentStatus === 'pending' && (
              <>
                <button
                  onClick={() => updateStatus('active')}
                  disabled={!!loading}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-950/40 text-green-400 border border-green-900/40 hover:bg-green-950/60 transition-colors disabled:opacity-50"
                >
                  {loading === 'active' ? <Loader2 size={12} className="animate-spin" /> : 'Approuver'}
                </button>
                <button
                  onClick={() => updateStatus('rejected')}
                  disabled={!!loading}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-950/40 text-red-400 border border-red-900/40 hover:bg-red-950/60 transition-colors disabled:opacity-50"
                >
                  {loading === 'rejected' ? <Loader2 size={12} className="animate-spin" /> : 'Refuser'}
                </button>
              </>
            )}
            {currentStatus === 'active' && (
              <button
                onClick={() => updateStatus('paused')}
                disabled={!!loading}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-orange-950/40 text-orange-400 border border-orange-900/40 hover:bg-orange-950/60 transition-colors disabled:opacity-50"
              >
                {loading === 'paused' ? <Loader2 size={12} className="animate-spin" /> : 'Mettre en pause'}
              </button>
            )}
            {currentStatus === 'paused' && (
              <button
                onClick={() => updateStatus('active')}
                disabled={!!loading}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-950/40 text-green-400 border border-green-900/40 hover:bg-green-950/60 transition-colors disabled:opacity-50"
              >
                {loading === 'active' ? <Loader2 size={12} className="animate-spin" /> : 'Reactiver'}
              </button>
            )}
          </div>
        </div>

        {/* Commission rate */}
        <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[oklch(0.45_0.005_0)] mb-3">Taux de commission</h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={100}
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
              className="w-20 bg-[oklch(0.08_0_0)] border border-[oklch(0.20_0_0)] rounded-lg px-3 py-1.5 text-sm text-white"
            />
            <span className="text-white text-sm">%</span>
            <button
              onClick={updateRate}
              disabled={!!loading || newRate === currentRate.toString()}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[rgba(139,26,26,0.15)] text-[#e07070] border border-[rgba(139,26,26,0.3)] hover:bg-[rgba(139,26,26,0.25)] transition-colors disabled:opacity-50"
            >
              {loading === 'rate' ? <Loader2 size={12} className="animate-spin" /> : 'Modifier'}
            </button>
          </div>
        </div>

        {/* Stripe Connect */}
        <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[oklch(0.45_0.005_0)] mb-3">Stripe Connect</h3>
          {stripeConnectAccountId && !onboardingUrl ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-400 text-xs">
                <CheckCircle2 size={14} />
                <span>Compte connecte</span>
              </div>
              <p className="text-[oklch(0.4_0_0)] text-xs font-mono truncate">{stripeConnectAccountId}</p>
              <button
                onClick={generateDashboardLink}
                disabled={!!loading}
                className="w-full px-3 py-1.5 text-xs font-medium rounded-lg bg-[rgba(139,26,26,0.15)] text-[#e07070] border border-[rgba(139,26,26,0.3)] hover:bg-[rgba(139,26,26,0.25)] transition-colors disabled:opacity-50"
              >
                {loading === 'dashboard' ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <Loader2 size={12} className="animate-spin" /> Generation...
                  </span>
                ) : (
                  `Generer lien dashboard ${affiliateName}`
                )}
              </button>
            </div>
          ) : onboardingUrl ? (
            <div className="space-y-2">
              <p className="text-xs text-[oklch(0.55_0.005_0)]">Lien genere — envoie-le a {affiliateName} :</p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={onboardingUrl}
                  className="flex-1 bg-[oklch(0.08_0_0)] border border-[oklch(0.20_0_0)] rounded-lg px-2 py-1 text-xs text-white truncate"
                />
                <button
                  onClick={copyOnboardingUrl}
                  className="px-2 py-1 text-xs rounded-lg bg-[rgba(139,26,26,0.15)] text-[#e07070] border border-[rgba(139,26,26,0.3)] hover:bg-[rgba(139,26,26,0.25)] transition-colors"
                >
                  {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                </button>
                <a
                  href={onboardingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 text-xs rounded-lg bg-[oklch(0.15_0_0)] text-white border border-[oklch(0.22_0_0)] hover:bg-[oklch(0.18_0_0)] transition-colors"
                >
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[oklch(0.45_0.005_0)] text-xs">
                <AlertCircle size={14} />
                <span>Non connecte</span>
              </div>
              <button
                onClick={generateOnboardingLink}
                disabled={!!loading}
                className="w-full px-3 py-1.5 text-xs font-medium rounded-lg bg-[rgba(139,26,26,0.15)] text-[#e07070] border border-[rgba(139,26,26,0.3)] hover:bg-[rgba(139,26,26,0.25)] transition-colors disabled:opacity-50"
              >
                {loading === 'connect' ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <Loader2 size={12} className="animate-spin" /> Generation...
                  </span>
                ) : (
                  'Generer lien d\'onboarding'
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payout */}
      <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[oklch(0.45_0.005_0)]">
            Enregistrer un versement
          </h3>
          {stripeConnectAccountId && (
            <span className="flex items-center gap-1 text-xs text-green-400">
              <CheckCircle2 size={11} /> Via Stripe Connect (automatique)
            </span>
          )}
        </div>

        {error && (
          <div className="mb-3 p-3 rounded-lg bg-red-950/30 border border-red-900/40 text-red-400 text-xs">
            {error}
          </div>
        )}

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-xs text-[oklch(0.45_0.005_0)] mb-1">
              Montant (EUR) — solde disponible : {(balance / 100).toFixed(2)} €
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max={(balance / 100).toFixed(2)}
              placeholder="0.00"
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              className="w-full bg-[oklch(0.08_0_0)] border border-[oklch(0.20_0_0)] rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-[oklch(0.35_0_0)]"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-[oklch(0.45_0.005_0)] mb-1">Note (optionnel)</label>
            <input
              type="text"
              placeholder="Ex: Commission mars 2026"
              value={payoutNote}
              onChange={(e) => setPayoutNote(e.target.value)}
              className="w-full bg-[oklch(0.08_0_0)] border border-[oklch(0.20_0_0)] rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-[oklch(0.35_0_0)]"
            />
          </div>
          <button
            onClick={recordPayout}
            disabled={!!loading || !payoutAmount || parseFloat(payoutAmount) <= 0}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-[rgba(139,26,26,0.15)] text-[#e07070] border border-[rgba(139,26,26,0.3)] hover:bg-[rgba(139,26,26,0.25)] transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {loading === 'payout' ? (
              <span className="flex items-center gap-1.5">
                <Loader2 size={12} className="animate-spin" />
                {stripeConnectAccountId ? 'Virement...' : 'Enregistrement...'}
              </span>
            ) : (
              stripeConnectAccountId ? 'Virer via Stripe' : 'Enregistrer le versement'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
