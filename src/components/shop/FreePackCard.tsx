'use client';

import { useState } from 'react';
import { Film, Download, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface FreePackCardProps {
  title: string;
  description: string;
  itemCount: number;
  itemLabel: string;
  tags?: string[];
  videoUrl?: string;
  onObtenir?: () => void;
  /** If provided, the CTA button links to this page instead of calling onObtenir */
  slug?: string;
  locale?: string;
}

export function FreePackCard({
  title,
  description,
  itemCount,
  itemLabel,
  tags = [],
  videoUrl,
  onObtenir,
  slug,
  locale = 'fr',
}: FreePackCardProps) {
  const [hovered, setHovered] = useState(false);
  const packHref = slug ? `/${locale}/packs-gratuits/${slug}` : undefined;

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: 'oklch(0.09 0 0)',
        border: hovered ? '1px solid rgba(139,26,26,0.5)' : '1px solid oklch(0.16 0 0)',
        boxShadow: hovered
          ? '0 0 40px rgba(139,26,26,0.12), 0 8px 32px rgba(0,0,0,0.5)'
          : '0 4px 24px rgba(0,0,0,0.4)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        maxWidth: 520,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >

      {/* FREE badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05))',
          border: '1px solid rgba(255,255,255,0.15)',
          backdropFilter: 'blur(8px)',
        }}>
        <Sparkles size={11} className="text-white" />
        <span className="text-[11px] font-black text-white uppercase tracking-widest">Gratuit</span>
      </div>

      {/* Video / Thumbnail block */}
      <div className="relative w-full aspect-video bg-[oklch(0.07_0_0)] overflow-hidden">
        {videoUrl ? (
          <video
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          /* Placeholder */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            {/* Animated gradient grid preview */}
            <div className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, oklch(0.08 0 0) 0%, oklch(0.12 0.01 10) 50%, oklch(0.08 0 0) 100%)',
              }}>
              {/* Decorative color swatches */}
              <div className="absolute inset-0 grid grid-cols-5 grid-rows-2 gap-1 p-4 opacity-40">
                {['#1a1a2e','#16213e','#0f3460','#533483','#e94560',
                  '#2d2d2d','#1e1e1e','#3d3d3d','#4a4a4a','#2a2a2a'].map((color, i) => (
                  <div key={i} className="rounded-md" style={{ background: color }} />
                ))}
              </div>
              {/* Shimmer overlay */}
              <div className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)',
                }} />
            </div>
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-11 h-11 rounded-xl bg-[oklch(0.14_0_0)] border border-[oklch(0.22_0_0)] flex items-center justify-center">
                <Film size={20} className="text-[oklch(0.35_0.005_0)]" />
              </div>
              <span className="text-xs text-[oklch(0.3_0.005_0)] font-medium">Aperçu vidéo</span>
            </div>
          </div>
        )}
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{ background: 'linear-gradient(to top, oklch(0.09 0 0), transparent)' }} />
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map(tag => (
              <span key={tag}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: 'oklch(0.13 0 0)',
                  border: '1px solid oklch(0.2 0 0)',
                  color: 'oklch(0.5 0.005 0)',
                }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title + desc */}
        <h3 className="text-lg font-black text-white tracking-tight mb-1.5">{title}</h3>
        <p className="text-sm text-[oklch(0.45_0.005_0)] leading-relaxed mb-5">{description}</p>

        {/* Price row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">0 €</span>
            <span className="text-xs font-semibold text-[oklch(0.4_0.005_0)] uppercase tracking-wider">Gratuit</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[oklch(0.4_0.005_0)]">
            <Download size={12} />
            <span>Téléchargement direct</span>
          </div>
        </div>

        {/* CTA Button */}
        <style>{`
          .je-obtenir-btn {
            cursor: pointer;
            width: 100%;
            border: none;
            border-radius: 14px;
            padding: 2px;
            background: radial-gradient(circle 100px at 70% -20%, #2e2e2e, #0a0a0a);
            position: relative;
            transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
          }
          .je-obtenir-btn:hover {
            transform: scale(0.985);
            background: radial-gradient(circle 100px at 70% -20%, #3a3a3a, #0d0d0d);
            box-shadow: 0 0 30px rgba(255,255,255,0.05);
          }
          .je-obtenir-inner {
            padding: 13px 20px;
            border-radius: 12px;
            background: radial-gradient(circle 80px at 80% -40%, #222222, #080808);
            color: #fff;
            font-weight: 800;
            font-size: 0.95rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            position: relative;
            overflow: hidden;
            transition: background 0.3s ease;
          }
          .je-obtenir-btn:hover .je-obtenir-inner {
            background: radial-gradient(circle 80px at 80% -40%, #2c2c2c, #0c0c0c);
          }
          .je-obtenir-inner::before {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 12px;
            background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%);
            pointer-events: none;
          }
        `}</style>
        {packHref ? (
          <Link href={packHref} className="je-obtenir-btn" style={{ display: 'block', textDecoration: 'none' }}>
            <span className="je-obtenir-inner">
              <Download size={16} />
              Obtenir gratuitement
            </span>
          </Link>
        ) : (
          <button
            type="button"
            className="je-obtenir-btn"
            onClick={onObtenir}
          >
            <span className="je-obtenir-inner">
              <Download size={16} />
              Obtenir gratuitement
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
