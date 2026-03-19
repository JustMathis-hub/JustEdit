'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Download, CheckCircle2, Play } from 'lucide-react';

interface ClaimedFreePackCardProps {
  title: string;
  slug: string;
  locale: string;
  downloadUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export function ClaimedFreePackCard({
  title,
  slug,
  locale,
  downloadUrl,
  videoUrl,
  thumbnailUrl,
}: ClaimedFreePackCardProps) {
  const router = useRouter();
  const t = useTranslations('account');
  const packHref = `/${locale}/packs-gratuits/${slug}`;

  return (
    <div
      className="relative rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: 'oklch(0.095 0 0)',
        border: '1px solid oklch(0.16 0 0)',
      }}
    >
      {/* ── Thumbnail — clique → page produit ── */}
      <div
        className="relative cursor-pointer overflow-hidden group"
        style={{ aspectRatio: '16/9', background: '#0a0a0f' }}
        onClick={() => router.push(packHref)}
      >
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 320px"
          />
        ) : videoUrl ? (
          <>
            <video
              src={videoUrl}
              muted
              loop
              playsInline
              preload="none"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onMouseEnter={(e) => { (e.currentTarget as HTMLVideoElement).play(); }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLVideoElement).pause(); }}
            />
            <div
              className="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-200"
              style={{ background: 'rgba(0,0,0,0.25)' }}
            >
              <Play size={28} className="text-white drop-shadow-lg" />
            </div>
          </>
        ) : (
          <div
            className="w-full h-full"
            style={{ background: 'linear-gradient(135deg, #0d1117 0%, #1a1a2e 60%, #16213e 100%)' }}
          />
        )}

        {/* Badge */}
        <div
          className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{
            background: 'rgba(16,185,129,0.15)',
            border: '1px solid rgba(16,185,129,0.3)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <CheckCircle2 size={10} className="text-emerald-400" />
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{t('obtained')}</span>
        </div>
      </div>

      {/* ── Info + Download ── */}
      <div className="p-4 flex flex-col gap-3">
        <p
          className="text-sm font-black text-white cursor-pointer hover:text-[oklch(0.75_0.005_0)] transition-colors leading-tight"
          onClick={() => router.push(packHref)}
        >
          {title}
        </p>

        {downloadUrl ? (
          <a
            href={downloadUrl}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-black text-sm text-white no-underline transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, rgba(139,26,26,0.9) 0%, rgba(80,10,10,0.95) 100%)',
              border: '1px solid rgba(200,60,60,0.35)',
              boxShadow: '0 0 20px rgba(139,26,26,0.25)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 30px rgba(139,26,26,0.5)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 20px rgba(139,26,26,0.25)';
            }}
          >
            <Download size={14} />
            {t('download')}
          </a>
        ) : (
          <div
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-black text-sm cursor-default"
            style={{
              background: 'oklch(0.12 0 0)',
              border: '1px solid oklch(0.18 0 0)',
              color: 'oklch(0.4 0.005 0)',
            }}
          >
            {t('comingSoon')}
          </div>
        )}
      </div>
    </div>
  );
}
