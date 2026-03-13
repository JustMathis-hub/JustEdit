import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ChevronDown } from 'lucide-react';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('faq');
  return { title: `${t('title')} | JustEdit` };
}

const FAQ_COUNT = 8;

export default async function FAQPage() {
  const t = await getTranslations('faq');

  const faqItems = Array.from({ length: FAQ_COUNT }, (_, i) => ({
    q: t(`q${i + 1}`),
    a: t(`a${i + 1}`),
  }));

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <p className="text-xs font-semibold text-[#8b1a1a] uppercase tracking-widest mb-2">{t('support')}</p>
          <h1 className="text-3xl font-black text-white tracking-tight">{t('title')}</h1>
          <p className="text-[oklch(0.5_0.005_0)] mt-2">{t('subtitle')}</p>
        </div>

        <div className="space-y-2.5">
          {faqItems.map((item, i) => (
            <details
              key={i}
              className="group bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl overflow-hidden"
            >
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-white font-medium text-sm list-none hover:bg-[oklch(0.13_0_0)] transition-colors">
                {item.q}
                <ChevronDown
                  size={16}
                  className="text-[oklch(0.4_0.005_0)] group-open:rotate-180 transition-transform duration-200 shrink-0 ml-4"
                />
              </summary>
              <div className="px-5 pb-5 text-sm text-[oklch(0.6_0.005_0)] leading-relaxed border-t border-[oklch(0.15_0_0)] pt-3">
                {item.a}
              </div>
            </details>
          ))}
        </div>

        <div className="mt-10 p-5 bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl text-center">
          <p className="text-white font-semibold mb-1">{t('notFound')}</p>
          <p className="text-sm text-[oklch(0.5_0.005_0)] mb-4">{t('helpText')}</p>
          <Link
            href="/contact"
            className="inline-flex items-center px-5 py-2.5 bg-[#8b1a1a] hover:bg-[#a02020] text-white font-medium text-sm rounded-lg transition-colors"
          >
            {t('contactSupport')}
          </Link>
        </div>
      </div>
    </div>
  );
}
