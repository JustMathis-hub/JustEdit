import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CookieBanner } from '@/components/layout/CookieBanner';
import { PromoBannerProvider, PromoBanner } from '@/components/layout/PromoBanner';
import { ScrollRevealInit } from '@/components/layout/ScrollRevealInit';
import { Toaster } from '@/components/ui/sonner';
import '../globals.css';

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home.hero' });

  return {
    title: {
      default: 'JustEdit',
      template: '%s | JustEdit',
    },
    description: t('subheadline'),
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://justedit.fr'),
    openGraph: {
      siteName: 'JustEdit',
      locale: locale === 'fr' ? 'fr_FR' : 'en_GB',
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <body>
        <NextIntlClientProvider messages={messages}>
          <PromoBannerProvider>
            <PromoBanner />
            <Navbar />
            <ScrollRevealInit />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
            <CookieBanner />
            <Toaster
              theme="dark"
              toastOptions={{
                style: {
                  background: 'oklch(0.13 0 0)',
                  border: '1px solid oklch(0.22 0 0)',
                  color: 'oklch(0.95 0.005 0)',
                },
              }}
            />
          </PromoBannerProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
