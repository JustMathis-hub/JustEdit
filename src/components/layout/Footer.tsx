import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function Footer() {
  const t = useTranslations('footer');
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[oklch(0.15_0_0)] bg-[oklch(0.07_0_0)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <rect x="20" y="20" width="60" height="60" rx="8" fill="#8b1a1a"/>
                  <rect x="32" y="32" width="36" height="36" rx="2" fill="#0a0a0a"/>
                  <path d="M20 68 L32 56 L32 80 L20 80 Z" fill="#6b0f1a"/>
                </svg>
              </div>
              <span className="text-white font-bold text-base tracking-tight">
                Just<span className="text-[#8b1a1a]">Edit</span>
              </span>
            </div>
            <p className="text-sm text-[oklch(0.45_0.005_0)] max-w-xs leading-relaxed">
              {t('tagline')}
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs font-semibold text-[oklch(0.35_0.005_0)] uppercase tracking-widest mb-4">
              Support
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: '/faq' as const, label: t('faq') },
                { href: '/contact' as const, label: t('contact') },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[oklch(0.5_0.005_0)] hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-semibold text-[oklch(0.35_0.005_0)] uppercase tracking-widest mb-4">
              Légal
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: '/mentions-legales' as const, label: t('legal') },
                { href: '/conditions-generales-de-vente' as const, label: t('cgv') },
                { href: '/politique-de-confidentialite' as const, label: t('privacy') },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[oklch(0.5_0.005_0)] hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-[oklch(0.13_0_0)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[oklch(0.35_0.005_0)]">
            {t('rights', { year })}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[oklch(0.3_0.005_0)]">
              Paiements sécurisés via Stripe
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-5 bg-[oklch(0.18_0_0)] rounded flex items-center justify-center">
                <span className="text-[8px] font-bold text-[oklch(0.5_0.005_0)]">VISA</span>
              </div>
              <div className="w-8 h-5 bg-[oklch(0.18_0_0)] rounded flex items-center justify-center">
                <span className="text-[8px] font-bold text-[oklch(0.5_0.005_0)]">MC</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
