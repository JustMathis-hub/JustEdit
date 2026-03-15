import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Play } from 'lucide-react';

export function HeroSection() {
  const t = useTranslations('home.hero');

  return (
    <section className="relative flex items-center overflow-hidden">

      {/* ── Background ── */}
      <div className="absolute inset-0 bg-[oklch(0.07_0_0)]" />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8b1a1a] to-transparent opacity-70" />

      {/* Bordeaux glow — top left */}
      <div
        className="absolute -top-20 -left-20 w-[500px] h-[500px] opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,26,26,0.7) 0%, transparent 65%)' }}
      />
      {/* Bordeaux glow — bottom right */}
      <div
        className="absolute bottom-0 right-0 w-[400px] h-[400px] opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,26,26,0.6) 0%, transparent 65%)' }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(oklch(0.95 0.005 0) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.95 0.005 0) 1px, transparent 1px)
          `,
          backgroundSize: '56px 56px',
        }}
      />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[oklch(0.07_0_0)] to-transparent pointer-events-none" />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-6 sm:pb-16">
        <div className="grid lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] gap-12 xl:gap-20 items-center">

          {/* Left — Text */}
          <div>
            {/* Badge */}
            <div className="animate-fade-up delay-100 inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border border-[rgba(139,26,26,0.35)] bg-[rgba(139,26,26,0.08)] text-[#e07070] text-xs font-semibold">
              <Zap size={10} className="fill-current" />
              MOGRTS · Premiere Pro
            </div>

            {/* Headline */}
            <h1 className="animate-fade-up delay-200 text-4xl sm:text-6xl md:text-7xl xl:text-8xl font-black tracking-tighter text-white leading-[0.92] mb-3">
              {t('headline')}
            </h1>
            {/* Bordeaux underline accent */}
            <div className="animate-fade-up delay-300 h-1 w-24 bg-gradient-to-r from-[#8b1a1a] to-transparent rounded-full mb-8" />

            {/* Subheadline */}
            <p className="animate-fade-up delay-300 text-sm sm:text-xl text-[oklch(0.52_0.005_0)] max-w-xl mb-10 leading-relaxed">
              {t('subheadline')}
            </p>

            {/* CTAs */}
            <div className="animate-fade-up delay-400 flex flex-col sm:flex-row gap-3 mb-14">
              <Link href="/boutique">
                <style>{`
                  .je-hero-btn {
                    cursor: pointer;
                    font-size: 1rem;
                    border-radius: 16px;
                    border: none;
                    padding: 2px;
                    background: radial-gradient(circle 80px at 80% -10%, #a02020, #0f0505);
                    position: relative;
                    transition: transform 0.35s ease, box-shadow 0.35s ease, background 0.35s ease;
                  }
                  .je-hero-btn:hover {
                    transform: scale(0.98);
                    background: radial-gradient(circle 80px at 80% -10%, #b82828, #0f0505);
                    box-shadow: 0 0 40px rgba(139,26,26,0.18), 0 0 80px rgba(139,26,26,0.06);
                  }
                  .je-hero-btn::after {
                    content: "";
                    position: absolute;
                    width: 65%;
                    height: 60%;
                    border-radius: 120px;
                    top: 0;
                    right: 0;
                    box-shadow: 0 0 20px rgba(192,57,43,0.18);
                    z-index: -1;
                    transition: box-shadow 0.35s ease;
                  }
                  .je-hero-btn:hover::after {
                    box-shadow: 0 0 30px rgba(192,57,43,0.25);
                  }
                  .je-hero-blob {
                    position: absolute;
                    width: 80px;
                    height: 100%;
                    border-radius: 16px;
                    bottom: 0;
                    left: 0;
                    background: radial-gradient(circle 60px at 0% 100%, #8b1a1a, #4a0e0e50, transparent);
                    box-shadow: -10px 10px 30px rgba(139,26,26,0.18);
                    transition: box-shadow 0.35s ease, opacity 0.35s ease;
                  }
                  .je-hero-btn:hover .je-hero-blob {
                    box-shadow: -8px 8px 35px rgba(139,26,26,0.3);
                    opacity: 0.85;
                  }
                  .je-hero-inner {
                    padding: 10px 16px;
                    border-radius: 14px;
                    color: #fff;
                    font-weight: 700;
                    font-size: 0.875rem;
                    z-index: 3;
                    position: relative;
                    background: radial-gradient(circle 80px at 80% -50%, #5c1212, #0d0303);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    overflow: hidden;
                    transition: background 0.35s ease;
                  }
                  .je-hero-btn:hover .je-hero-inner {
                    background: radial-gradient(circle 80px at 80% -50%, #701818, #100606);
                  }
                  @media (min-width: 640px) {
                    .je-hero-inner { padding: 14px 28px; font-size: 1rem; }
                  }
                  .je-hero-inner::before {
                    content: "";
                    width: 100%;
                    height: 100%;
                    left: 0;
                    top: 0;
                    border-radius: 14px;
                    background: radial-gradient(circle 60px at 20% 110%, rgba(139,26,26,0.2), transparent 60%);
                    position: absolute;
                    transition: opacity 0.35s ease;
                  }
                  .je-hero-btn:hover .je-hero-inner::before {
                    opacity: 0.5;
                  }
                `}</style>
                <button type="button" className="je-hero-btn">
                  <span className="je-hero-blob" />
                  <span className="je-hero-inner">
                    {t('cta')}
                    <ArrowRight size={16} />
                  </span>
                </button>
              </Link>
              <Link href="/packs-gratuits">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[oklch(0.22_0_0)] text-[oklch(0.62_0.005_0)] hover:text-white hover:border-[oklch(0.32_0_0)] px-4 py-2 sm:px-8 sm:py-3 text-sm sm:text-base font-semibold bg-transparent gap-2"
                >
                  <Play size={13} className="fill-current" />
                  {t('ctaFree')}
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="animate-fade-up delay-500 flex items-center gap-5 sm:gap-10">
              {[
                { value: '2', label: t('packsAvailable') },
                { value: 'Pr', label: t('compatible') },
              ].map((stat, i) => (
                <div key={stat.label} className={`text-center ${i > 0 ? 'border-l border-[oklch(0.16_0_0)] pl-5 sm:pl-10' : ''}`}>
                  <div className="text-lg sm:text-2xl font-black text-white whitespace-nowrap">{stat.value}</div>
                  <div className="text-[11px] text-[oklch(0.38_0.005_0)] mt-0.5 whitespace-nowrap">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Floating product preview */}
          <div className="hidden lg:flex justify-center items-center animate-fade-up delay-400">
            <div className="relative" style={{ animation: 'float 6s ease-in-out infinite' }}>
              {/* Outer glow */}
              <div
                className="absolute -inset-6 rounded-3xl blur-2xl opacity-30"
                style={{ background: 'radial-gradient(circle, rgba(139,26,26,0.5) 0%, transparent 70%)' }}
              />

              {/* Product card mockup */}
              <Link href={"/boutique/just-number" as any} className="block">
                <div className="relative w-72 bg-[oklch(0.10_0_0)] border border-[oklch(0.19_0_0)] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-[rgba(139,26,26,0.4)] hover:shadow-[0_12px_40px_rgba(139,26,26,0.15)]">

                  {/* Preview area */}
                  <div className="h-44 bg-[oklch(0.075_0_0)] border-b border-[oklch(0.15_0_0)] flex items-center justify-center relative overflow-hidden">
                    {/* Video preview — place your video at /public/hero-preview.mp4 */}
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                      src="/hero-preview.mp4"
                    />
                    {/* Fallback: subtle grid + number if video not available */}
                    <div
                      className="absolute inset-0 opacity-[0.06]"
                      style={{
                        backgroundImage: 'linear-gradient(oklch(0.9 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(0.9 0 0) 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                      }}
                    />
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{ background: 'radial-gradient(circle at 50% 60%, rgba(139,26,26,0.6) 0%, transparent 60%)' }}
                    />
                    {/* Corner badge */}
                    <div className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold rounded-full bg-[rgba(139,26,26,0.25)] text-[#e07070] border border-[rgba(139,26,26,0.3)] z-10">
                      MOGRT
                    </div>
                  </div>

                  {/* Card info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-white text-sm leading-tight">Just Number</h3>
                        <p className="text-[11px] text-[oklch(0.42_0.005_0)] mt-0.5">{t('cardTagline')}</p>
                      </div>
                      <span className="text-lg font-black text-white">25€</span>
                    </div>
                    <div className="flex gap-1.5 mb-3">
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-[rgba(139,26,26,0.12)] text-[#c07070] border border-[rgba(139,26,26,0.2)]">Premiere Pro</span>
                    </div>
                    <div className="je-float-btn" role="button">
                      <span className="je-float-blob" />
                      <span className="je-float-inner">{t('buyNow')}</span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Floating chip */}
              <div className="absolute -top-4 -left-4 bg-[oklch(0.12_0_0)] border border-[oklch(0.22_0_0)] rounded-xl px-3 py-2 shadow-xl">
                <div className="text-xs font-bold text-white">NEW</div>
              </div>
            </div>
          </div>

        </div>
      </div>


    </section>
  );
}
