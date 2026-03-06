import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default async function CancelPage() {
  const t = await getTranslations('checkout.cancel');

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-[oklch(0.13_0_0)] border border-[oklch(0.22_0_0)] flex items-center justify-center mx-auto mb-5">
          <XCircle size={28} className="text-[oklch(0.45_0.005_0)]" />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">{t('title')}</h1>
        <p className="text-[oklch(0.5_0.005_0)] mb-7">{t('subtitle')}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/boutique">
            <Button className="bg-[#8b1a1a] hover:bg-[#a02020] text-white border-0">
              <RefreshCw size={14} className="mr-1.5" /> {t('retry')}
            </Button>
          </Link>
          <Link href="/boutique">
            <Button variant="outline" className="border-[oklch(0.25_0_0)] text-[oklch(0.65_0.005_0)] hover:text-white bg-transparent">
              <ArrowLeft size={14} className="mr-1.5" /> {t('goBack')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
