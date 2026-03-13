'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function DownloadButton({ purchaseId }: { purchaseId: string }) {
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
