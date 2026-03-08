'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';
import { useState } from 'react';

interface Props {
  product: Product;
  purchased?: boolean;
  purchaseId?: string;
}

export function ProductCard({ product, purchased, purchaseId }: Props) {
  const locale = useLocale();
  const t = useTranslations('shop');
  const [imgError, setImgError] = useState(false);

  const name = locale === 'fr' ? product.name_fr : product.name_en;
  const price = product.is_free
    ? t('free')
    : formatPrice(product.price_cents, locale);

  return (
    <div className="group relative bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl overflow-hidden card-hover cursor-pointer">
      {/* Thumbnail */}
      <Link href={`/boutique/${product.slug}` as any}>
        <div className="relative aspect-video bg-[oklch(0.09_0_0)] overflow-hidden">
          {product.thumbnail_url && !imgError ? (
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

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-[oklch(0_0_0)]/0 group-hover:bg-[oklch(0_0_0)]/30 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <Play size={16} className="text-white ml-0.5" />
              </div>
            </div>
          </div>

          {/* Free badge */}
          {product.is_free && (
            <div className="absolute top-2.5 left-2.5">
              <span className="px-2 py-0.5 text-xs font-semibold bg-[rgba(139,26,26,0.9)] text-white rounded-md">
                {t('free')}
              </span>
            </div>
          )}
        </div>
      </Link>

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

        <Link href={`/boutique/${product.slug}` as any}>
          <h3 className="font-bold text-white text-sm mb-1 group-hover:text-[#e07070] transition-colors line-clamp-2">
            {name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-3">
          <span className="text-white font-black text-base">
            {price}
          </span>

          <Link href={`/boutique/${product.slug}` as any}>
            <button type="button" className="je-card-btn">
              <span className="je-card-blob" />
              <span className="je-card-inner">
                {product.is_free ? t('free') : 'Voir'}
              </span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
