'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingCart, Users, UserPlus, ArrowLeft } from 'lucide-react';

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/produits', label: 'Produits', icon: Package, exact: false },
  { href: '/admin/commandes', label: 'Commandes', icon: ShoppingCart, exact: false },
  { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users, exact: false },
  { href: '/admin/affilies', label: 'Affilies', icon: UserPlus, exact: false },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 bg-[oklch(0.09_0_0)] border-r border-[oklch(0.15_0_0)] flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-[oklch(0.15_0_0)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7">
            <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
              <rect x="20" y="20" width="60" height="60" rx="8" fill="#8b1a1a"/>
              <rect x="32" y="32" width="36" height="36" rx="2" fill="#0a0a0a"/>
              <path d="M20 68 L32 56 L32 80 L20 80 Z" fill="#6b0f1a"/>
            </svg>
          </div>
          <div>
            <span className="text-white font-bold text-sm">Just<span className="text-[#8b1a1a]">Edit</span></span>
            <p className="text-[oklch(0.4_0.005_0)] text-[10px] -mt-0.5">Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href, link.exact);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-[rgba(139,26,26,0.15)] text-white border border-[rgba(139,26,26,0.2)]'
                  : 'text-[oklch(0.55_0.005_0)] hover:text-white hover:bg-[oklch(0.13_0_0)]'
              }`}
            >
              <Icon size={15} className={active ? 'text-[#8b1a1a]' : ''} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Back to site */}
      <div className="p-3 border-t border-[oklch(0.15_0_0)]">
        <Link
          href="/fr"
          className="flex items-center gap-2 px-3 py-2 text-xs text-[oklch(0.45_0.005_0)] hover:text-white rounded-lg hover:bg-[oklch(0.13_0_0)] transition-colors"
        >
          <ArrowLeft size={13} />
          Retour au site
        </Link>
      </div>
    </aside>
  );
}
