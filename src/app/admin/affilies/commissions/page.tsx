import { createClient } from '@/lib/supabase/server';
import { DollarSign } from 'lucide-react';
import Link from 'next/link';

export default async function CommissionsPage() {
  const supabase = await createClient();

  const { data: commissions, error } = await supabase
    .from('affiliate_commissions')
    .select('*, affiliate:affiliates(code, profile:profiles(full_name, email)), product:products(name_fr)')
    .order('created_at', { ascending: false })
    .limit(100);

  const { count: pendingCount } = await supabase
    .from('affiliate_commissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const { count: totalCount } = await supabase
    .from('affiliate_commissions')
    .select('*', { count: 'exact', head: true });

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/affilies" className="text-sm text-[oklch(0.45_0.005_0)] hover:text-white mb-2 inline-block transition-colors">
          ← Retour aux affilies
        </Link>
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <DollarSign size={24} className="text-[#8b1a1a]" />
          Commissions
        </h1>
        <p className="text-sm text-[oklch(0.45_0.005_0)] mt-1">
          {totalCount ?? 0} commissions &middot; {pendingCount ?? 0} en attente
        </p>
      </div>

      {error ? (
        <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-6 text-red-400 text-sm">
          Erreur lors du chargement des commissions.
        </div>
      ) : !commissions || commissions.length === 0 ? (
        <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl p-12 text-center">
          <DollarSign size={40} className="mx-auto mb-3 text-[oklch(0.3_0_0)]" />
          <p className="text-[oklch(0.45_0.005_0)]">Aucune commission.</p>
        </div>
      ) : (
        <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[oklch(0.18_0_0)] text-[oklch(0.45_0.005_0)] text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-medium">Date</th>
                  <th className="text-left px-5 py-3 font-medium">Affilie</th>
                  <th className="text-left px-5 py-3 font-medium">Produit</th>
                  <th className="text-right px-5 py-3 font-medium">Vente</th>
                  <th className="text-right px-5 py-3 font-medium">Commission</th>
                  <th className="text-left px-5 py-3 font-medium">Taux</th>
                  <th className="text-left px-5 py-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((c, i) => {
                  const aff = c.affiliate as { code: string; profile: Record<string, string> | null } | null;
                  const product = c.product as Record<string, string> | null;
                  return (
                    <tr key={c.id} className={`${i < commissions.length - 1 ? 'border-b border-[oklch(0.15_0_0)]' : ''} hover:bg-[oklch(0.13_0_0)] transition-colors`}>
                      <td className="px-5 py-3 text-[oklch(0.55_0.005_0)]">
                        {new Date(c.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-white">{aff?.profile?.full_name ?? '—'}</p>
                        <code className="text-[10px] text-[oklch(0.45_0.005_0)]">{aff?.code}</code>
                      </td>
                      <td className="px-5 py-3 text-white">{product?.name_fr ?? '—'}</td>
                      <td className="px-5 py-3 text-right text-white">{(c.sale_amount_cents / 100).toFixed(2)} &euro;</td>
                      <td className="px-5 py-3 text-right font-bold text-[#e07070]">{(c.commission_cents / 100).toFixed(2)} &euro;</td>
                      <td className="px-5 py-3 text-[oklch(0.55_0.005_0)]">{c.commission_rate}%</td>
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
        </div>
      )}
    </div>
  );
}
