'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle } from 'lucide-react';
import Image from 'next/image';

export default function RegisterPage() {
  const t = useTranslations('auth.register');
  const locale = useLocale();
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    if (!termsAccepted) {
      setError(t('termsRequired'));
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/${locale}/auth/callback`,
      },
    });

    if (error) {
      setError(t('error'));
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-[rgba(139,26,26,0.15)] border border-[rgba(139,26,26,0.3)] flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={30} className="text-[#8b1a1a]" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">{t('successTitle')}</h2>
          <p className="text-[oklch(0.55_0.005_0)] text-sm">{t('successDesc')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,26,26,0.7) 0%, transparent 70%)' }}
      />

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
              <Label htmlFor="fullName" className="text-sm text-[oklch(0.7_0.005_0)]">{t('fullName')}</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-[oklch(0.09_0_0)] border-[oklch(0.22_0_0)] text-white placeholder:text-[oklch(0.35_0.005_0)] focus:border-[#8b1a1a]"
                placeholder={t('namePlaceholder')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm text-[oklch(0.7_0.005_0)]">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="bg-[oklch(0.09_0_0)] border-[oklch(0.22_0_0)] text-white placeholder:text-[oklch(0.35_0.005_0)] focus:border-[#8b1a1a]"
                placeholder={t('emailPlaceholder')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm text-[oklch(0.7_0.005_0)]">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
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
                className="bg-[oklch(0.09_0_0)] border-[oklch(0.22_0_0)] text-white placeholder:text-[oklch(0.35_0.005_0)] focus:border-[#8b1a1a]"
                placeholder="••••••••"
              />
            </div>

            {/* GDPR + withdrawal waiver */}
            <label className="flex items-start gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 accent-[#8b1a1a] w-4 h-4 shrink-0"
              />
              <span className="text-xs text-[oklch(0.5_0.005_0)] leading-relaxed">
                {t.rich('terms', {
                  cgvLink: (chunks) => (
                    <Link href="/conditions-generales-de-vente" className="text-[#8b1a1a] hover:text-[#c0392b] underline" target="_blank">
                      {chunks}
                    </Link>
                  ),
                  privacyLink: (chunks) => (
                    <Link href="/politique-de-confidentialite" className="text-[#8b1a1a] hover:text-[#c0392b] underline" target="_blank">
                      {chunks}
                    </Link>
                  ),
                })}
              </span>
            </label>

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

        <p className="text-center text-sm text-[oklch(0.5_0.005_0)] mt-5">
          {t('hasAccount')}{' '}
          <Link href="/auth/connexion" className="text-[#8b1a1a] hover:text-[#c0392b] font-medium transition-colors">
            {t('login')}
          </Link>
        </p>
      </div>
    </div>
  );
}
