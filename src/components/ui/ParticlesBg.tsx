'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  ox: number; oy: number;
  size: number;
  isBordeaux: boolean;
  opacity: number;
}

// Mobile: fewer particles, no connections (saves ~80% CPU on touch devices)
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
const PARTICLE_COUNT  = isMobile ? 25 : 40;   // was 75
const CONNECTION_DIST = isMobile ? 0  : 110;   // was 130 — skip O(n²) on mobile
const MOUSE_REPEL_DIST  = 90;
const MOUSE_REPEL_FORCE = 2.2;
const RETURN_SPEED = 0.032;
const DAMPING      = 0.83;

export function ParticlesBg() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const mouseRef    = useRef({ x: -9999, y: -9999 });
  const rafRef      = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef    = useRef(0); // for 30fps throttle

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0;
    let paused = false;

    function init() {
      w = canvas!.offsetWidth;
      h = canvas!.offsetHeight;
      canvas!.width  = w;
      canvas!.height = h;

      particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => {
        const x = Math.random() * w;
        const y = Math.random() * h;
        return {
          x, y, ox: x, oy: y,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 1.8 + 0.4,
          isBordeaux: Math.random() < 0.18,
          opacity: Math.random() * 0.35 + 0.1,
        };
      });
    }

    function draw() {
      rafRef.current = requestAnimationFrame(draw);
      if (paused) return;

      // 30fps cap — skip odd frames
      frameRef.current ^= 1;
      if (frameRef.current) return;

      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const particles = particlesRef.current;

      // Update positions
      for (const p of particles) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist2 = dx * dx + dy * dy;

        if (dist2 < MOUSE_REPEL_DIST * MOUSE_REPEL_DIST && dist2 > 0.01) {
          const dist  = Math.sqrt(dist2);
          const force = (1 - dist / MOUSE_REPEL_DIST) * MOUSE_REPEL_FORCE;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        p.vx += (p.ox - p.x) * RETURN_SPEED;
        p.vy += (p.oy - p.y) * RETURN_SPEED;
        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x  += p.vx;
        p.y  += p.vy;
      }

      // Draw connections between particles (desktop only — O(n²))
      if (CONNECTION_DIST > 0) {
        const connDist2 = CONNECTION_DIST * CONNECTION_DIST;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const a = particles[i], b = particles[j];
            const dx = a.x - b.x, dy = a.y - b.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < connDist2) {
              const alpha = (1 - Math.sqrt(d2) / CONNECTION_DIST) * 0.11;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
              ctx.lineWidth   = 0.5;
              ctx.stroke();
            }
          }
        }

        // Draw connections to mouse
        const maxDist  = CONNECTION_DIST * 1.6;
        const maxDist2 = maxDist * maxDist;
        for (const p of particles) {
          const dx = p.x - mx, dy = p.y - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < maxDist2) {
            const alpha = (1 - Math.sqrt(d2) / maxDist) * 0.28;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mx, my);
            ctx.strokeStyle = `rgba(139,26,26,${alpha})`;
            ctx.lineWidth   = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.isBordeaux
          ? `rgba(139,26,26,${p.opacity + 0.15})`
          : `rgba(255,255,255,${p.opacity})`;
        ctx.fill();
      }

      // Draw cursor dot (desktop only)
      if (!isMobile && mx > -1000) {
        ctx.beginPath();
        ctx.arc(mx, my, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(139,26,26,0.6)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(mx, my, 6, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(139,26,26,0.25)';
        ctx.lineWidth   = 1;
        ctx.stroke();
      }
    }

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onMouseLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };

    // Pause when tab is not visible
    const onVisChange = () => { paused = document.hidden; };

    init();
    draw();

    const ro = new ResizeObserver(() => { init(); });
    ro.observe(canvas);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('visibilitychange', onVisChange);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('visibilitychange', onVisChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 w-full h-full"
      style={{ opacity: 0.9 }}
    />
  );
}
