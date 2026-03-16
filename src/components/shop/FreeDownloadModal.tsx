'use client';

import { useEffect, useState } from 'react';
import { Download, Loader2, X, CheckCircle2, Clock } from 'lucide-react';
import Image from 'next/image';

interface FreeDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  packSlug: string;
  packName: string;
  userName: string;
}

type Status = 'idle' | 'loading' | 'success' | 'soon';

export function FreeDownloadModal({
  isOpen,
  onClose,
  packSlug,
  packName,
  userName,
}: FreeDownloadModalProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  /* Reset when modal opens */
  useEffect(() => {
    if (isOpen) { setStatus('idle'); setDownloadUrl(null); }
  }, [isOpen]);

  /* Close on Escape */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleDownload = async () => {
    setStatus('loading');
    try {
      const res = await fetch('/api/free-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: packSlug }),
      });
      const data = await res.json();
      if (data.downloadUrl) {
        setDownloadUrl(data.downloadUrl);
        setStatus('success');
        window.open(data.downloadUrl, '_blank');
      } else {
        setStatus('soon');
      }
    } catch {
      setStatus('soon');
    }
  };

  const firstName = userName.split(' ')[0] || userName;

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes je-modal-in {
          from { opacity: 0; transform: scale(0.94) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0px); }
        }
        @keyframes je-overlay-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .je-modal-overlay { animation: je-overlay-in 0.2s ease forwards; }
        .je-modal-card    { animation: je-modal-in  0.28s cubic-bezier(0.34,1.56,0.64,1) forwards; }

        .je-dl-btn {
          cursor: pointer; width: 100%; border: none;
          border-radius: 16px; padding: 2px;
          background: linear-gradient(135deg, rgba(180,45,45,0.9), rgba(80,10,10,0.95));
          position: relative;
          transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
          box-shadow: 0 0 28px rgba(139,26,26,0.45), 0 4px 20px rgba(0,0,0,0.5);
        }
        .je-dl-btn:hover  { transform: scale(0.985); box-shadow: 0 0 40px rgba(139,26,26,0.6), 0 4px 20px rgba(0,0,0,0.5); }
        .je-dl-btn:active { transform: scale(0.975); }
        .je-dl-btn-inner {
          padding: 15px 20px; border-radius: 14px;
          background: linear-gradient(135deg, rgba(160,40,40,0.8), rgba(70,8,8,0.95));
          color: #fff; font-weight: 800; font-size: 1rem;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          position: relative; overflow: hidden;
        }
        .je-dl-btn-inner::before {
          content: ""; position: absolute; inset: 0; border-radius: 14px;
          background: linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 55%);
          pointer-events: none;
        }
      `}</style>

      {/* ── Overlay ── */}
      <div
        className="je-modal-overlay fixed inset-0 z-[200] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(14px)' }}
        onClick={onClose}
      >
        {/* ── Card ── */}
        <div
          className="je-modal-card relative w-full max-w-sm rounded-3xl px-8 py-9"
          style={{
            background: 'linear-gradient(150deg, oklch(0.115 0.005 10), oklch(0.075 0 0))',
            border: '1px solid rgba(180,50,50,0.35)',
            boxShadow: '0 0 70px rgba(139,26,26,0.22), 0 40px 80px rgba(0,0,0,0.85)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 hover:opacity-100"
            style={{ background: 'oklch(0.16 0 0)', color: 'oklch(0.42 0.005 0)', opacity: 0.7 }}
          >
            <X size={15} />
          </button>

          {/* ── IDLE state ── */}
          {status === 'idle' && (
            <>
              {/* Icon — JustEdit logo */}
              <div className="flex justify-center mb-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden"
                  style={{
                    background: 'radial-gradient(circle at 40% 35%, rgba(180,45,45,0.18), rgba(80,10,10,0.12))',
                    border: '1px solid rgba(180,50,50,0.3)',
                    boxShadow: '0 0 28px rgba(139,26,26,0.25)',
                  }}
                >
                  <Image
                    src="/Logo.png"
                    alt="JustEdit"
                    width={36}
                    height={36}
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Text */}
              <h2 className="text-2xl font-black text-white text-center tracking-tight mb-2">
                Téléchargement gratuit
              </h2>
              <p className="text-sm text-center mb-1" style={{ color: 'oklch(0.6 0.005 0)' }}>
                Bonjour{' '}
                <span className="text-white font-bold">{firstName}</span>{' '}!
              </p>
              <div className="mb-8 text-center">
                <p className="text-sm leading-relaxed" style={{ color: 'oklch(0.42 0.005 0)' }}>
                  Vous êtes sur le point d'obtenir
                </p>
                <p className="text-base font-black text-white mt-1 tracking-tight">
                  {packName}
                </p>
              </div>

              {/* Download button */}
              <button type="button" className="je-dl-btn" onClick={handleDownload}>
                <span className="je-dl-btn-inner">
                  <Download size={17} />
                  Télécharger
                </span>
              </button>

              {/* Cancel */}
              <button
                onClick={onClose}
                className="w-full text-center text-sm mt-4 py-1 transition-opacity hover:opacity-100"
                style={{ color: 'oklch(0.32 0.005 0)', opacity: 0.8 }}
              >
                Annuler
              </button>
            </>
          )}

          {/* ── LOADING state ── */}
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-5 py-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'oklch(0.13 0 0)', border: '1px solid oklch(0.2 0 0)' }}
              >
                <Loader2 size={26} className="animate-spin" style={{ color: '#8b1a1a' }} />
              </div>
              <p className="text-sm font-medium" style={{ color: 'oklch(0.5 0.005 0)' }}>
                Préparation du téléchargement…
              </p>
            </div>
          )}

          {/* ── SUCCESS state ── */}
          {status === 'success' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}
              >
                <CheckCircle2 size={28} className="text-emerald-400" />
              </div>
              <h3 className="text-lg font-black text-white">Téléchargement lancé !</h3>
              <p className="text-sm text-center" style={{ color: 'oklch(0.5 0.005 0)' }}>
                Si la fenêtre ne s'ouvre pas,{' '}
                <a
                  href={downloadUrl ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  style={{ color: '#c84848' }}
                >
                  cliquez ici
                </a>
              </p>
              <button
                onClick={onClose}
                className="mt-2 text-sm py-1 transition-opacity"
                style={{ color: 'oklch(0.38 0.005 0)' }}
              >
                Fermer
              </button>
            </div>
          )}

          {/* ── SOON state ── */}
          {status === 'soon' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)' }}
              >
                <Clock size={28} className="text-yellow-400" />
              </div>
              <h3 className="text-lg font-black text-white">Bientôt disponible</h3>
              <p className="text-sm text-center leading-relaxed" style={{ color: 'oklch(0.48 0.005 0)' }}>
                Le fichier sera disponible très prochainement. Revenez dans quelques jours !
              </p>
              <button
                onClick={onClose}
                className="mt-2 text-sm py-1 transition-opacity"
                style={{ color: 'oklch(0.38 0.005 0)' }}
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
