import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (typeof document === 'undefined') return [];
          return document.cookie
            .split(';')
            .map((c) => {
              const eq = c.indexOf('=');
              return eq < 0
                ? { name: c.trim(), value: '' }
                : { name: c.slice(0, eq).trim(), value: c.slice(eq + 1).trim() };
            })
            .filter(({ name }) => !!name);
        },
        setAll(cookies) {
          if (typeof document === 'undefined') return;
          cookies.forEach(({ name, value, options }) => {
            const parts: string[] = [
              `${name}=${value}`,
              `Path=${options?.path ?? '/'}`,
            ];
            if (options?.maxAge != null) parts.push(`Max-Age=${options.maxAge}`);
            if (options?.sameSite) parts.push(`SameSite=${options.sameSite}`);
            if (options?.secure) parts.push('Secure');
            document.cookie = parts.join('; ');
          });
        },
      },
    }
  );
}
