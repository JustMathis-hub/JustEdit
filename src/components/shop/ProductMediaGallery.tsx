'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Film, Play, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface Slide {
  type: 'video' | 'image' | 'placeholder';
  src?: string;
  label?: string;
  gradient: string;
}

interface ProductMediaGalleryProps {
  videoUrl?: string;
  extraVideos?: string[];
  images?: string[];
  title: string;
}

const SLIDE_GRADIENTS = [
  'linear-gradient(135deg, #0d1117 0%, #1a1a2e 60%, #16213e 100%)',
  'linear-gradient(135deg, #0a0a14 0%, #0f0f3d 55%, #1a1a6e 100%)',
  'linear-gradient(135deg, #0d0d0d 0%, #1a0a0a 55%, #2d1111 100%)',
  'linear-gradient(135deg, #080810 0%, #14142e 55%, #202048 100%)',
];

export function ProductMediaGallery({
  videoUrl,
  extraVideos = [],
  images = [],
  title,
}: ProductMediaGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const allVideos = [
    ...(videoUrl ? [videoUrl] : []),
    ...extraVideos,
  ];

  /* Build slides: videos first, then images, then placeholders up to 4 total */
  const slides: Slide[] = [
    ...allVideos.map((src, i) => ({
      type: 'video' as const,
      src,
      label: i === 0 ? 'Aperçu vidéo' : `Aperçu ${i + 1}`,
      gradient: SLIDE_GRADIENTS[i % SLIDE_GRADIENTS.length],
    })),
    ...images.map((src, i) => ({
      type: 'image' as const,
      src,
      label: `Image ${String(i + 1).padStart(2, '0')}`,
      gradient: SLIDE_GRADIENTS[(allVideos.length + i) % SLIDE_GRADIENTS.length],
    })),
    // Fill remaining slots with placeholders to reach 4 slides minimum
    ...Array.from(
      { length: Math.max(0, 4 - allVideos.length - images.length) },
      (_, i) => ({
        type: 'placeholder' as const,
        label: `Aperçu ${String(allVideos.length + images.length + i + 1).padStart(2, '0')}`,
        gradient: SLIDE_GRADIENTS[(allVideos.length + images.length + i) % SLIDE_GRADIENTS.length],
      })
    ),
  ];

  const goTo = (idx: number) => {
    if (idx === current || isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setIsAnimating(false);
    }, 150);
  };

  const prev = () => goTo((current - 1 + slides.length) % slides.length);
  const next = () => goTo((current + 1) % slides.length);

  /* Play/pause videos based on active slide */
  useEffect(() => {
    videoRefs.current.forEach((ref, i) => {
      if (!ref) return;
      if (current === i) {
        ref.play().catch(() => {});
      } else {
        ref.pause();
      }
    });
  }, [current]);

  return (
    <div className="w-full">
      {/* ── Main display ── */}
      <div
        className="relative w-full rounded-2xl overflow-hidden"
        style={{
          aspectRatio: '16/9',
          background: '#060608',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 0 100px rgba(139,26,26,0.1), 0 40px 80px rgba(0,0,0,0.8)',
        }}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              opacity: current === i ? 1 : 0,
              transition: isAnimating ? 'opacity 0.15s ease' : 'opacity 0.4s ease',
              pointerEvents: current === i ? 'auto' : 'none',
            }}
          >
            {slide.type === 'video' && slide.src ? (
              <video
                ref={(el) => { videoRefs.current[i] = el; }}
                src={slide.src}
                autoPlay={i === 0}
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            ) : slide.type === 'image' && slide.src ? (
              <Image
                src={slide.src}
                alt={slide.label ?? title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
                priority={i === 1}
              />
            ) : (
              <div className="w-full h-full relative" style={{ background: slide.gradient }}>
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)' }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-25">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <Film size={24} className="text-white/60" />
                  </div>
                  <span className="text-xs text-white/50 font-medium tracking-widest uppercase">
                    {slide.label}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* ── Arrows ── */}
        <button
          onClick={prev}
          className="group absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer"
          style={{
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.7)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.45)'; }}
        >
          <ChevronLeft size={18} className="text-white/80" />
        </button>

        <button
          onClick={next}
          className="group absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer"
          style={{
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.7)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.45)'; }}
        >
          <ChevronRight size={18} className="text-white/80" />
        </button>

        {/* ── Slide counter ── */}
        <div
          className="absolute bottom-4 right-5 z-20 text-xs font-semibold tabular-nums"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          {current + 1} / {slides.length}
        </div>

        {/* ── Bottom fade ── */}
        <div
          className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to top, rgba(6,6,8,0.7), transparent)' }}
        />
      </div>

      {/* ── Thumbnail strip ── */}
      <div className="flex gap-2 mt-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {slides.map((slide, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="flex-shrink-0 relative rounded-lg overflow-hidden transition-all duration-300 cursor-pointer"
            style={{
              width: 64,
              aspectRatio: '16/9',
              background: slide.gradient,
              border: current === i ? '2px solid rgba(180,50,50,0.8)' : '2px solid rgba(255,255,255,0.05)',
              opacity: current === i ? 1 : 0.45,
              boxShadow: current === i ? '0 0 14px rgba(139,26,26,0.5)' : 'none',
              transform: current === i ? 'scale(1)' : 'scale(0.97)',
            }}
          >
            {slide.type === 'video' && slide.src ? (
              <>
                <video
                  src={slide.src}
                  muted
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover"
                  onLoadedMetadata={(e) => { e.currentTarget.currentTime = Number.MAX_SAFE_INTEGER; }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-black/50 flex items-center justify-center">
                    <Play size={7} className="text-white/80 ml-0.5" />
                  </div>
                </div>
              </>
            ) : slide.type === 'image' && slide.src ? (
              <Image
                src={slide.src}
                alt={slide.label ?? ''}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon size={9} className="text-white/30" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* ── Dot navigation ── */}
      <div className="flex justify-center gap-1.5 mt-4">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="rounded-full transition-all duration-300 cursor-pointer"
            style={{
              width: current === i ? 20 : 5,
              height: 5,
              background: current === i ? 'rgba(180,50,50,0.8)' : 'rgba(255,255,255,0.18)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
