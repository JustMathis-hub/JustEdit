import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProductForm } from '@/components/admin/ProductForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-2">Modifier le produit</h1>
      <p className="text-sm text-[oklch(0.45_0.005_0)] mb-8">{product.slug}</p>
      <ProductForm product={product} />
    </div>
  );
}
