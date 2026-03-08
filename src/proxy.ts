import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const protectedPaths = ['/compte', '/account'];
const adminPaths = ['/admin'];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes — vérification simple via cookie de session Supabase
  if (adminPaths.some((p) => pathname.startsWith(p))) {
    const accessToken = request.cookies.get('sb-access-token')?.value
      ?? request.cookies.getAll().find(c => c.name.includes('auth-token'))?.value;
    if (!accessToken) {
      return NextResponse.redirect(new URL('/fr/auth/connexion', request.url));
    }
  }

  // Routes protégées membres
  const isProtected = protectedPaths.some((p) =>
    pathname.includes(p)
  );

  if (isProtected) {
    const accessToken = request.cookies.getAll().find(c => c.name.includes('auth-token'))?.value;
    if (!accessToken) {
      const locale = pathname.startsWith('/en') ? 'en' : 'fr';
      return NextResponse.redirect(
        new URL(`/${locale}/auth/connexion`, request.url)
      );
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)',
  ],
};
