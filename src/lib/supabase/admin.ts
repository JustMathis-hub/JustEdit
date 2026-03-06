import { createClient } from '@supabase/supabase-js';

// Service role client — JAMAIS exposé côté client
// Utilisé uniquement dans les API routes et Server Actions
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
