'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: Props) {
  const t = useTranslations('common');

  useEffect(() => {
    console.error('[error boundary]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12">
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,26,26,0.8) 0%, transparent 70%)' }}
      />

      <div className="w-full max-w-md relative z-10 text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{
            background: 'linear-gradient(135deg, rgba(139,26,26,0.2) 0%, rgba(139,26,26,0.08) 100%)',
            border: '1px solid rgba(139,26,26,0.3)',
            boxShadow: '0 0 40px rgba(139,26,26,0.15)',
          }}
        >
          <AlertTriangle size={36} className="text-[#8b1a1a]" />
        </div>

        <h1 className="text-2xl font-black text-white mb-2">{t('error')}</h1>
        <p className="text-sm text-[oklch(0.5_0.005_0)] mb-8">
          {error.digest && (
            <span className="block text-xs text-[oklch(0.35_0.005_0)] mt-1 font-mono">
              #{error.digest}
            </span>
          )}
        </p>

        <div className="flex flex-col gap-2.5 max-w-xs mx-auto">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, #8b1a1a 0%, #5a1010 100%)',
              border: '1px solid rgba(200,60,60,0.3)',
            }}
          >
            <RefreshCw size={14} />
            Réessayer
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium text-sm text-[oklch(0.55_0.005_0)] hover:text-white bg-[oklch(0.09_0_0)] border border-[oklch(0.2_0_0)] hover:border-[oklch(0.25_0_0)] transition-all duration-200"
          >
            {t('back')}
          </Link>
        </div>
      </div>
    </div>
  );
}
