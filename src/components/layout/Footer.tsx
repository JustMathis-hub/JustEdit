import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

export function Footer() {
  const t = useTranslations('footer');
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[oklch(0.15_0_0)] bg-[oklch(0.07_0_0)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-3">
              <Image src="/Logo.png" alt="JustEdit" width={120} height={32} className="h-8 w-auto object-contain" />
            </div>
            <p className="text-sm text-[oklch(0.45_0.005_0)] max-w-xs leading-relaxed">
              {t('tagline')}
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs font-semibold text-[oklch(0.35_0.005_0)] uppercase tracking-widest mb-4">
              {t('support')}
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
              {t('legalSection')}
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
              {t('securePayments')}
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
