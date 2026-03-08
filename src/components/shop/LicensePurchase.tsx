'use client';

import { useState } from 'react';
import { Check, User, Building2, Loader2, Download, ArrowRight, ShoppingBag } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from '@/i18n/navigation';
import { toast } from 'sonner';

interface Props {
  productId: string;
  productSlug: string;
  isFree: boolean;
  priceCents: number;
  locale: string;
  alreadyPurchased: boolean;
  purchaseId?: string;
}

export function LicensePurchase({
  productId,
  productSlug,
  isFree,
  priceCents,
  locale,
  alreadyPurchased,
  purchaseId,
}: Props) {
  const [license, setLicense] = useState<'personal' | 'commercial'>('personal');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const personalPrice = priceCents;
  const commercialPrice = 5000; // 50 €

  const currentPrice = license === 'personal' ? personalPrice : commercialPrice;

  const fmt = (cents: number) =>
    new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(cents / 100);

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

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/connexion');
        return;
      }

      if (isFree) {
        window.location.href = `/${locale}/boutique/${productSlug}`;
        return;
      }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, licenseType: license }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? 'Checkout failed');
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const isFr = locale === 'fr';

  /* Already purchased → download only */
  if (alreadyPurchased) {
    return (
      <div className="mt-auto">
        <button
          onClick={handleBuy}
          disabled={loading}
          className="group relative w-full overflow-hidden rounded-xl bg-[oklch(0.13_0_0)] border border-[oklch(0.25_0_0)] text-white font-semibold py-4 text-base transition-all duration-300 hover:border-[oklch(0.35_0_0)] hover:shadow-[0_0_30px_rgba(139,26,26,0.2)] cursor-pointer"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Download size={18} />
            )}
            {isFr ? 'Déjà acheté — Télécharger' : 'Already purchased — Download'}
          </span>
        </button>
      </div>
    );
  }

  /* Free pack → simple CTA */
  if (isFree) {
    return (
      <div className="mt-auto">
        <button
          onClick={handleBuy}
          disabled={loading}
          className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#8b1a1a] to-[#a52525] text-white font-semibold py-4 text-base transition-all duration-300 hover:shadow-[0_0_40px_rgba(139,26,26,0.4)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#a52525] to-[#c03030] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ShoppingBag size={18} />
            )}
            {isFr ? 'Obtenir gratuitement' : 'Get for free'}
          </span>
        </button>
      </div>
    );
  }

  /* ── Paid product — License selector ── */
  const personalFeatures = isFr
    ? ['Usage personnel', 'YouTube & réseaux sociaux', '1 utilisateur', 'Mises à jour gratuites']
    : ['Personal use', 'YouTube & social media', '1 user', 'Free updates'];

  const commercialFeatures = isFr
    ? ['Usage commercial & clients', 'Agences & entreprises', 'Multi-utilisateurs']
    : ['Commercial & client use', 'Agencies & companies', 'Multi-user'];

  return (
    <div className="mt-auto space-y-4">
      {/* ── License cards ── */}
      <p className="text-xs font-semibold text-[oklch(0.4_0.005_0)] uppercase tracking-widest">
        {isFr ? 'Choisir une licence' : 'Choose a license'}
      </p>

      <div className="grid grid-cols-2 gap-3">
        {/* Personal */}
        <button
          type="button"
          onClick={() => setLicense('personal')}
          className={`group relative text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
            license === 'personal'
              ? 'border-[#8b1a1a] bg-[rgba(139,26,26,0.08)] shadow-[0_0_24px_rgba(139,26,26,0.15)]'
              : 'border-[oklch(0.18_0_0)] bg-[oklch(0.09_0_0)] hover:border-[oklch(0.25_0_0)]'
          }`}
        >
          {license === 'personal' && (
            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#8b1a1a] flex items-center justify-center">
              <Check size={12} className="text-white" />
            </div>
          )}

          {/* Popular badge on Personal */}
          <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-[#8b1a1a] rounded text-[10px] font-bold text-white uppercase tracking-wider">
            {isFr ? 'Populaire' : 'Popular'}
          </div>

          <User
            size={18}
            className={`mb-2 ${license === 'personal' ? 'text-[#8b1a1a]' : 'text-[oklch(0.4_0.005_0)]'}`}
          />
          <p className="text-white font-bold text-sm">{isFr ? 'Personnelle' : 'Personal'}</p>
          <p className="text-2xl font-black text-white mt-1">{fmt(personalPrice)}</p>
          <p className="text-[10px] text-[oklch(0.4_0.005_0)] mt-0.5">TTC</p>
          <ul className="mt-3 space-y-1.5">
            {personalFeatures.map((f) => (
              <li
                key={f}
                className="text-xs text-[oklch(0.55_0.005_0)] flex items-center gap-1.5"
              >
                <Check size={10} className="text-[#8b1a1a] shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </button>

        {/* Commercial */}
        <button
          type="button"
          onClick={() => setLicense('commercial')}
          className={`group relative text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
            license === 'commercial'
              ? 'border-[#8b1a1a] bg-[rgba(139,26,26,0.08)] shadow-[0_0_24px_rgba(139,26,26,0.15)]'
              : 'border-[oklch(0.18_0_0)] bg-[oklch(0.09_0_0)] hover:border-[oklch(0.25_0_0)]'
          }`}
        >
          {license === 'commercial' && (
            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#8b1a1a] flex items-center justify-center">
              <Check size={12} className="text-white" />
            </div>
          )}

          <Building2
            size={18}
            className={`mb-2 ${license === 'commercial' ? 'text-[#8b1a1a]' : 'text-[oklch(0.4_0.005_0)]'}`}
          />
          <p className="text-white font-bold text-sm">{isFr ? 'Commerciale' : 'Commercial'}</p>
          <p className="text-2xl font-black text-white mt-1">{fmt(commercialPrice)}</p>
          <p className="text-[10px] text-[oklch(0.4_0.005_0)] mt-0.5">TTC</p>
          <ul className="mt-3 space-y-1.5">
            {commercialFeatures.map((f) => (
              <li
                key={f}
                className="text-xs text-[oklch(0.55_0.005_0)] flex items-center gap-1.5"
              >
                <Check size={10} className="text-[#8b1a1a] shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </button>
      </div>

      {/* ── CTA ── */}
      <style>{`
        .je-buy-btn {
          cursor: pointer;
          font-size: 1rem;
          border-radius: 16px;
          border: none;
          padding: 2px;
          background: radial-gradient(circle 80px at 80% -10%, #a02020, #0f0505);
          position: relative;
          width: 100%;
          transition: transform 0.35s ease, box-shadow 0.35s ease, background 0.35s ease;
        }
        .je-buy-btn:disabled { opacity: 0.5; pointer-events: none; }
        .je-buy-btn:hover {
          transform: scale(0.98);
          background: radial-gradient(circle 80px at 80% -10%, #b82828, #0f0505);
          box-shadow: 0 0 40px rgba(139,26,26,0.18), 0 0 80px rgba(139,26,26,0.06);
        }
        .je-buy-btn::after {
          content: "";
          position: absolute;
          width: 65%;
          height: 60%;
          border-radius: 120px;
          top: 0;
          right: 0;
          box-shadow: 0 0 20px rgba(192,57,43,0.18);
          z-index: -1;
          transition: box-shadow 0.35s ease;
        }
        .je-buy-btn:hover::after {
          box-shadow: 0 0 30px rgba(192,57,43,0.25);
        }
        .je-buy-blob {
          position: absolute;
          width: 80px;
          height: 100%;
          border-radius: 16px;
          bottom: 0;
          left: 0;
          background: radial-gradient(circle 60px at 0% 100%, #8b1a1a, #4a0e0e50, transparent);
          box-shadow: -10px 10px 30px rgba(139,26,26,0.18);
          transition: box-shadow 0.35s ease, opacity 0.35s ease;
        }
        .je-buy-btn:hover .je-buy-blob {
          box-shadow: -8px 8px 35px rgba(139,26,26,0.3);
          opacity: 0.85;
        }
        .je-buy-inner {
          padding: 14px 25px;
          border-radius: 14px;
          color: #fff;
          font-weight: 700;
          font-size: 1rem;
          z-index: 3;
          position: relative;
          background: radial-gradient(circle 80px at 80% -50%, #5c1212, #0d0303);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: background 0.35s ease;
        }
        .je-buy-btn:hover .je-buy-inner {
          background: radial-gradient(circle 80px at 80% -50%, #701818, #100606);
        }
        .je-buy-inner::before {
          content: "";
          width: 100%;
          height: 100%;
          left: 0;
          top: 0;
          border-radius: 14px;
          background: radial-gradient(circle 60px at 20% 110%, rgba(139,26,26,0.2), transparent 60%);
          position: absolute;
          transition: opacity 0.35s ease;
        }
        .je-buy-btn:hover .je-buy-inner::before {
          opacity: 0.5;
        }
      `}</style>
      <button onClick={handleBuy} disabled={loading} className="je-buy-btn">
        <span className="je-buy-blob" />
        <span className="je-buy-inner">
          {loading ? <Loader2 size={18} className="animate-spin" /> : (isFr ? 'Acheter' : 'Buy')}
        </span>
      </button>
    </div>
  );
}
