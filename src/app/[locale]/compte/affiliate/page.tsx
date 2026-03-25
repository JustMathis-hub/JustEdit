export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { AffiliateDashboard } from '@/components/affiliate/AffiliateDashboard';
import type { Affiliate, AffiliateCommission, Product } from '@/types';

export default async function AffiliatePage() {
  const locale = await getLocale();
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/connexion`);

  // Check if user is an active affiliate
  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (!affiliate) redirect(`/${locale}/compte`);

  // Fetch commission history with product info
  const { data: commissions } = await supabase
    .from('affiliate_commissions')
    .select('*, product:products(name_fr, name_en, thumbnail_url)')
    .eq('affiliate_id', (affiliate as Affiliate).id)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <AffiliateDashboard
      affiliate={affiliate as Affiliate}
      commissions={(commissions ?? []) as (AffiliateCommission & { product: Product })[]}
      locale={locale}
    />
  );
}
