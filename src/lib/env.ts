// Environment variable validation — imported where needed
// Throws at startup if required vars are missing

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Public vars (available client-side)
export const SUPABASE_URL = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
export const SUPABASE_ANON_KEY = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

// Server-only vars — only validate when accessed server-side
export function getServerEnv() {
  return {
    SUPABASE_SERVICE_ROLE_KEY: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
    STRIPE_SECRET_KEY: requireEnv('STRIPE_SECRET_KEY'),
    STRIPE_WEBHOOK_SECRET: requireEnv('STRIPE_WEBHOOK_SECRET'),
    SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    RESEND_API_KEY: process.env.RESEND_API_KEY ?? '',
    CONTACT_EMAIL: process.env.CONTACT_EMAIL ?? '',
  };
}
