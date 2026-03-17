'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

interface BeforeAfterSliderProps {
  beforeSrc?: string;
  afterSrc?: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = 'Avant',
  afterLabel = 'Après',
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50); // percentage
  const dragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    updatePosition(e.clientX);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    dragging.current = true;
    updatePosition(e.touches[0].clientX);
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => { if (dragging.current) updatePosition(e.clientX); };
    const onTouch = (e: TouchEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      updatePosition(e.touches[0].clientX);
    };
    const onUp = () => { dragging.current = false; };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onTouch, { passive: false });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('touchend', onUp);
    };
  }, [updatePosition]);

  const Placeholder = ({ label }: { label: string }) => (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 select-none">
      <div className="w-10 h-10 rounded-lg bg-[oklch(0.14_0_0)] border border-[oklch(0.22_0_0)] flex items-center justify-center">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[oklch(0.3_0.005_0)]">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
      <span className="text-[10px] text-[oklch(0.3_0.005_0)] font-medium">{label}</span>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="relative aspect-video rounded-2xl overflow-hidden border border-[oklch(0.18_0_0)] bg-[oklch(0.09_0_0)] cursor-col-resize select-none"
      style={{ touchAction: 'none' }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      {/* Before (full width, clipped on right) */}
      <div className="absolute inset-0">
        {beforeSrc ? (
          <img src={beforeSrc} alt={beforeLabel} className="w-full h-full object-cover" draggable={false} />
        ) : (
          <div className="absolute inset-0 bg-[oklch(0.09_0_0)]">
            <Placeholder label={`Image "${beforeLabel}"`} />
          </div>
        )}
      </div>

      {/* After (clipped on left via clip-path) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 0 0 ${position}%)` }}
      >
        {afterSrc ? (
          <img src={afterSrc} alt={afterLabel} className="w-full h-full object-cover" draggable={false} />
        ) : (
          <div className="absolute inset-0 bg-[oklch(0.12_0_0)]">
            <Placeholder label={`Image "${afterLabel}"`} />
          </div>
        )}
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-px bg-white/60 pointer-events-none"
        style={{ left: `${position}%` }}
      />

      {/* Handle */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center pointer-events-none z-10"
        style={{ left: `${position}%` }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[oklch(0.15_0_0)]">
          <path d="M9 4L4 12l5 8M15 4l5 8-5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Labels */}
      <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-widest text-white/50 pointer-events-none">
        {beforeLabel}
      </span>
      <span className="absolute bottom-3 right-3 text-[10px] font-bold uppercase tracking-widest text-white/50 pointer-events-none">
        {afterLabel}
      </span>
    </div>
  );
}
