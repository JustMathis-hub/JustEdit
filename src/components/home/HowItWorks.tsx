import { useTranslations } from 'next-intl';
import { ShoppingCart, Download, Clapperboard } from 'lucide-react';
import { AnimateIn } from '@/components/ui/AnimateIn';
import { GlassBackground } from './GlassBackground';

const icons = [ShoppingCart, Download, Clapperboard];

export function HowItWorks() {
  const t = useTranslations('home.howItWorks');

  const steps = [
    { key: 'step1', icon: icons[0] },
    { key: 'step2', icon: icons[1] },
    { key: 'step3', icon: icons[2] },
  ] as const;

  return (
    <section className="py-8 sm:py-20 px-4 sm:px-6 relative overflow-hidden">
      {/* Interactive glass background */}
      <GlassBackground />

      <div className="max-w-5xl mx-auto relative z-10">
        <AnimateIn className="text-center mb-10 sm:mb-16">
          <h2 className="text-xl sm:text-4xl font-black text-white tracking-tight">
            {t('title')}
          </h2>
        </AnimateIn>

        {/* Glass card */}
        <div className="je-glass-card p-4 sm:p-10">
          <div className="je-scan" />

          <style>{`
            /* ── Metallic black sphere icon ── */
            .je-step-icon {
              position: relative;
              border-radius: 50%;
              background: #080808;
              border: 1.5px solid rgba(139, 26, 26, 0.7);
              box-shadow:
                0 0 10px rgba(139, 26, 26, 0.4),
                0 0 26px rgba(139, 26, 26, 0.18),
                0 6px 22px rgba(0, 0, 0, 0.75),
                inset 0 1px 0 rgba(255, 255, 255, 0.13),
                inset 0 -1px 0 rgba(0, 0, 0, 0.6);
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
              transition: box-shadow 0.35s ease, border-color 0.35s ease;
            }
            /* Grain texture */
            .je-step-icon::before {
              content: '';
              position: absolute;
              inset: 0;
              border-radius: 50%;
              background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E");
              opacity: 0.07;
              mix-blend-mode: overlay;
              pointer-events: none;
              z-index: 2;
            }
            /* Inner bordeaux rim glow */
            .je-step-icon::after {
              content: '';
              position: absolute;
              inset: 0;
              border-radius: 50%;
              box-shadow: inset 0 0 10px rgba(139, 26, 26, 0.2);
              pointer-events: none;
              z-index: 1;
            }
            .group:hover .je-step-icon {
              border-color: rgba(180, 40, 40, 0.95);
              box-shadow:
                0 0 16px rgba(139, 26, 26, 0.6),
                0 0 40px rgba(139, 26, 26, 0.28),
                0 6px 22px rgba(0, 0, 0, 0.75),
                inset 0 1px 0 rgba(255, 255, 255, 0.16),
                inset 0 -1px 0 rgba(0, 0, 0, 0.6);
            }
          `}</style>

          <div className="grid grid-cols-3 gap-2 sm:gap-6 relative">
            {/* Connecting line */}
            <div className="block absolute top-5 sm:top-10 left-[22%] right-[22%] h-px">
              <div className="h-full bg-gradient-to-r from-transparent via-[oklch(0.22_0_0)] to-transparent" />
            </div>

            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <AnimateIn key={step.key} delay={i * 120} className="relative z-10 flex flex-col items-center text-center group">
                  <div className="relative mb-5">
                    <div className="je-step-icon w-10 h-10 sm:w-20 sm:h-20">
                      <Icon size={15} className="sm:hidden relative z-10" style={{ color: 'rgba(255,255,255,0.8)', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.6))' }} />
                      <Icon size={26} className="hidden sm:block relative z-10" style={{ color: 'rgba(255,255,255,0.8)', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.6))' }} />
                    </div>
                  </div>

                  <h3 className="text-[10px] sm:text-base font-bold text-white mb-1 sm:mb-2 group-hover:text-[oklch(0.9_0.005_0)] transition-colors">
                    {t(`${step.key}.title`)}
                  </h3>
                  <p className="hidden sm:block text-sm text-[oklch(0.48_0.005_0)] leading-relaxed max-w-[200px]">
                    {t(`${step.key}.desc`)}
                  </p>
                </AnimateIn>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
