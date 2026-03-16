'use client';

import { useState } from 'react';
import { Download, Loader2, LogIn, CheckCircle2, Clock } from 'lucide-react';

interface FreeClaimButtonProps {
  packSlug: string;
  isAuthenticated: boolean;
  alreadyClaimed: boolean;
  downloadUrl?: string;
  loginHref: string;
}

export function FreeClaimButton({
  packSlug,
  isAuthenticated,
  alreadyClaimed,
  downloadUrl,
  loginHref,
}: FreeClaimButtonProps) {
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(alreadyClaimed);
  const [claimDownloadUrl, setClaimDownloadUrl] = useState(downloadUrl);
  const [error, setError] = useState<string | null>(null);

  const handleClaim = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/free-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: packSlug }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Une erreur est survenue.');
        return;
      }
      if (data.downloadUrl) {
        setClaimDownloadUrl(data.downloadUrl);
      }
      setClaimed(true);
    } catch {
      setError('Une erreur est survenue. Réessaie.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Already claimed + download ready ── */
  if (claimed && claimDownloadUrl) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-emerald-400">
          <CheckCircle2 size={16} />
          <span>Pack obtenu — prêt au téléchargement</span>
        </div>
        <a
          href={claimDownloadUrl}
          className="flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl font-black text-base text-white"
          style={{
            background: 'linear-gradient(135deg, rgba(139,26,26,0.9) 0%, rgba(80,10,10,0.95) 100%)',
            border: '1px solid rgba(200,60,60,0.4)',
            boxShadow: '0 0 30px rgba(139,26,26,0.35), 0 4px 16px rgba(0,0,0,0.5)',
            textDecoration: 'none',
          }}
        >
          <Download size={18} />
          Télécharger maintenant
        </a>
      </div>
    );
  }

  /* ── Claimed but no download URL yet (file not ready) ── */
  if (claimed && !claimDownloadUrl) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-emerald-400">
          <CheckCircle2 size={16} />
          <span>Pack obtenu — tu seras notifié à la mise en ligne</span>
        </div>
        <div
          className="flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl font-black text-base cursor-default"
          style={{
            background: 'oklch(0.13 0 0)',
            border: '1px solid oklch(0.2 0 0)',
            color: 'oklch(0.45 0.005 0)',
          }}
        >
          <Clock size={18} />
          Bientôt disponible
        </div>
      </div>
    );
  }

  /* ── Not authenticated ── */
  if (!isAuthenticated) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-[oklch(0.4_0.005_0)] text-center">
          Un compte gratuit est requis pour télécharger
        </p>
        <a
          href={loginHref}
          className="flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl font-black text-base text-white no-underline"
          style={{
            background: 'linear-gradient(135deg, rgba(139,26,26,0.9) 0%, rgba(80,10,10,0.95) 100%)',
            border: '1px solid rgba(200,60,60,0.4)',
            boxShadow: '0 0 30px rgba(139,26,26,0.35), 0 4px 16px rgba(0,0,0,0.5)',
            textDecoration: 'none',
            display: 'flex',
          }}
        >
          <LogIn size={18} />
          Se connecter pour obtenir
        </a>
      </div>
    );
  }

  /* ── Authenticated, not yet claimed ── */
  return (
    <div className="space-y-3">
      {error && (
        <p className="text-xs text-red-400 text-center">{error}</p>
      )}
      <button
        type="button"
        disabled={loading}
        onClick={handleClaim}
        className="relative flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl font-black text-base text-white overflow-hidden"
        style={{
          background: loading
            ? 'oklch(0.13 0 0)'
            : 'linear-gradient(135deg, rgba(139,26,26,0.9) 0%, rgba(80,10,10,0.95) 100%)',
          border: '1px solid rgba(200,60,60,0.4)',
          boxShadow: loading ? 'none' : '0 0 30px rgba(139,26,26,0.35), 0 4px 16px rgba(0,0,0,0.5)',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.25s ease',
        }}
      >
        {/* Shimmer overlay */}
        {!loading && (
          <span
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)',
            }}
          />
        )}
        {loading ? (
          <Loader2 size={18} className="animate-spin text-[oklch(0.5_0.005_0)]" />
        ) : (
          <Download size={18} />
        )}
        <span>{loading ? 'Chargement...' : 'Obtenir gratuitement'}</span>
      </button>
    </div>
  );
}
