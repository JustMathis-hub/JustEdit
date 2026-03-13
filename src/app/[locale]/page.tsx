export const dynamic = 'force-dynamic';

import { getTranslations } from 'next-intl/server';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { HowItWorks } from '@/components/home/HowItWorks';
import { VideoIntro } from '@/components/home/VideoIntro';
import { Suspense } from 'react';

export default async function HomePage() {
  const t = await getTranslations('common');

  return (
    <>
      <VideoIntro />
      <HeroSection />
      <HowItWorks />
      <Suspense fallback={<div className="py-20 text-center text-[oklch(0.4_0.005_0)]">{t('loading')}</div>}>
        <FeaturedProducts />
      </Suspense>
    </>
  );
}
