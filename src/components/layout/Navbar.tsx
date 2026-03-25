'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { useRouter } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import { LanguageSwitcher } from './LanguageSwitcher';
import { usePromoBanner } from './PromoBanner';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { Profile } from '@/types';
import Image from 'next/image';

interface NavbarProps {
  initialUser?: SupabaseUser | null;
  initialProfile?: Profile | null;
}

export function Navbar({ initialUser = null, initialProfile = null }: NavbarProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();
  const { isBannerVisible } = usePromoBanner();
  const [user, setUser] = useState<SupabaseUser | null>(initialUser);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null);
        if (session?.user) {
          const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          setProfile(data);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Re-fetch profile when user saves changes from ProfileEditor
  useEffect(() => {
    const handler = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        const { data } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
        setProfile(data);
      }
    };
    window.addEventListener('profile-updated', handler);
    return () => window.removeEventListener('profile-updated', handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { href: '/' as const, label: t('home') },
    { href: '/boutique' as const, label: t('shop') },
    { href: '/packs-gratuits' as const, label: t('freePacks') },
  ];

  return (
    <header
      className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[oklch(0.07_0_0)]/95 backdrop-blur-md border-b border-[oklch(0.18_0_0)]'
          : 'bg-transparent'
      }`}
      style={{ top: isBannerVisible ? '40px' : '0px' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-14 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="h-10 relative">
              <Image src="/Logo.png" alt="JustEdit" height={40} width={150} className="h-10 w-auto object-contain" />
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  (link.href === '/' ? pathname === '/' : pathname === link.href)
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
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[oklch(0.13_0_0)] transition-colors group"
                >
                  {/* Avatar mini */}
                  <div className="navbar-avatar-ring w-7 h-7 rounded-full p-[1.5px] shrink-0">
                    <div className="w-full h-full rounded-full overflow-hidden bg-[oklch(0.08_0_0)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={profile?.avatar_url ?? '/images/avatars/avatar-1.png'}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                  {/* Name + label */}
                  <div className="flex flex-col leading-tight">
                    <span className="text-[13px] font-semibold text-white group-hover:text-white transition-colors">
                      {profile?.full_name ?? t('account')}
                    </span>
                    <span className="text-[10px] text-[oklch(0.45_0.005_0)] group-hover:text-[oklch(0.55_0.005_0)] transition-colors">
                      {t('personalSpace')}
                    </span>
                  </div>
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

          {/* Mobile right: avatar + menu toggle */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <Link href="/compte" onClick={() => setMenuOpen(false)}>
                <div className="navbar-avatar-ring w-7 h-7 rounded-full p-[1.5px] shrink-0">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[oklch(0.08_0_0)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={profile?.avatar_url ?? '/images/avatars/avatar-1.png'}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                </div>
              </Link>
            )}
            <button
              className="p-2 text-[oklch(0.65_0.005_0)] hover:text-white"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div id="mobile-menu" role="navigation" aria-label="Mobile navigation" className="md:hidden bg-[oklch(0.09_0_0)] border-t border-[oklch(0.18_0_0)]">
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
                  <Link href="/compte" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
                    <div className="navbar-avatar-ring w-7 h-7 rounded-full p-[1.5px] shrink-0">
                      <div className="w-full h-full rounded-full overflow-hidden bg-[oklch(0.08_0_0)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={profile?.avatar_url ?? '/images/avatars/avatar-1.png'}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-[13px] font-semibold text-white">
                        {profile?.full_name ?? t('account')}
                      </span>
                      <span className="text-[10px] text-[oklch(0.45_0.005_0)]">{t('personalSpace')}</span>
                    </div>
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
