import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const protectedPaths = ['/compte', '/account'];
const adminPaths = ['/admin'];

function getLocaleFromPath(pathname: string): string {
  return pathname.startsWith('/en') ? 'en' : 'fr';
}

function createSupabaseMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );
  return { supabase, response };
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = getLocaleFromPath(pathname);

  // Toujours rafraîchir la session Supabase sur chaque requête
  const { supabase, response: supabaseResponse } = createSupabaseMiddlewareClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  // Admin routes — verify user is authenticated AND has admin role
  if (adminPaths.some((p) => pathname.startsWith(p))) {
    if (!user) {
      return NextResponse.redirect(new URL(`/${locale}/auth/connexion`, request.url));
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }

    // Admin routes are outside the i18n tree — skip intlMiddleware
    return NextResponse.next();
  }

  // Routes protégées membres
  const isProtected = protectedPaths.some((p) => pathname.includes(p));
  if (isProtected && !user) {
    return NextResponse.redirect(new URL(`/${locale}/auth/connexion`, request.url));
  }

  // Passer par intlMiddleware en préservant les cookies de session
  const intlResponse = intlMiddleware(request);
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });
  return intlResponse;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|mp4|webm|ogg)$).*)',
  ],
};
