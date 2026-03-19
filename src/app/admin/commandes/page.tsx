import { createClient } from '@/lib/supabase/server';
import { ShoppingCart, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default async function OrdersPage() {
  const supabase = await createClient();

  const { data: purchases, error } = await supabase
    .from('purchases')
    .select('*, product:products(name_fr, slug, category), profile:profiles(email, full_name)')
    .order('created_at', { ascending: false })
    .limit(100);

  const { count: totalCount } = await supabase
    .from('purchases')
    .select('*', { count: 'exact', head: true });

  const { count: completedCount } = await supabase
    .from('purchases')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed');

  const totalRevenue = (purchases ?? [])
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount_paid_cents ?? 0), 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <ShoppingCart size={24} className="text-[#8b1a1a]" />
          Commandes
        </h1>
        <p className="text-sm text-[oklch(0.45_0.005_0)] mt-1">
          Gestion des commandes et paiements
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl p-5">
          <div className="text-2xl font-black text-white">{totalCount ?? 0}</div>
          <div className="text-xs text-[oklch(0.45_0.005_0)]">Total commandes</div>
        </div>
        <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl p-5">
          <div className="text-2xl font-black text-white">{completedCount ?? 0}</div>
          <div className="text-xs text-[oklch(0.45_0.005_0)]">Completees</div>
        </div>
        <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl p-5">
          <div className="text-2xl font-black text-white">{(totalRevenue / 100).toFixed(2)} &euro;</div>
          <div className="text-xs text-[oklch(0.45_0.005_0)]">Revenus totaux</div>
        </div>
      </div>

      {/* Orders table */}
      {error ? (
        <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-6 text-red-400 text-sm">
          Erreur lors du chargement des commandes.
        </div>
      ) : !purchases || purchases.length === 0 ? (
        <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl p-12 text-center">
          <ShoppingCart size={40} className="mx-auto mb-3 text-[oklch(0.3_0_0)]" />
          <p className="text-[oklch(0.45_0.005_0)]">Aucune commande pour le moment.</p>
        </div>
      ) : (
        <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[oklch(0.18_0_0)] text-[oklch(0.45_0.005_0)] text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-medium">Date</th>
                  <th className="text-left px-5 py-3 font-medium">Client</th>
                  <th className="text-left px-5 py-3 font-medium">Produit</th>
                  <th className="text-left px-5 py-3 font-medium">Statut</th>
                  <th className="text-right px-5 py-3 font-medium">Montant</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase, i) => {
                  const product = purchase.product as Record<string, string> | null;
                  const profile = purchase.profile as Record<string, string> | null;
                  const date = new Date(purchase.created_at);

                  return (
                    <tr
                      key={purchase.id}
                      className={`${i < purchases.length - 1 ? 'border-b border-[oklch(0.15_0_0)]' : ''} hover:bg-[oklch(0.13_0_0)] transition-colors`}
                    >
                      <td className="px-5 py-3.5 text-[oklch(0.55_0.005_0)]">
                        {date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        <span className="block text-[10px] text-[oklch(0.4_0.005_0)]">
                          {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-white font-medium">{profile?.full_name ?? '—'}</p>
                        <p className="text-xs text-[oklch(0.45_0.005_0)]">{profile?.email ?? '—'}</p>
                      </td>
                      <td className="px-5 py-3.5 text-white">
                        {product?.name_fr ?? '—'}
                        <span className="block text-[10px] text-[oklch(0.4_0.005_0)] uppercase">{product?.category}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          purchase.status === 'completed'
                            ? 'bg-green-950/40 text-green-400 border border-green-900/40'
                            : purchase.status === 'pending'
                              ? 'bg-yellow-950/40 text-yellow-400 border border-yellow-900/40'
                              : 'bg-red-950/40 text-red-400 border border-red-900/40'
                        }`}>
                          {purchase.status === 'completed' ? <CheckCircle size={12} /> :
                           purchase.status === 'pending' ? <Clock size={12} /> :
                           <AlertTriangle size={12} />}
                          {purchase.status === 'completed' ? 'Completee' :
                           purchase.status === 'pending' ? 'En attente' : purchase.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-white">
                        {((purchase.amount_paid_cents ?? 0) / 100).toFixed(2)} &euro;
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
