'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { useRouter } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { Profile } from '@/types';
import Image from 'next/image';

export function Navbar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    setMenuOpen(false);
  };

  const navLinks = [
    { href: '/boutique' as const, label: t('shop') },
    { href: '/packs-gratuits' as const, label: t('freePacks') },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[oklch(0.07_0_0)]/95 backdrop-blur-md border-b border-[oklch(0.18_0_0)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="h-8 relative">
              <Image src="/Logo.png" alt="JustEdit" height={32} width={120} className="h-8 w-auto object-contain" />
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  pathname === link.href
                    ? 'text-white bg-[oklch(0.15_0_0)]'
                    : 'text-[oklch(0.65_0.005_0)] hover:text-white hover:bg-[oklch(0.13_0_0)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />

            {user ? (
              <div className="flex items-center gap-2">
                {profile?.role === 'admin' && (
                  <a href="/admin" className="text-xs text-[#8b1a1a] hover:text-[#c0392b] font-medium transition-colors">
                    {t('admin')}
                  </a>
                )}
                <Link
                  href="/compte"
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-[oklch(0.65_0.005_0)] hover:text-white rounded-md hover:bg-[oklch(0.13_0_0)] transition-colors"
                >
                  <User size={15} />
                  {t('account')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-[oklch(0.45_0.005_0)] hover:text-white rounded-md hover:bg-[oklch(0.13_0_0)] transition-colors"
                  title={t('logout')}
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/connexion"
                  className="px-4 py-2 text-sm font-medium text-[oklch(0.65_0.005_0)] hover:text-white transition-colors"
                >
                  {t('login')}
                </Link>
                <Link href="/boutique">
                  <Button
                    size="sm"
                    className="bg-[#8b1a1a] hover:bg-[#a02020] text-white border-0 font-medium"
                  >
                    {t('shop')}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-[oklch(0.65_0.005_0)] hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[oklch(0.09_0_0)] border-t border-[oklch(0.18_0_0)]">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2.5 text-sm font-medium text-[oklch(0.65_0.005_0)] hover:text-white rounded-md hover:bg-[oklch(0.13_0_0)] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-[oklch(0.18_0_0)] flex items-center justify-between">
              <LanguageSwitcher />
              {user ? (
                <div className="flex items-center gap-2">
                  <Link href="/compte" onClick={() => setMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="text-sm">
                      <User size={14} className="mr-1.5" /> {t('account')}
                    </Button>
                  </Link>
                  <button onClick={handleLogout} className="p-2 text-[oklch(0.45_0.005_0)] hover:text-white">
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <Link href="/auth/connexion" onClick={() => setMenuOpen(false)}>
                  <Button size="sm" className="bg-[#8b1a1a] hover:bg-[#a02020] text-white border-0">
                    {t('login')}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
