import { useTranslations } from 'next-intl';
import { CreditCard, Download, Film } from 'lucide-react';
import { AnimateIn } from '@/components/ui/AnimateIn';

const icons = [CreditCard, Download, Film];

export function HowItWorks() {
  const t = useTranslations('home.howItWorks');

  const steps = [
    { key: 'step1', icon: icons[0] },
    { key: 'step2', icon: icons[1] },
    { key: 'step3', icon: icons[2] },
  ] as const;

  return (
    <section className="py-28 px-4 sm:px-6 relative">
      {/* Top separator */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-[oklch(0.18_0_0)] to-transparent" />

      <div className="max-w-5xl mx-auto">
        <AnimateIn className="text-center mb-16">
          <p className="text-xs font-semibold text-[#8b1a1a] uppercase tracking-widest mb-3">Comment ça marche</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {t('title')}
          </h2>
        </AnimateIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-10 left-[22%] right-[22%] h-px">
            <div className="h-full bg-gradient-to-r from-transparent via-[oklch(0.22_0_0)] to-transparent" />
          </div>

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <AnimateIn key={step.key} delay={i * 120} className="relative flex flex-col items-center text-center group">
                {/* Step number + icon */}
                <div className="relative mb-5">
                  <div className="w-20 h-20 rounded-2xl bg-[oklch(0.10_0_0)] border border-[oklch(0.18_0_0)] group-hover:border-[rgba(139,26,26,0.35)] transition-colors flex items-center justify-center shadow-lg">
                    <Icon size={26} className="text-[#8b1a1a]" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[oklch(0.07_0_0)] border border-[oklch(0.22_0_0)] flex items-center justify-center">
                    <span className="text-[11px] font-black text-[oklch(0.45_0.005_0)]">{i + 1}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-2 group-hover:text-[oklch(0.9_0.005_0)] transition-colors">
                  {t(`${step.key}.title`)}
                </h3>
                <p className="text-sm text-[oklch(0.48_0.005_0)] leading-relaxed max-w-[200px]">
                  {t(`${step.key}.desc`)}
                </p>
              </AnimateIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
