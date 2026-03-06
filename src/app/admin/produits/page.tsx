import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductAdminTable } from '@/components/admin/ProductAdminTable';
import { Plus } from 'lucide-react';

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Produits</h1>
          <p className="text-sm text-[oklch(0.45_0.005_0)] mt-1">{products?.length ?? 0} produit(s)</p>
        </div>
        <Link href="/admin/produits/nouveau">
          <Button className="bg-[#8b1a1a] hover:bg-[#a02020] text-white border-0 font-medium">
            <Plus size={15} className="mr-1.5" /> Nouveau produit
          </Button>
        </Link>
      </div>

      <ProductAdminTable products={products ?? []} />
    </div>
  );
}
