'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const next = locale === 'fr' ? 'en' : 'fr';
    router.replace(pathname, { locale: next });
  };

  return (
    <button
      onClick={toggleLocale}
      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold tracking-wider text-[oklch(0.55_0.005_0)] hover:text-white border border-[oklch(0.22_0_0)] hover:border-[oklch(0.32_0_0)] rounded-md transition-all"
      aria-label="Switch language"
    >
      <span className={locale === 'fr' ? 'text-white' : 'opacity-50'}>FR</span>
      <span className="opacity-30">/</span>
      <span className={locale === 'en' ? 'text-white' : 'opacity-50'}>EN</span>
    </button>
  );
}
