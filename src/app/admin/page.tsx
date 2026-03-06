import { createClient } from '@/lib/supabase/server';
import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react';

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: productCount },
    { count: purchaseCount },
    { count: userCount },
    { data: recentPurchases },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('purchases').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('purchases').select('*, product:products(name_fr), profile:profiles(email)').eq('status', 'completed').order('created_at', { ascending: false }).limit(5),
  ]);

  const { data: revenueData } = await supabase
    .from('purchases')
    .select('amount_paid_cents')
    .eq('status', 'completed');

  const totalRevenue = revenueData?.reduce((sum, p) => sum + (p.amount_paid_cents ?? 0), 0) ?? 0;

  const stats = [
    { label: 'Produits publiés', value: productCount ?? 0, icon: Package, color: 'text-[#8b1a1a]' },
    { label: 'Ventes totales', value: purchaseCount ?? 0, icon: ShoppingCart, color: 'text-[#8b1a1a]' },
    { label: 'Membres', value: userCount ?? 0, icon: Users, color: 'text-[#8b1a1a]' },
    { label: 'Revenus', value: `${(totalRevenue / 100).toFixed(2)} €`, icon: TrendingUp, color: 'text-[#8b1a1a]' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Dashboard</h1>
        <p className="text-sm text-[oklch(0.45_0.005_0)] mt-1">Vue d'ensemble JustEdit</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <Icon size={18} className={stat.color} />
              </div>
              <div className="text-2xl font-black text-white mb-0.5">{stat.value}</div>
              <div className="text-xs text-[oklch(0.45_0.005_0)]">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Recent sales */}
      {recentPurchases && recentPurchases.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-white mb-4">Dernières ventes</h2>
          <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl overflow-hidden">
            {recentPurchases.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center justify-between px-5 py-3.5 text-sm ${
                  i < recentPurchases.length - 1 ? 'border-b border-[oklch(0.15_0_0)]' : ''
                }`}
              >
                <div>
                  <p className="text-white font-medium">{(p.product as any)?.name_fr}</p>
                  <p className="text-xs text-[oklch(0.45_0.005_0)]">{(p.profile as any)?.email}</p>
                </div>
                <span className="font-bold text-white">
                  {((p.amount_paid_cents ?? 0) / 100).toFixed(2)} €
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
