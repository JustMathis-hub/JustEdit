import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AffiliateActions } from './AffiliateActions';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AffiliateDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('*, profile:profiles(email, full_name)')
    .eq('id', id)
    .single();

  if (!affiliate) notFound();

  const profile = affiliate.profile as Record<string, string> | null;

  // Commissions
  const { data: commissions } = await supabase
    .from('affiliate_commissions')
    .select('*, product:products(name_fr)')
    .eq('affiliate_id', id)
    .order('created_at', { ascending: false })
    .limit(50);

  // Payouts
  const { data: payouts } = await supabase
    .from('affiliate_payouts')
    .select('*')
    .eq('affiliate_id', id)
    .order('created_at', { ascending: false })
    .limit(50);

  // Click count
  const { count: clickCount } = await supabase
    .from('referral_clicks')
    .select('*', { count: 'exact', head: true })
    .eq('affiliate_id', id);

  const balance = affiliate.total_earned_cents - affiliate.total_paid_cents;

  return (
    <div>
      <Link
        href="/admin/affilies"
        className="inline-flex items-center gap-1.5 text-sm text-[oklch(0.45_0.005_0)] hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Retour aux affilies
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <User size={24} className="text-[#8b1a1a]" />
          {profile?.full_name ?? profile?.email ?? 'Affilie'}
        </h1>
        <p className="text-sm text-[oklch(0.45_0.005_0)] mt-1">
          Code : <code className="bg-[oklch(0.15_0_0)] px-2 py-0.5 rounded">{affiliate.code}</code>
          &nbsp;&middot;&nbsp; Taux : {affiliate.commission_rate}%
          &nbsp;&middot;&nbsp; Statut : {affiliate.status}
          &nbsp;&middot;&nbsp; Payout : {affiliate.payout_method ?? 'non configure'}
          {affiliate.payout_details && ` (${affiliate.payout_details})`}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl p-5">
          <div className="text-2xl font-black text-white">{clickCount ?? 0}</div>
          <div className="text-xs text-[oklch(0.45_0.005_0)]">Clics totaux</div>
        </div>
        <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl p-5">
          <div className="text-2xl font-black text-white">{(affiliate.total_earned_cents / 100).toFixed(2)} &euro;</div>
          <div className="text-xs text-[oklch(0.45_0.005_0)]">Total gagne</div>
        </div>
        <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl p-5">
          <div className="text-2xl font-black text-white">{(affiliate.total_paid_cents / 100).toFixed(2)} &euro;</div>
          <div className="text-xs text-[oklch(0.45_0.005_0)]">Total verse</div>
        </div>
        <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl p-5">
          <div className="text-2xl font-black text-white" style={{ color: balance > 0 ? '#e07070' : undefined }}>
            {(balance / 100).toFixed(2)} &euro;
          </div>
          <div className="text-xs text-[oklch(0.45_0.005_0)]">Solde a verser</div>
        </div>
      </div>

      {/* Actions (client component) */}
      <AffiliateActions
        affiliateId={affiliate.id}
        currentStatus={affiliate.status}
        currentRate={affiliate.commission_rate}
        balance={balance}
        payoutMethod={affiliate.payout_method}
      />

      {/* Commissions table */}
      <div className="mt-8 mb-8">
        <h2 className="text-lg font-bold text-white mb-4">Commissions</h2>
        {!commissions || commissions.length === 0 ? (
          <p className="text-sm text-[oklch(0.45_0.005_0)]">Aucune commission.</p>
        ) : (
          <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[oklch(0.18_0_0)] text-[oklch(0.45_0.005_0)] text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-medium">Date</th>
                  <th className="text-left px-5 py-3 font-medium">Produit</th>
                  <th className="text-right px-5 py-3 font-medium">Vente</th>
                  <th className="text-right px-5 py-3 font-medium">Commission</th>
                  <th className="text-left px-5 py-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((c, i) => {
                  const product = c.product as Record<string, string> | null;
                  return (
                    <tr key={c.id} className={i < commissions.length - 1 ? 'border-b border-[oklch(0.15_0_0)]' : ''}>
                      <td className="px-5 py-3 text-[oklch(0.55_0.005_0)]">
                        {new Date(c.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-5 py-3 text-white">{product?.name_fr ?? '—'}</td>
                      <td className="px-5 py-3 text-right text-white">{(c.sale_amount_cents / 100).toFixed(2)} &euro;</td>
                      <td className="px-5 py-3 text-right font-bold text-[#e07070]">{(c.commission_cents / 100).toFixed(2)} &euro;</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          c.status === 'paid' ? 'bg-green-950/40 text-green-400' :
                          c.status === 'approved' ? 'bg-blue-950/40 text-blue-400' :
                          c.status === 'rejected' ? 'bg-red-950/40 text-red-400' :
                          'bg-yellow-950/40 text-yellow-400'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payouts table */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">Versements</h2>
        {!payouts || payouts.length === 0 ? (
          <p className="text-sm text-[oklch(0.45_0.005_0)]">Aucun versement.</p>
        ) : (
          <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[oklch(0.18_0_0)] text-[oklch(0.45_0.005_0)] text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-medium">Date</th>
                  <th className="text-right px-5 py-3 font-medium">Montant</th>
                  <th className="text-left px-5 py-3 font-medium">Methode</th>
                  <th className="text-left px-5 py-3 font-medium">Reference</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p, i) => (
                  <tr key={p.id} className={i < payouts.length - 1 ? 'border-b border-[oklch(0.15_0_0)]' : ''}>
                    <td className="px-5 py-3 text-[oklch(0.55_0.005_0)]">{new Date(p.created_at).toLocaleDateString('fr-FR')}</td>
                    <td className="px-5 py-3 text-right font-bold text-white">{(p.amount_cents / 100).toFixed(2)} &euro;</td>
                    <td className="px-5 py-3 text-white">{p.payout_method === 'paypal' ? 'PayPal' : 'Virement'}</td>
                    <td className="px-5 py-3 text-[oklch(0.55_0.005_0)]">{p.reference ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
