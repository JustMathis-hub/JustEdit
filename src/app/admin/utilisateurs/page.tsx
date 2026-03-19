import { createClient } from '@/lib/supabase/server';
import { Users, Mail, Calendar, ShoppingBag } from 'lucide-react';

export default async function UsersPage() {
  const supabase = await createClient();

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  const { count: totalCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Get purchase counts per user
  const { data: purchaseCounts } = await supabase
    .from('purchases')
    .select('user_id')
    .eq('status', 'completed');

  const purchaseCountMap: Record<string, number> = {};
  if (purchaseCounts) {
    for (const row of purchaseCounts) {
      purchaseCountMap[row.user_id] = (purchaseCountMap[row.user_id] ?? 0) + 1;
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <Users size={24} className="text-[#8b1a1a]" />
          Utilisateurs
        </h1>
        <p className="text-sm text-[oklch(0.45_0.005_0)] mt-1">
          {totalCount ?? 0} membre{(totalCount ?? 0) > 1 ? 's' : ''} inscrits
        </p>
      </div>

      {error ? (
        <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-6 text-red-400 text-sm">
          Erreur lors du chargement des utilisateurs.
        </div>
      ) : !profiles || profiles.length === 0 ? (
        <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl p-12 text-center">
          <Users size={40} className="mx-auto mb-3 text-[oklch(0.3_0_0)]" />
          <p className="text-[oklch(0.45_0.005_0)]">Aucun utilisateur inscrit.</p>
        </div>
      ) : (
        <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[oklch(0.18_0_0)] text-[oklch(0.45_0.005_0)] text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-medium">Utilisateur</th>
                  <th className="text-left px-5 py-3 font-medium">Email</th>
                  <th className="text-left px-5 py-3 font-medium">Role</th>
                  <th className="text-center px-5 py-3 font-medium">Achats</th>
                  <th className="text-left px-5 py-3 font-medium">Inscription</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile, i) => {
                  const date = new Date(profile.created_at);
                  const purchases = purchaseCountMap[profile.id] ?? 0;

                  return (
                    <tr
                      key={profile.id}
                      className={`${i < profiles.length - 1 ? 'border-b border-[oklch(0.15_0_0)]' : ''} hover:bg-[oklch(0.13_0_0)] transition-colors`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-[oklch(0.15_0_0)] flex-shrink-0">
                            {profile.avatar_url && (
                              <img
                                src={profile.avatar_url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <span className="text-white font-medium">
                            {profile.full_name ?? '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="flex items-center gap-1.5 text-[oklch(0.55_0.005_0)]">
                          <Mail size={12} />
                          {profile.email ?? '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          profile.role === 'admin'
                            ? 'bg-[rgba(139,26,26,0.2)] text-[#d44] border border-[rgba(139,26,26,0.3)]'
                            : 'bg-[oklch(0.15_0_0)] text-[oklch(0.55_0.005_0)] border border-[oklch(0.2_0_0)]'
                        }`}>
                          {profile.role ?? 'user'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 text-[oklch(0.55_0.005_0)]">
                          <ShoppingBag size={12} />
                          {purchases}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[oklch(0.55_0.005_0)]">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          {date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
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
