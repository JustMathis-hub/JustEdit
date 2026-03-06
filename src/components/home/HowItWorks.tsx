import { useTranslations } from 'next-intl';
import { CreditCard, Download, Film } from 'lucide-react';

const icons = [CreditCard, Download, Film];

export function HowItWorks() {
  const t = useTranslations('home.howItWorks');

  const steps = [
    { key: 'step1', icon: icons[0] },
    { key: 'step2', icon: icons[1] },
    { key: 'step3', icon: icons[2] },
  ] as const;

  return (
    <section className="py-24 px-4 sm:px-6 relative">
      {/* Separator line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-[oklch(0.18_0_0)] to-transparent" />

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {t('title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line desktop */}
          <div className="hidden md:block absolute top-8 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-[oklch(0.22_0_0)] to-transparent" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.key} className="relative flex flex-col items-center text-center">
                {/* Step number */}
                <div className="relative mb-5">
                  <div className="w-16 h-16 rounded-full bg-[oklch(0.11_0_0)] border border-[oklch(0.2_0_0)] flex items-center justify-center">
                    <Icon size={24} className="text-[#8b1a1a]" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[oklch(0.07_0_0)] border border-[oklch(0.22_0_0)] flex items-center justify-center">
                    <span className="text-[10px] font-bold text-[oklch(0.45_0.005_0)]">{i + 1}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-2">
                  {t(`${step.key}.title`)}
                </h3>
                <p className="text-sm text-[oklch(0.5_0.005_0)] leading-relaxed">
                  {t(`${step.key}.desc`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
