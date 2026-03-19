'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DownloadButtonProps {
  purchaseId: string;
  variant?: 'default' | 'card';
}

export function DownloadButton({ purchaseId, variant = 'default' }: DownloadButtonProps) {
  const t = useTranslations('account');
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/download/${purchaseId}`);
      if (!res.ok) throw new Error('Download failed');
      const { url } = await res.json();
      window.open(url, '_blank');
    } catch {
      toast.error(t('downloadError'));
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'card') {
    return (
      <button
        onClick={handleDownload}
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-black text-sm text-white transition-all duration-200 disabled:opacity-60"
        style={{
          background: 'linear-gradient(135deg, rgba(139,26,26,0.9) 0%, rgba(80,10,10,0.95) 100%)',
          border: '1px solid rgba(200,60,60,0.35)',
          boxShadow: '0 0 20px rgba(139,26,26,0.25)',
        }}
        onMouseEnter={(e) => { if (!loading) e.currentTarget.style.boxShadow = '0 0 30px rgba(139,26,26,0.5)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 20px rgba(139,26,26,0.25)'; }}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        {loading ? t('downloading') : t('download')}
      </button>
    );
  }

  return (
    <Button
      size="sm"
      onClick={handleDownload}
      disabled={loading}
      className="bg-[oklch(0.15_0_0)] hover:bg-[oklch(0.2_0_0)] text-white border border-[oklch(0.25_0_0)] text-xs px-3 shrink-0"
    >
      {loading ? (
        <Loader2 size={13} className="animate-spin mr-1.5" />
      ) : (
        <Download size={13} className="mr-1.5" />
      )}
      {loading ? t('downloading') : t('download')}
    </Button>
  );
}
