'use client';

import React, { useRef, useEffect } from 'react';

export function GlassBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const section = el.parentElement;
    if (!section) return;

    let raf: number;
    let tx = 0.5, ty = 0.5;
    let cx = 0.5, cy = 0.5;

    function onMouseMove(e: MouseEvent) {
      const rect = section!.getBoundingClientRect();
      tx = (e.clientX - rect.left) / rect.width;
      ty = (e.clientY - rect.top) / rect.height;
    }

    function tick() {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      el!.style.setProperty('--mx', `${cx * 100}%`);
      el!.style.setProperty('--my', `${cy * 100}%`);
      el!.style.setProperty('--mx2', `${(1 - cx) * 100}%`);
      el!.style.setProperty('--my2', `${(1 - cy) * 100}%`);
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    section.addEventListener('mousemove', onMouseMove);

    return () => {
      cancelAnimationFrame(raf);
      section.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={({ '--mx': '50%', '--my': '50%', '--mx2': '50%', '--my2': '50%' }) as React.CSSProperties}
    >
      <style>{`
        /* ── Grid quadrillage — neutral, full coverage ── */
        .je-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(oklch(0.95 0.005 0) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.95 0.005 0) 1px, transparent 1px);
          background-size: 56px 56px;
          opacity: 0.032;
          z-index: 0;
        }

        /* ── Streak 1 — light red, follows mouse ── */
        .je-streak-1 {
          position: absolute;
          width: 18%;
          height: 140%;
          top: -20%;
          left: calc(var(--mx) - 14%);
          background: linear-gradient(
            170deg,
            transparent 0%,
            rgba(220, 60, 60, 0.08) 25%,
            rgba(255, 100, 80, 0.12) 50%,
            rgba(200, 50, 50, 0.07) 75%,
            transparent 100%
          );
          transform: rotate(-8deg);
          filter: blur(28px);
          mix-blend-mode: screen;
        }

        /* ── Streak 2 — deeper red accent, inverted mouse ── */
        .je-streak-2 {
          position: absolute;
          width: 12%;
          height: 120%;
          top: -10%;
          left: calc(var(--mx2) - 6%);
          background: linear-gradient(
            165deg,
            transparent 0%,
            rgba(180, 30, 30, 0.13) 30%,
            rgba(230, 70, 40, 0.10) 55%,
            transparent 100%
          );
          transform: rotate(6deg);
          filter: blur(22px);
          mix-blend-mode: screen;
        }

        /* ── Streak 3 — rose wide, mouse horizontal ── */
        .je-streak-3 {
          position: absolute;
          width: 25%;
          height: 160%;
          top: -30%;
          left: calc(var(--mx) - 5%);
          background: linear-gradient(
            175deg,
            transparent 0%,
            rgba(240, 70, 50, 0.05) 40%,
            rgba(200, 50, 50, 0.07) 60%,
            transparent 100%
          );
          transform: rotate(12deg);
          filter: blur(50px);
          mix-blend-mode: screen;
        }

        /* ── Streak 4 — narrow sharp rose, offset ── */
        .je-streak-4 {
          position: absolute;
          width: 6%;
          height: 110%;
          top: -5%;
          left: calc(var(--mx) + 8%);
          background: linear-gradient(
            180deg,
            transparent 0%,
            rgba(255, 110, 90, 0.14) 35%,
            rgba(230, 80, 60, 0.10) 65%,
            transparent 100%
          );
          transform: rotate(-3deg);
          filter: blur(12px);
          mix-blend-mode: screen;
        }

        /* ── Radial glow at mouse position ── */
        .je-glow-mouse {
          position: absolute;
          width: 50%;
          height: 50%;
          top: calc(var(--my) - 25%);
          left: calc(var(--mx) - 25%);
          background: radial-gradient(
            ellipse at center,
            rgba(200, 50, 50, 0.08) 0%,
            rgba(139, 26, 26, 0.04) 40%,
            transparent 70%
          );
          filter: blur(30px);
          mix-blend-mode: screen;
        }

        /* ── Top/bottom fade — seamless blend with page bg ── */
        .je-fade-top {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 20%;
          background: linear-gradient(to bottom, oklch(0.07 0 0) 0%, transparent 100%);
          z-index: 3;
          pointer-events: none;
        }
        .je-fade-bottom {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 20%;
          background: linear-gradient(to top, oklch(0.07 0 0) 0%, transparent 100%);
          z-index: 3;
          pointer-events: none;
        }

        /* ── Glass card ── */
        .je-glass-card {
          position: relative;
          background: rgba(255, 255, 255, 0.022);
          border: 1px solid rgba(200, 50, 50, 0.1);
          border-radius: 24px;
          backdrop-filter: blur(20px) saturate(1.4);
          -webkit-backdrop-filter: blur(20px) saturate(1.4);
          box-shadow:
            0 0 0 1px rgba(139, 26, 26, 0.07),
            0 20px 60px rgba(0, 0, 0, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.05),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2);
        }

        /* ── Scan line overlay ── */
        .je-scan {
          position: absolute;
          inset: 0;
          border-radius: 24px;
          overflow: hidden;
          pointer-events: none;
        }
        .je-scan::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255,255,255,0.008) 2px,
            rgba(255,255,255,0.008) 4px
          );
        }
      `}</style>

      {/* Grid quadrillage */}
      <div className="je-grid" />

      {/* Prismatic streaks */}
      <div className="je-streak-1" />
      <div className="je-streak-2" />
      <div className="je-streak-3" />
      <div className="je-streak-4" />
      <div className="je-glow-mouse" />

      {/* Seamless edge fades */}
      <div className="je-fade-top" />
      <div className="je-fade-bottom" />
    </div>
  );
}
