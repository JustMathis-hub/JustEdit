'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

interface Props {
  affiliateId: string;
  currentStatus: string;
  currentRate: number;
  balance: number;
  payoutMethod: string | null;
}

export function AffiliateActions({ affiliateId, currentStatus, currentRate, balance, payoutMethod }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutRef, setPayoutRef] = useState('');
  const [newRate, setNewRate] = useState(currentRate.toString());

  const updateStatus = async (status: string) => {
    setLoading(status);
    await supabase.from('affiliates').update({ status, updated_at: new Date().toISOString() }).eq('id', affiliateId);
    router.refresh();
    setLoading('');
  };

  const updateRate = async () => {
    const rate = parseInt(newRate, 10);
    if (isNaN(rate) || rate < 1 || rate > 100) return;
    setLoading('rate');
    await supabase.from('affiliates').update({ commission_rate: rate, updated_at: new Date().toISOString() }).eq('id', affiliateId);
    router.refresh();
    setLoading('');
  };

  const recordPayout = async () => {
    const cents = Math.round(parseFloat(payoutAmount) * 100);
    if (isNaN(cents) || cents <= 0 || cents > balance) return;
    setLoading('payout');

    await supabase.from('affiliate_payouts').insert({
      affiliate_id: affiliateId,
      amount_cents: cents,
      payout_method: payoutMethod ?? 'paypal',
      reference: payoutRef || null,
    });

    await supabase.rpc('increment_affiliate_paid', {
      p_affiliate_id: affiliateId,
      p_amount: cents,
    });

    // Mark pending/approved commissions as paid up to payout amount
    const { data: pendingCommissions } = await supabase
      .from('affiliate_commissions')
      .select('id, commission_cents')
      .eq('affiliate_id', affiliateId)
      .in('status', ['pending', 'approved'])
      .order('created_at', { ascending: true });

    let remaining = cents;
    for (const c of pendingCommissions ?? []) {
      if (remaining <= 0) break;
      if (c.commission_cents <= remaining) {
        await supabase.from('affiliate_commissions').update({ status: 'paid' }).eq('id', c.id);
        remaining -= c.commission_cents;
      }
    }

    setPayoutAmount('');
    setPayoutRef('');
    router.refresh();
    setLoading('');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Status actions */}
      <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[oklch(0.45_0.005_0)] mb-3">Statut</h3>
        <div className="flex flex-wrap gap-2">
          {currentStatus === 'pending' && (
            <>
              <button onClick={() => updateStatus('active')} disabled={!!loading}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-950/40 text-green-400 border border-green-900/40 hover:bg-green-950/60 transition-colors disabled:opacity-50">
                {loading === 'active' ? <Loader2 size={12} className="animate-spin" /> : 'Approuver'}
              </button>
              <button onClick={() => updateStatus('rejected')} disabled={!!loading}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-950/40 text-red-400 border border-red-900/40 hover:bg-red-950/60 transition-colors disabled:opacity-50">
                {loading === 'rejected' ? <Loader2 size={12} className="animate-spin" /> : 'Refuser'}
              </button>
            </>
          )}
          {currentStatus === 'active' && (
            <button onClick={() => updateStatus('paused')} disabled={!!loading}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-orange-950/40 text-orange-400 border border-orange-900/40 hover:bg-orange-950/60 transition-colors disabled:opacity-50">
              {loading === 'paused' ? <Loader2 size={12} className="animate-spin" /> : 'Mettre en pause'}
            </button>
          )}
          {currentStatus === 'paused' && (
            <button onClick={() => updateStatus('active')} disabled={!!loading}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-950/40 text-green-400 border border-green-900/40 hover:bg-green-950/60 transition-colors disabled:opacity-50">
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
          <button onClick={updateRate} disabled={!!loading || newRate === currentRate.toString()}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[rgba(139,26,26,0.15)] text-[#e07070] border border-[rgba(139,26,26,0.3)] hover:bg-[rgba(139,26,26,0.25)] transition-colors disabled:opacity-50">
            {loading === 'rate' ? <Loader2 size={12} className="animate-spin" /> : 'Modifier'}
          </button>
        </div>
      </div>

      {/* Record payout */}
      <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[oklch(0.45_0.005_0)] mb-3">Enregistrer un versement</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Montant (EUR)"
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              className="flex-1 bg-[oklch(0.08_0_0)] border border-[oklch(0.20_0_0)] rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-[oklch(0.35_0_0)]"
            />
          </div>
          <input
            type="text"
            placeholder="Reference (optionnel)"
            value={payoutRef}
            onChange={(e) => setPayoutRef(e.target.value)}
            className="w-full bg-[oklch(0.08_0_0)] border border-[oklch(0.20_0_0)] rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-[oklch(0.35_0_0)]"
          />
          <button onClick={recordPayout} disabled={!!loading || !payoutAmount}
            className="w-full px-3 py-1.5 text-xs font-medium rounded-lg bg-[rgba(139,26,26,0.15)] text-[#e07070] border border-[rgba(139,26,26,0.3)] hover:bg-[rgba(139,26,26,0.25)] transition-colors disabled:opacity-50">
            {loading === 'payout' ? <Loader2 size={12} className="animate-spin" /> : 'Enregistrer le versement'}
          </button>
        </div>
      </div>
    </div>
  );
}
