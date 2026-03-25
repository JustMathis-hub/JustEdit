import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import '@/app/globals.css';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/fr/auth/connexion');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') redirect('/fr');

  return (
    <html className="dark">
      <body>
        <div className="flex min-h-screen bg-[oklch(0.07_0_0)]">
          <AdminSidebar />
          <main className="flex-1 ml-56 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
