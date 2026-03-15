'use client';

import { useEffect, useRef } from 'react';

export function MouseGradient() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let animId: number;
    let targetX = 50;
    let targetY = 50;
    let currentX = 50;
    let currentY = 50;

    const onMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth) * 100;
      targetY = ((e.clientY + window.scrollY) / document.documentElement.scrollHeight) * 100;
    };

    const lerp = () => {
      currentX += (targetX - currentX) * 0.04;
      currentY += (targetY - currentY) * 0.04;
      el.style.background = `radial-gradient(ellipse 600px 400px at ${currentX}% ${currentY}%, rgba(139,26,26,0.15) 0%, transparent 70%)`;
      animId = requestAnimationFrame(lerp);
    };

    window.addEventListener('mousemove', onMove);
    animId = requestAnimationFrame(lerp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed inset-0 -z-10 transition-none"
    />
  );
}
