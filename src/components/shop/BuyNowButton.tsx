'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  productId: string;
  productSlug: string;
  isFree: boolean;
  alreadyPurchased: boolean;
  purchaseId?: string;
  label: string;
}

export function BuyNowButton({ productId, productSlug, isFree, alreadyPurchased, purchaseId, label }: Props) {
  const [loading, setLoading] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const supabase = createClient();

  const handleClick = async () => {
    setLoading(true);

    try {
      // If already purchased → download
      if (alreadyPurchased && purchaseId) {
        const res = await fetch(`/api/download/${purchaseId}`);
        if (!res.ok) throw new Error('Download failed');
        const { url } = await res.json();
        window.open(url, '_blank');
        return;
      }

      // Check auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/connexion');
        return;
      }

      // Free pack claim — navigate to product page
      if (isFree) {
        router.push(`/boutique/${productSlug}`);
        return;
      }

      // Stripe checkout
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, locale }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? 'Checkout failed');
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (alreadyPurchased) {
    return (
      <Button
        onClick={handleClick}
        disabled={loading}
        className="w-full bg-[oklch(0.13_0_0)] hover:bg-[oklch(0.16_0_0)] text-white border border-[oklch(0.25_0_0)] font-semibold py-3 h-auto text-base"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin mr-2" />
        ) : (
          <Download size={18} className="mr-2" />
        )}
        {label}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      className="w-full bg-[#8b1a1a] hover:bg-[#a02020] text-white border-0 font-semibold py-3 h-auto text-base glow-bordeaux transition-all"
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin mr-2" />
      ) : (
        <ShoppingBag size={18} className="mr-2" />
      )}
      {label}
    </Button>
  );
}
