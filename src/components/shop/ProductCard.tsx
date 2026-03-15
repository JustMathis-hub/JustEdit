'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { PROMO_PRICES } from '@/lib/promoConfig';
import type { Product } from '@/types';
import { useState } from 'react';
import { HeartLike } from './HeartLike';

const TAGLINES: Record<string, Record<string, string>> = {
  'just-number': { fr: 'Compteur · Titre · Animation', en: 'Counter · Title · Animation' },
  'just-text': { fr: 'Texte · Titre · Motion', en: 'Text · Title · Motion' },
};

const COMING_SOON_SLUGS = ['just-text'];

interface Props {
  product: Product;
  purchased?: boolean;
  purchaseId?: string;
  likeCount?: number;
}

export function ProductCard({ product, purchased, purchaseId, likeCount = 0 }: Props) {
  const locale = useLocale();
  const t = useTranslations('shop');
  const [imgError, setImgError] = useState(false);

  const name = locale === 'fr' ? product.name_fr : product.name_en;
  const taglineObj = TAGLINES[product.slug];
  const tagline = taglineObj ? taglineObj[locale] || taglineObj['fr'] : undefined;
  const comingSoon = COMING_SOON_SLUGS.includes(product.slug);
  const salePrice = !product.is_free ? PROMO_PRICES[product.slug] : undefined;
  const price = product.is_free
    ? t('free')
    : formatPrice(salePrice ?? product.price_cents, locale);

  const thumbnailBlock = (
    <div className="relative aspect-video bg-[oklch(0.09_0_0)] overflow-hidden">
      {product.preview_video_url ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={product.preview_video_url}
        />
      ) : product.thumbnail_url && !imgError ? (
        <Image
          src={product.thumbnail_url}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[oklch(0.15_0_0)] flex items-center justify-center">
            <Play size={20} className="text-[oklch(0.35_0.005_0)] ml-0.5" />
          </div>
        </div>
      )}

      {/* Coming soon badge — top right */}
      {comingSoon && (
        <div className="absolute top-2.5 right-2.5 z-10">
          <style>{`
            .je-coming-soon {
              position: relative;
              display: inline-block;
              padding: 5px 14px;
              border-radius: 99rem;
              border: 1.5px solid rgba(139,26,26,0.6);
              background: rgba(10,2,2,0.75);
              backdrop-filter: blur(8px);
              -webkit-backdrop-filter: blur(8px);
              color: #e07070;
              font-size: 10px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              line-height: 1.5;
              overflow: hidden;
              cursor: default;
              -webkit-mask-image: -webkit-radial-gradient(#000, #fff);
            }
            .je-coming-soon span {
              position: relative;
              z-index: 2;
              mix-blend-mode: difference;
            }
            .je-coming-soon::before,
            .je-coming-soon::after {
              content: "";
              position: absolute;
              inset: 0;
              background: linear-gradient(
                90deg,
                #8b1a1a 25%, transparent 0,
                transparent 50%, #8b1a1a 0,
                #8b1a1a 75%, transparent 0
              );
              transform: translateY(var(--progress, 100%));
              transition: transform 0.25s ease;
            }
            .je-coming-soon::after {
              --progress: -100%;
              background: linear-gradient(
                90deg,
                transparent 0, transparent 25%,
                #8b1a1a 0, #8b1a1a 50%,
                transparent 0, transparent 75%,
                #8b1a1a 0
              );
              z-index: 1;
            }
            .je-coming-soon:hover::before,
            .je-coming-soon:hover::after {
              --progress: 0;
            }
          `}</style>
          <div className="je-coming-soon">
            <span>{t('comingSoon')}</span>
          </div>
        </div>
      )}

      {/* Overlay on hover */}
      {!comingSoon && (
        <div className="absolute inset-0 bg-[oklch(0_0_0)]/0 group-hover:bg-[oklch(0_0_0)]/30 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <Play size={16} className="text-white ml-0.5" />
            </div>
          </div>
        </div>
      )}

      {/* Free badge */}
      {product.is_free && !comingSoon && (
        <div className="absolute top-2.5 left-2.5">
          <span className="px-2 py-0.5 text-xs font-semibold bg-[rgba(139,26,26,0.9)] text-white rounded-md">
            {t('free')}
          </span>
        </div>
      )}

      {/* Heart like button — bottom right */}
      {!comingSoon && (
        <div className="absolute bottom-2.5 right-2.5 z-10">
          <HeartLike
            productId={product.id}
            initialLikeCount={likeCount}
          />
        </div>
      )}
    </div>
  );

  const promoBadge = salePrice && !comingSoon ? (
    <div
      className="absolute -top-4 -right-4 z-20 pointer-events-none select-none"
      style={{ transform: 'rotate(14deg)' }}
    >
      <svg
        width="56"
        height="56"
        className="sm:!w-[72px] sm:!h-[72px]"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 0 5px rgba(139,26,26,0.95)) drop-shadow(0 0 16px rgba(139,26,26,0.55))' }}
      >
        <defs>
          <radialGradient id={`pg-${product.slug}`} cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#b52a2a" />
            <stop offset="100%" stopColor="#1e0204" />
          </radialGradient>
        </defs>
        <polygon
          points="50,3 57,17 68,7 69,21 83,17 79,31 93,32 84,43 97,50 84,57 93,68 79,69 83,83 69,79 68,93 57,83 50,97 43,83 32,93 31,79 17,83 21,69 7,68 16,57 3,50 16,43 7,32 21,31 17,17 31,21 32,7 43,17"
          fill={`url(#pg-${product.slug})`}
          stroke="rgba(210,70,70,0.25)"
          strokeWidth="0.8"
        />
        <line x1="34" y1="55" x2="66" y2="55" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
        <text x="50" y="47" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="14.5" fontWeight="900" letterSpacing="1.5" fontFamily="system-ui,-apple-system,sans-serif">PROMO</text>
        <text x="50" y="62" textAnchor="middle" dominantBaseline="middle" fill="rgba(255,185,185,0.8)" fontSize="7" fontWeight="700" letterSpacing="1.8" fontFamily="system-ui,-apple-system,sans-serif">LANCEMENT</text>
      </svg>
    </div>
  ) : null;

  return (
    <div
      className="relative"
      style={{ transition: 'transform 0.2s ease' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; }}
    >
    <div className={`group relative bg-[oklch(0.11_0_0)] rounded-xl overflow-hidden ${comingSoon ? 'cursor-default' : 'cursor-pointer'}`}
      style={{
        border: '1px solid rgba(139,26,26,0.35)',
        boxShadow: '0 0 0 1px rgba(139,26,26,0.08), 0 0 16px rgba(139,26,26,0.12), inset 0 1px 0 rgba(255,255,255,0.04)',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(139,26,26,0.65)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 1px rgba(139,26,26,0.15), 0 0 28px rgba(139,26,26,0.22), inset 0 1px 0 rgba(255,255,255,0.05)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(139,26,26,0.35)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 1px rgba(139,26,26,0.08), 0 0 16px rgba(139,26,26,0.12), inset 0 1px 0 rgba(255,255,255,0.04)';
      }}
    >
      {/* Thumbnail / Video */}
      {comingSoon ? (
        <div>{thumbnailBlock}</div>
      ) : (
        <Link href={`/boutique/${product.slug}` as any}>{thumbnailBlock}</Link>
      )}

      {/* Info */}
      <div className="p-4">
        {/* Software tags */}
        {product.software_tags.length > 0 && (
          <div className="flex gap-1.5 mb-2.5">
            {product.software_tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[oklch(0.16_0_0)] text-[oklch(0.5_0.005_0)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h3 className={`font-bold text-white text-sm mb-0.5 line-clamp-2 ${comingSoon ? '' : 'group-hover:text-[#e07070] transition-colors'}`}>
          {name}
        </h3>
        {tagline && (
          <p className="text-[11px] text-[oklch(0.42_0.005_0)] mt-0.5">
            {tagline}
          </p>
        )}

        <div className="flex items-center justify-between mt-2">
          {comingSoon ? (
            <span className="text-[oklch(0.42_0.005_0)] font-semibold text-sm italic">
              {t('comingSoonLong')}
            </span>
          ) : (
            <>
              <span className="flex items-baseline gap-1.5">
                <span className="text-white font-black text-base">{price}</span>
                {salePrice && (
                  <span className="text-[oklch(0.45_0.005_0)] text-sm line-through">
                    {formatPrice(product.price_cents, locale)}
                  </span>
                )}
              </span>

              <Link href={`/boutique/${product.slug}` as any}>
                <button type="button" className="je-card-btn">
                  <span className="je-card-blob" />
                  <span className="je-card-inner">
                    {product.is_free ? t('free') : t('view')}
                  </span>
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
    {promoBadge}
    </div>
  );
}
