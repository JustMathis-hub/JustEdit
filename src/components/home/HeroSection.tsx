import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap } from 'lucide-react';

export function HeroSection() {
  const t = useTranslations('home.hero');

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-[oklch(0.07_0_0)]" />

      {/* Bordeaux glow top center */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(139,26,26,0.6) 0%, transparent 70%)',
        }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(oklch(0.95 0.005 0) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.95 0.005 0) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[oklch(0.07_0_0)] to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center pt-24 pb-16">
        {/* Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border border-[rgba(139,26,26,0.3)] bg-[rgba(139,26,26,0.08)] text-[#e07070] text-xs font-medium">
          <Zap size={11} className="fill-current" />
          MOGRTS · After Effects · Premiere Pro
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-6 leading-[0.95]">
          {t('headline')}
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-[oklch(0.55_0.005_0)] max-w-2xl mx-auto mb-10 leading-relaxed">
          {t('subheadline')}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link href="/boutique">
            <Button
              size="lg"
              className="bg-[#8b1a1a] hover:bg-[#a02020] text-white border-0 px-8 py-3 text-base font-semibold group transition-all"
            >
              {t('cta')}
              <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/packs-gratuits">
            <Button
              size="lg"
              variant="outline"
              className="border-[oklch(0.25_0_0)] text-[oklch(0.65_0.005_0)] hover:text-white hover:border-[oklch(0.35_0_0)] px-8 py-3 text-base font-semibold bg-transparent"
            >
              {t('ctaFree')}
            </Button>
          </Link>
        </div>

        {/* Social proof */}
        <div className="mt-14 flex items-center justify-center gap-8">
          {[
            { value: '2', label: 'Packs disponibles' },
            { value: '100%', label: 'Satisfait ou remboursé' },
            { value: 'AE + PP', label: 'Compatible' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-black text-white">{stat.value}</div>
              <div className="text-xs text-[oklch(0.4_0.005_0)] mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
        <div className="w-px h-8 bg-gradient-to-b from-transparent to-[oklch(0.4_0.005_0)]" />
      </div>
    </section>
  );
}
