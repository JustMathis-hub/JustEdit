'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, LogIn } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations('auth.login');
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(t('error'));
    } else {
      router.push('/compte');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      {/* Background glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,26,26,0.7) 0%, transparent 70%)' }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8">
              <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                <rect x="20" y="20" width="60" height="60" rx="8" fill="#8b1a1a"/>
                <rect x="32" y="32" width="36" height="36" rx="2" fill="#0a0a0a"/>
                <path d="M20 68 L32 56 L32 80 L20 80 Z" fill="#6b0f1a"/>
              </svg>
            </div>
            <span className="text-white font-bold text-lg">Just<span className="text-[#8b1a1a]">Edit</span></span>
          </Link>
          <h1 className="text-2xl font-black text-white mt-6 mb-1">{t('title')}</h1>
          <p className="text-sm text-[oklch(0.5_0.005_0)]">{t('subtitle')}</p>
        </div>

        {/* Form */}
        <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="vous@exemple.com"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm text-[oklch(0.7_0.005_0)]">{t('password')}</Label>
                <button type="button" className="text-xs text-[#8b1a1a] hover:text-[#c0392b] transition-colors">
                  {t('forgotPassword')}
                </button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="bg-[oklch(0.09_0_0)] border-[oklch(0.22_0_0)] text-white placeholder:text-[oklch(0.35_0.005_0)] focus:border-[#8b1a1a]"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-950/30 border border-red-900/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8b1a1a] hover:bg-[#a02020] text-white border-0 font-semibold py-2.5 h-auto mt-2"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : (
                <LogIn size={16} className="mr-2" />
              )}
              {t('submit')}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[oklch(0.5_0.005_0)] mt-5">
          {t('noAccount')}{' '}
          <Link href="/auth/inscription" className="text-[#8b1a1a] hover:text-[#c0392b] font-medium transition-colors">
            {t('register')}
          </Link>
        </p>
      </div>
    </div>
  );
}
