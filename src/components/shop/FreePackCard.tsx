'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Film, Download, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FreeDownloadModal } from './FreeDownloadModal';
import { HeartLike } from './HeartLike';

interface FreePackCardProps {
  title: string;
  description: string;
  itemCount: number;
  itemLabel: string;
  tags?: string[];
  videoUrl?: string;
  slug?: string;
  locale?: string;
  /** Passed from server — whether the current visitor is logged in */
  isAuthenticated?: boolean;
  /** Display name of the logged-in user */
  userName?: string;
  /** Redirect href used when user is not authenticated */
  loginHref?: string;
  /** Product UUID from DB — required to show the like button */
  productId?: string;
  /** Initial like count fetched server-side */
  initialLikeCount?: number;
}

export function FreePackCard({
  title,
  description,
  itemCount,
  itemLabel,
  tags = [],
  videoUrl,
  slug,
  locale = 'fr',
  isAuthenticated = false,
  userName = '',
  loginHref,
  productId,
  initialLikeCount = 0,
}: FreePackCardProps) {
  const [hovered, setHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations('freePacks');
  const tProduct = useTranslations('product');

  const packHref = slug ? `/${locale}/packs-gratuits/${slug}` : undefined;
  const authRedirect = loginHref ?? `/${locale}/auth/connexion${packHref ? `?redirect=${packHref}` : ''}`;

  const handleObtenir = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push(authRedirect);
      return;
    }
    setModalOpen(true);
  };

  return (
    <>
      {/* ── Card ── */}
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
        {/* ── Clickable area → product page ── */}
        {packHref ? (
          <Link href={packHref} className="block no-underline" style={{ color: 'inherit' }}>
            <CardBody videoUrl={videoUrl} tags={tags} title={title} description={description}
              freeBadgeLabel={t('freeBadge')} videoPreviewLabel={t('videoPreview')}
              heartOverlay={productId ? <HeartLike productId={productId} initialLikeCount={initialLikeCount} /> : undefined}
            />
          </Link>
        ) : (
          <CardBody videoUrl={videoUrl} tags={tags} title={title} description={description}
            freeBadgeLabel={t('freeBadge')} videoPreviewLabel={t('videoPreview')}
            heartOverlay={productId ? <HeartLike productId={productId} initialLikeCount={initialLikeCount} /> : undefined}
          />
        )}

        {/* ── Footer: price + CTA button (outside Link to avoid nesting) ── */}
        <div className="px-5 pb-5">
          {/* Price row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">0 €</span>
              <span className="text-xs font-semibold text-[oklch(0.4_0.005_0)] uppercase tracking-wider">{t('freeBadge')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[oklch(0.4_0.005_0)]">
              <Download size={12} />
              <span>{t('directDownload')}</span>
            </div>
          </div>

          {/* CTA Button */}
          <style>{`
            .je-obtenir-btn {
              cursor: pointer; width: 100%; border: none;
              border-radius: 14px; padding: 2px;
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
              padding: 13px 20px; border-radius: 12px;
              background: radial-gradient(circle 80px at 80% -40%, #222222, #080808);
              color: #fff; font-weight: 800; font-size: 0.95rem;
              display: flex; align-items: center; justify-content: center; gap: 8px;
              position: relative; overflow: hidden;
              transition: background 0.3s ease;
            }
            .je-obtenir-btn:hover .je-obtenir-inner {
              background: radial-gradient(circle 80px at 80% -40%, #2c2c2c, #0c0c0c);
            }
            .je-obtenir-inner::before {
              content: ""; position: absolute; inset: 0; border-radius: 12px;
              background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%);
              pointer-events: none;
            }
          `}</style>
          <button type="button" className="je-obtenir-btn" onClick={handleObtenir}>
            <span className="je-obtenir-inner">
              <Download size={16} />
              {tProduct('claimFree')}
            </span>
          </button>
        </div>
      </div>

      {/* ── Download modal ── */}
      <FreeDownloadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        packSlug={slug ?? ''}
        packName={title}
        userName={userName}
      />
    </>
  );
}

/* ─────────────────────────────────────────────
   Inner card body (thumbnail + tags + title/desc)
   Extracted so it can be wrapped in a Link or not
───────────────────────────────────────────── */
function CardBody({
  videoUrl,
  tags,
  title,
  description,
  freeBadgeLabel,
  videoPreviewLabel,
  heartOverlay,
}: {
  videoUrl?: string;
  tags: string[];
  title: string;
  description: string;
  freeBadgeLabel: string;
  videoPreviewLabel: string;
  heartOverlay?: React.ReactNode;
}) {
  return (
    <>
      {/* FREE badge */}
      <div
        className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05))',
          border: '1px solid rgba(255,255,255,0.15)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Sparkles size={11} className="text-white" />
        <span className="text-[11px] font-black text-white uppercase tracking-widest">{freeBadgeLabel}</span>
      </div>

      {/* Video / Thumbnail */}
      <div className="relative w-full aspect-video bg-[oklch(0.07_0_0)] overflow-hidden">
        {videoUrl ? (
          <video src={videoUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, oklch(0.08 0 0) 0%, oklch(0.12 0.01 10) 50%, oklch(0.08 0 0) 100%)',
              }}
            >
              <div className="absolute inset-0 grid grid-cols-5 grid-rows-2 gap-1 p-4 opacity-40">
                {['#1a1a2e','#16213e','#0f3460','#533483','#e94560',
                  '#2d2d2d','#1e1e1e','#3d3d3d','#4a4a4a','#2a2a2a'].map((color, i) => (
                  <div key={i} className="rounded-md" style={{ background: color }} />
                ))}
              </div>
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)' }} />
            </div>
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-11 h-11 rounded-xl bg-[oklch(0.14_0_0)] border border-[oklch(0.22_0_0)] flex items-center justify-center">
                <Film size={20} className="text-[oklch(0.35_0.005_0)]" />
              </div>
              <span className="text-xs text-[oklch(0.3_0.005_0)] font-medium">{videoPreviewLabel}</span>
            </div>
          </div>
        )}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{ background: 'linear-gradient(to top, oklch(0.09 0 0), transparent)' }}
        />
        {heartOverlay && (
          <div className="absolute bottom-2.5 right-2.5 z-[2]">
            {heartOverlay}
          </div>
        )}
      </div>

      {/* Tags + title + desc */}
      <div className="px-5 pt-4">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: 'oklch(0.13 0 0)', border: '1px solid oklch(0.2 0 0)', color: 'oklch(0.5 0.005 0)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <h3 className="text-lg font-black text-white tracking-tight mb-1.5">{title}</h3>
        <p className="text-sm text-[oklch(0.45_0.005_0)] leading-relaxed pb-4">{description}</p>
      </div>
    </>
  );
}
