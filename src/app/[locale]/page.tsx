export const dynamic = 'force-dynamic';

import { getTranslations } from 'next-intl/server';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { HowItWorks } from '@/components/home/HowItWorks';
import { VideoIntro } from '@/components/home/VideoIntro';
import { createClient } from '@/lib/supabase/server';
import { Suspense } from 'react';

export default async function HomePage() {
  const t = await getTranslations('common');

  const supabase = await createClient();
  const { data: latestProduct } = await supabase
    .from('products')
    .select('slug, name_fr, name_en, price_cents, is_free')
    .eq('is_published', true)
    .eq('is_free', false)
    .order('sort_order', { ascending: true })
    .limit(1)
    .single();

  return (
    <>
      <VideoIntro latestProduct={latestProduct ?? undefined} />
      <HeroSection />
      <HowItWorks />
      <Suspense fallback={<div className="py-20 text-center text-[oklch(0.4_0.005_0)]">{t('loading')}</div>}>
        <FeaturedProducts />
      </Suspense>
    </>
  );
}
