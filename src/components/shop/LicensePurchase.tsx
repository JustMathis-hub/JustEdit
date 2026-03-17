'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, Download } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from '@/i18n/navigation';
import { toast } from 'sonner';

interface Props {
  productId: string;
  productSlug: string;
  isFree: boolean;
  priceCents: number;
  originalPriceCents?: number;
  locale: string;
  alreadyPurchased: boolean;
  purchaseId?: string;
}

export function LicensePurchase({
  productId,
  productSlug,
  isFree,
  priceCents,
  originalPriceCents,
  locale,
  alreadyPurchased,
  purchaseId,
}: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const tLicense = useTranslations('license');
  const tProduct = useTranslations('product');

  const fmt = (cents: number) =>
    new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(cents / 100);

  const savingsCents = originalPriceCents ? originalPriceCents - priceCents : 0;
  const savingsPct = originalPriceCents
    ? Math.round((savingsCents / originalPriceCents) * 100)
    : 0;

  const handleBuy = async () => {
    setLoading(true);
    try {
      if (alreadyPurchased && purchaseId) {
        const res = await fetch(`/api/download/${purchaseId}`);
        if (!res.ok) throw new Error('Download failed');
        const { url } = await res.json();
        window.open(url, '_blank');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/connexion'); return; }

      if (isFree) { window.location.href = `/${locale}/boutique/${productSlug}`; return; }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, licenseType: 'personal', locale }),
      });
      if (!res.ok) { const { error } = await res.json(); throw new Error(error ?? 'Checkout failed'); }
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  /* ── Already purchased ── */
  if (alreadyPurchased) {
    return (
      <div className="rounded-2xl p-6" style={{ background: 'oklch(0.095 0 0)', border: '1px solid oklch(0.16 0 0)' }}>
        <button onClick={handleBuy} disabled={loading}
          className="w-full rounded-xl border border-[oklch(0.25_0_0)] text-white font-semibold py-4 text-sm uppercase tracking-widest transition-all hover:border-[oklch(0.35_0_0)] cursor-pointer flex items-center justify-center gap-2"
          style={{ background: 'oklch(0.11 0 0)' }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {tProduct('alreadyPurchased')}
        </button>
      </div>
    );
  }

  /* ── Free pack ── */
  if (isFree) {
    return (
      <div className="rounded-2xl p-6" style={{ background: 'oklch(0.095 0 0)', border: '1px solid oklch(0.16 0 0)' }}>
        <button onClick={handleBuy} disabled={loading}
          className="w-full rounded-xl text-white font-bold py-4 text-sm uppercase tracking-widest transition-all hover:opacity-90 cursor-pointer flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #8b1a1a, #c03030)' }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {tProduct('claimFree')}
        </button>
      </div>
    );
  }

  /* ── Paid product — premium redesign ── */
  const features = [
    tProduct('mogrtFile'),
    tProduct('compatiblePr'),
    tProduct('freeUpdates'),
  ];

  return (
    <>
      <style>{`
        /* ── Card top accent line ── */
        .je-card-accent {
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, #8b1a1a 30%, #e04040 50%, #8b1a1a 70%, transparent 100%);
        }

        /* ── Gradient fade button ── */
        .je-btn-shell {
          position: relative;
          border-radius: 14px;
          width: 100%;
        }
        .je-btn-face {
          position: relative;
          width: 100%;
          border-radius: 12px;
          padding: 17px 28px;
          font-size: 1.05rem;
          font-weight: 900;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #ffffff;
          cursor: pointer;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: linear-gradient(135deg, #4a0808 0%, #aa1818 40%, #cc2020 65%, #7a0e0e 100%);
          box-shadow: 0 0 0 1.5px rgba(204,32,32,0.35), 0 4px 24px rgba(139,26,26,0.35);
          transition: background 0.4s ease, box-shadow 0.3s ease, opacity 0.15s ease;
          overflow: hidden;
        }
        .je-btn-face::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          background: linear-gradient(135deg, #7a1212 0%, #dd2828 40%, #ff4040 65%, #aa1818 100%);
          opacity: 0;
          transition: opacity 0.35s ease;
        }
        .je-btn-face:hover::after { opacity: 1; }
        .je-btn-face:active::after {
          background: linear-gradient(135deg, #300505 0%, #881414 40%, #aa1e1e 65%, #5a0a0a 100%);
          opacity: 1;
          transition: opacity 0.08s ease;
        }
        .je-btn-face > * { position: relative; z-index: 1; }
        .je-btn-face:disabled { opacity: 0.45; cursor: not-allowed; }

        /* ── Savings tag ── */
        .je-savings-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          background: rgba(139,26,26,0.15);
          border: 1px solid rgba(200,50,50,0.2);
          color: #d95050;
        }

        /* ── Promo badge ── */
        .je-promo-badge {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #c84040;
          padding: 3px 9px;
          border-radius: 4px;
          border: 1px solid rgba(200,60,60,0.25);
          background: rgba(139,26,26,0.12);
        }

        /* ── Check item ── */
        .je-check-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          color: oklch(0.60 0.005 0);
          line-height: 1.4;
        }
        .je-check-mark {
          flex-shrink: 0;
          width: 18px;
          height: 18px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(139,26,26,0.1);
          border: 1px solid rgba(139,26,26,0.22);
          font-size: 10px;
          color: #c84040;
          font-weight: 900;
        }

        /* ── Divider ── */
        .je-divider {
          height: 1px;
          background: oklch(0.13 0 0);
          width: 100%;
        }
      `}</style>

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'oklch(0.07 0 0)',
          border: '1px solid oklch(0.13 0 0)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 0 0.5px oklch(0.16 0 0)',
        }}
      >
        {/* Top accent */}
        <div className="je-card-accent" />

        <div className="p-7 flex flex-col gap-6">

          {/* ── Price row ── */}
          <div>
            {originalPriceCents && (
              <div className="flex items-center gap-2.5 mb-4">
                <span className="je-promo-badge">Offre de lancement</span>
                <span className="je-savings-tag">-{savingsPct}%</span>
              </div>
            )}

            <div className="flex items-end justify-between">
              {/* Left: price */}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'oklch(0.28 0.005 0)' }}>
                  Prix
                </p>
                <div className="flex items-baseline gap-3 leading-none">
                  <span
                    className="font-black text-white"
                    style={{ fontSize: 'clamp(2.6rem, 8vw, 3.6rem)', letterSpacing: '-0.02em', lineHeight: 1 }}
                  >
                    {fmt(priceCents)}
                  </span>
                  {originalPriceCents && (
                    <span className="text-xl font-semibold line-through" style={{ color: 'oklch(0.27 0.005 0)' }}>
                      {fmt(originalPriceCents)}
                    </span>
                  )}
                </div>
                <p className="text-[9px] mt-1.5 uppercase tracking-[0.18em]" style={{ color: 'oklch(0.28 0.005 0)' }}>
                  TTC
                </p>
              </div>

            </div>
          </div>

          <div className="je-divider" />

          {/* ── Features ── */}
          <div className="flex flex-col gap-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: 'oklch(0.28 0.005 0)' }}>
              {tProduct('includes')}
            </p>
            {features.map((label) => (
              <div key={label} className="je-check-item">
                <span className="je-check-mark">✓</span>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="je-divider" />

          {/* ── CTA ── */}
          <div className="flex flex-col gap-3">
            <div className="je-btn-shell">
              <button
                onClick={handleBuy}
                disabled={loading}
                className="je-btn-face"
              >
                {loading
                  ? <Loader2 size={18} className="animate-spin" />
                  : tLicense('buy')
                }
              </button>
            </div>

            <p
              className="text-center text-[11px] tracking-wide"
              style={{ color: 'oklch(0.28 0.005 0)', letterSpacing: '0.04em' }}
            >
              Paiement sécurisé &nbsp;·&nbsp; Téléchargement immédiat
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
