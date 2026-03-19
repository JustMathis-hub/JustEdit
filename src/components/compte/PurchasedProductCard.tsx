'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Package, CheckCircle2 } from 'lucide-react';
import { DownloadButton } from './DownloadButton';

interface Props {
  purchaseId: string;
  productName: string;
  productHref: string;
  thumbnailUrl?: string;
  videoUrl?: string;
}

export function PurchasedProductCard({
  purchaseId,
  productName,
  productHref,
  thumbnailUrl,
  videoUrl,
}: Props) {
  const router = useRouter();
  const t = useTranslations('account');
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className="relative rounded-2xl overflow-hidden flex flex-col"
      style={{ background: 'oklch(0.095 0 0)', border: '1px solid oklch(0.16 0 0)' }}
    >
      {/* Thumbnail / Video */}
      <div
        className="relative overflow-hidden group cursor-pointer"
        style={{ aspectRatio: '16/9', background: '#0a0a0f' }}
        onClick={() => router.push(productHref)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Poster image — always visible until video plays */}
        {thumbnailUrl && (
          <Image
            src={thumbnailUrl}
            alt={productName}
            fill
            className="object-cover transition-opacity duration-300 group-hover:opacity-0"
            sizes="(max-width: 640px) 100vw, 320px"
          />
        )}

        {/* Video — loads only on hover */}
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            muted
            loop
            playsInline
            preload="none"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          />
        ) : !thumbnailUrl ? (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0d1117 0%, #1a1a2e 60%, #16213e 100%)' }}
          >
            <Package size={28} className="text-[oklch(0.3_0.005_0)]" />
          </div>
        ) : null}

        {/* Scale overlay on hover */}
        <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-105 pointer-events-none" />

        {/* Badge */}
        <div
          className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full z-10"
          style={{
            background: 'rgba(16,185,129,0.15)',
            border: '1px solid rgba(16,185,129,0.3)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <CheckCircle2 size={10} className="text-emerald-400" />
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
            {t('obtained')}
          </span>
        </div>
      </div>

      {/* Info + Download */}
      <div className="p-4 flex flex-col gap-3">
        <p
          className="text-sm font-black text-white hover:text-[oklch(0.75_0.005_0)] transition-colors leading-tight cursor-pointer"
          onClick={() => router.push(productHref)}
        >
          {productName}
        </p>
        <DownloadButton purchaseId={purchaseId} variant="card" />
      </div>
    </div>
  );
}
