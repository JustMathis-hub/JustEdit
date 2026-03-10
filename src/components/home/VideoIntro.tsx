'use client';

import { useRef, useEffect, useState } from 'react';

export function VideoIntro() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);

  /* ── Check if video already loaded (cached) ── */
  useEffect(() => {
    const vid = videoRef.current;
    if (vid && vid.readyState >= 3) {
      setVideoLoaded(true);
    }
  }, []);

  /* ── Parallax on scroll ── */
  useEffect(() => {
    function onScroll() {
      setScrollY(window.scrollY);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Compute parallax values ── */
  const parallaxY = scrollY * 0.35;
  const opacity = Math.max(0, 1 - scrollY / 700);
  const textScale = 1 + scrollY * 0.0003;

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ height: '100vh' }}
    >
      {/* ── Video layer ── */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: `translateY(${parallaxY}px)` }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: videoLoaded ? 0.80 : 0 }}
          onLoadedData={() => setVideoLoaded(true)}
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        {/* ── Fallback background (shown when video not loaded) ── */}
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: videoLoaded ? 0 : 1 }}
        >
          {/* Animated dark gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 80% 60% at 50% 40%, rgba(139,26,26,0.12) 0%, transparent 60%),
                radial-gradient(ellipse 50% 40% at 20% 50%, rgba(100,15,15,0.08) 0%, transparent 50%),
                radial-gradient(ellipse 50% 40% at 80% 60%, rgba(80,10,10,0.06) 0%, transparent 50%),
                oklch(0.07 0 0)
              `,
            }}
          />
          {/* Noise texture */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: '200px 200px',
            }}
          />
        </div>
      </div>

      {/* ── Gradient overlays for blending ── */}
      {/* Top subtle darken */}
      <div
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none z-[2]"
        style={{ background: 'linear-gradient(to bottom, oklch(0.07 0 0 / 0.6), transparent)' }}
      />
      {/* Bottom heavy fade into page bg */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none z-[2]"
        style={{
          height: '55%',
          background: 'linear-gradient(to top, oklch(0.07 0 0) 0%, oklch(0.07 0 0 / 0.95) 20%, oklch(0.07 0 0 / 0.6) 50%, transparent 100%)',
        }}
      />
      {/* Side vignettes */}
      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          background: `
            radial-gradient(ellipse 120% 100% at 50% 50%, transparent 50%, oklch(0.07 0 0) 100%)
          `,
        }}
      />

      {/* ── "JustEdit" title overlay ── */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center z-[3] pointer-events-none"
        style={{
          opacity,
          transform: `scale(${textScale})`,
          willChange: 'transform, opacity',
        }}
      >
        <h1
          className="font-black tracking-tighter text-white text-center select-none"
          style={{
            fontSize: 'clamp(4rem, 12vw, 12rem)',
            lineHeight: 0.9,
            textShadow: '0 4px 60px rgba(0,0,0,0.7), 0 0 120px rgba(139,26,26,0.15)',
          }}
        >
          JustEdit
        </h1>
        {/* Subtle tagline */}
        <p
          className="mt-4 text-[oklch(0.45_0.005_0)] text-sm sm:text-base tracking-[0.25em] uppercase font-medium"
          style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
        >
          Plus rapide, plus rentable
        </p>
        {/* Accent line under text */}
        <div className="mt-6 h-px w-16 bg-gradient-to-r from-transparent via-[#8b1a1a] to-transparent opacity-60" />
      </div>

      {/* ── Scroll indicator ── */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[4] flex flex-col items-center gap-2 pointer-events-none"
        style={{ opacity: Math.max(0, 1 - scrollY / 300) }}
      >
        <span className="text-[9px] text-[oklch(0.35_0.005_0)] tracking-[0.3em] uppercase">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-[oklch(0.35_0.005_0)] to-transparent" />
      </div>
    </section>
  );
}
