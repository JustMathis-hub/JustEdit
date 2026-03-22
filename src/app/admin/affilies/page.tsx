import { createClient } from '@/lib/supabase/server';
import { Users, CheckCircle, Clock, XCircle, Pause } from 'lucide-react';
import Link from 'next/link';

const statusConfig: Record<string, { label: string; classes: string; icon: typeof CheckCircle }> = {
  active:   { label: 'Actif',     classes: 'bg-green-950/40 text-green-400 border border-green-900/40', icon: CheckCircle },
  pending:  { label: 'En attente', classes: 'bg-yellow-950/40 text-yellow-400 border border-yellow-900/40', icon: Clock },
  paused:   { label: 'Pause',     classes: 'bg-orange-950/40 text-orange-400 border border-orange-900/40', icon: Pause },
  rejected: { label: 'Refuse',    classes: 'bg-red-950/40 text-red-400 border border-red-900/40', icon: XCircle },
};

export default async function AffiliatesPage() {
  const supabase = await createClient();

  const { data: affiliates, error } = await supabase
    .from('affiliates')
    .select('*, profile:profiles(email, full_name)')
    .order('created_at', { ascending: false })
    .limit(100);

  const { count: totalCount } = await supabase
    .from('affiliates')
    .select('*', { count: 'exact', head: true });

  const { count: activeCount } = await supabase
    .from('affiliates')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  // Pending commissions
  const { data: pendingRows } = await supabase
    .from('affiliate_commissions')
    .select('commission_cents')
    .in('status', ['pending', 'approved']);
  const pendingCents = pendingRows?.reduce((sum, r) => sum + r.commission_cents, 0) ?? 0;

  // Total paid
  const totalPaid = (affiliates ?? []).reduce((sum, a) => sum + a.total_paid_cents, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <Users size={24} className="text-[#8b1a1a]" />
          Affilies
        </h1>
        <p className="text-sm text-[oklch(0.45_0.005_0)] mt-1">
          Gestion des affilies et commissions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl p-5">
          <div className="text-2xl font-black text-white">{totalCount ?? 0}</div>
          <div className="text-xs text-[oklch(0.45_0.005_0)]">Total affilies</div>
        </div>
        <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl p-5">
          <div className="text-2xl font-black text-white">{activeCount ?? 0}</div>
          <div className="text-xs text-[oklch(0.45_0.005_0)]">Actifs</div>
        </div>
        <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl p-5">
          <div className="text-2xl font-black text-white">{(pendingCents / 100).toFixed(2)} &euro;</div>
          <div className="text-xs text-[oklch(0.45_0.005_0)]">Commissions en attente</div>
        </div>
        <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl p-5">
          <div className="text-2xl font-black text-white">{(totalPaid / 100).toFixed(2)} &euro;</div>
          <div className="text-xs text-[oklch(0.45_0.005_0)]">Total verse</div>
        </div>
      </div>

      {/* Quick link */}
      <div className="mb-6">
        <Link
          href="/admin/affilies/commissions"
          className="text-sm text-[#8b1a1a] hover:text-[#c0392b] font-medium transition-colors"
        >
          Voir toutes les commissions →
        </Link>
      </div>

      {/* Affiliates table */}
      {error ? (
        <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-6 text-red-400 text-sm">
          Erreur lors du chargement des affilies.
        </div>
      ) : !affiliates || affiliates.length === 0 ? (
        <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl p-12 text-center">
          <Users size={40} className="mx-auto mb-3 text-[oklch(0.3_0_0)]" />
          <p className="text-[oklch(0.45_0.005_0)]">Aucun affilie pour le moment.</p>
        </div>
      ) : (
        <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[oklch(0.18_0_0)] text-[oklch(0.45_0.005_0)] text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-medium">Affilie</th>
                  <th className="text-left px-5 py-3 font-medium">Code</th>
                  <th className="text-left px-5 py-3 font-medium">Taux</th>
                  <th className="text-left px-5 py-3 font-medium">Statut</th>
                  <th className="text-right px-5 py-3 font-medium">Gagne</th>
                  <th className="text-right px-5 py-3 font-medium">Verse</th>
                  <th className="text-right px-5 py-3 font-medium">Solde</th>
                </tr>
              </thead>
              <tbody>
                {affiliates.map((aff, i) => {
                  const profile = aff.profile as Record<string, string> | null;
                  const sc = statusConfig[aff.status] ?? statusConfig.pending;
                  const Icon = sc.icon;
                  const balance = aff.total_earned_cents - aff.total_paid_cents;

                  return (
                    <tr
                      key={aff.id}
                      className={`${i < affiliates.length - 1 ? 'border-b border-[oklch(0.15_0_0)]' : ''} hover:bg-[oklch(0.13_0_0)] transition-colors`}
                    >
                      <td className="px-5 py-3.5">
                        <Link href={`/admin/affilies/${aff.id}`} className="hover:underline">
                          <p className="text-white font-medium">{profile?.full_name ?? '—'}</p>
                          <p className="text-xs text-[oklch(0.45_0.005_0)]">{profile?.email ?? '—'}</p>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <code className="text-xs bg-[oklch(0.15_0_0)] px-2 py-1 rounded text-white">{aff.code}</code>
                      </td>
                      <td className="px-5 py-3.5 text-white">{aff.commission_rate}%</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.classes}`}>
                          <Icon size={12} />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-white font-bold">
                        {(aff.total_earned_cents / 100).toFixed(2)} &euro;
                      </td>
                      <td className="px-5 py-3.5 text-right text-[oklch(0.55_0.005_0)]">
                        {(aff.total_paid_cents / 100).toFixed(2)} &euro;
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold" style={{ color: balance > 0 ? '#e07070' : 'white' }}>
                        {(balance / 100).toFixed(2)} &euro;
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
