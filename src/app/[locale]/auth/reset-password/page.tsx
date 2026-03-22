'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import type { Session } from '@supabase/supabase-js';

function ResetPasswordContent() {
  const t = useTranslations('auth.resetPassword');
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const sessionRef = useRef<Session | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(async ({ data, error }) => {
        if (error || !data.session) {
          setSessionError(t('invalidLink'));
        } else {
          sessionRef.current = data.session;
          // Local-only sign out: clears the browser session without revoking
          // tokens server-side, so setSession() still works on submit.
          await supabase.auth.signOut({ scope: 'local' });
          setSessionReady(true);
          window.history.replaceState({}, '', window.location.pathname);
        }
      });
    } else {
      // Check for existing session (e.g. arrived via /api/auth/confirm)
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session) {
          sessionRef.current = session;
          await supabase.auth.signOut({ scope: 'local' });
          setSessionReady(true);
        } else {
          setSessionError(t('invalidLink'));
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    if (!sessionRef.current) {
      setError(t('error'));
      return;
    }

    setLoading(true);

    // Restore the session temporarily (tokens are still valid server-side
    // since we only did a local sign out earlier).
    await supabase.auth.setSession({
      access_token: sessionRef.current.access_token,
      refresh_token: sessionRef.current.refresh_token,
    });

    const { error } = await supabase.auth.updateUser({ password });

    // Always sign out after — user must log in with new password
    await supabase.auth.signOut();

    if (error) {
      setError(t('error'));
    } else {
      setSuccess(true);
      setTimeout(() => router.push('/auth/connexion'), 2000);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-[rgba(139,26,26,0.15)] border border-[rgba(139,26,26,0.3)] flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={30} className="text-[#8b1a1a]" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">{t('successTitle')}</h2>
        <p className="text-[oklch(0.55_0.005_0)] text-sm">{t('successDesc')}</p>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="text-center max-w-sm">
        <p className="text-sm text-red-400 mb-4">{sessionError}</p>
        <Link href="/auth/mot-de-passe-oublie" className="text-sm text-[#8b1a1a] hover:text-[#c0392b] font-medium transition-colors">
          {t('requestNewLink')}
        </Link>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="flex items-center gap-2 text-[oklch(0.55_0.005_0)]">
        <Loader2 size={16} className="animate-spin" />
        <span>{t('verifying')}</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm relative z-10">
      <div className="text-center mb-8">
        <Link href="/">
          <Image src="/Logo.png" alt="JustEdit" width={40} height={40} className="mx-auto" />
        </Link>
        <h1 className="text-2xl font-black text-white mt-6 mb-1">{t('title')}</h1>
        <p className="text-sm text-[oklch(0.5_0.005_0)]">{t('subtitle')}</p>
      </div>

      <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm text-[oklch(0.7_0.005_0)]">{t('password')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="bg-[oklch(0.09_0_0)] border-[oklch(0.22_0_0)] text-white placeholder:text-[oklch(0.35_0.005_0)] focus:border-[#8b1a1a]"
              placeholder={t('passwordMin')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm text-[oklch(0.7_0.005_0)]">{t('confirmPassword')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="bg-[oklch(0.09_0_0)] border-[oklch(0.22_0_0)] text-white placeholder:text-[oklch(0.35_0.005_0)] focus:border-[#8b1a1a]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-950/30 border border-red-900/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="je-auth-btn mt-2">
            <span className="je-auth-blob" />
            <span className="je-auth-inner">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {t('submit')}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,26,26,0.7) 0%, transparent 70%)' }}
      />
      <Suspense fallback={
        <div className="flex items-center gap-2 text-[oklch(0.55_0.005_0)]">
          <Loader2 size={16} className="animate-spin" />
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
