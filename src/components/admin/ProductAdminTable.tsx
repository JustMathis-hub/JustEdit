'use client';

import Link from 'next/link';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Eye, EyeOff, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { Product } from '@/types';

export function ProductAdminTable({ products }: { products: Product[] }) {
  const [items, setItems] = useState(products);
  const router = useRouter();
  const supabase = createClient();

  const togglePublish = async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .update({ is_published: !product.is_published })
      .eq('id', product.id);

    if (error) {
      toast.error('Erreur lors de la mise à jour');
    } else {
      setItems((prev) =>
        prev.map((p) => p.id === product.id ? { ...p, is_published: !p.is_published } : p)
      );
      toast.success(product.is_published ? 'Produit dépublié' : 'Produit publié');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce produit ? Cette action est irréversible.')) return;

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      setItems((prev) => prev.filter((p) => p.id !== id));
      toast.success('Produit supprimé');
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl p-12 text-center">
        <p className="text-[oklch(0.45_0.005_0)] text-sm">Aucun produit. Crée ton premier pack !</p>
      </div>
    );
  }

  return (
    <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[oklch(0.16_0_0)]">
              <th className="text-left px-5 py-3 text-xs font-semibold text-[oklch(0.4_0.005_0)] uppercase tracking-wider">Produit</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[oklch(0.4_0.005_0)] uppercase tracking-wider">Prix</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[oklch(0.4_0.005_0)] uppercase tracking-wider">Catégorie</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[oklch(0.4_0.005_0)] uppercase tracking-wider">Statut</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-[oklch(0.4_0.005_0)] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((product, i) => (
              <tr
                key={product.id}
                className={i < items.length - 1 ? 'border-b border-[oklch(0.14_0_0)]' : ''}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {product.thumbnail_url ? (
                      <img
                        src={product.thumbnail_url}
                        alt={product.name_fr}
                        className="w-12 h-8 object-cover rounded-md border border-[oklch(0.18_0_0)]"
                      />
                    ) : (
                      <div className="w-12 h-8 bg-[oklch(0.09_0_0)] rounded-md border border-[oklch(0.18_0_0)]" />
                    )}
                    <div>
                      <p className="font-medium text-white">{product.name_fr}</p>
                      <p className="text-xs text-[oklch(0.4_0.005_0)]">{product.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-white font-semibold">
                  {product.is_free ? (
                    <span className="text-[oklch(0.55_0.005_0)]">Gratuit</span>
                  ) : (
                    formatPrice(product.price_cents, 'fr')
                  )}
                </td>
                <td className="px-5 py-4">
                  <span className="text-xs px-2 py-1 rounded bg-[oklch(0.15_0_0)] text-[oklch(0.55_0.005_0)] uppercase font-semibold">
                    {product.category}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                    product.is_published
                      ? 'bg-[rgba(139,26,26,0.15)] text-[#e07070] border border-[rgba(139,26,26,0.2)]'
                      : 'bg-[oklch(0.15_0_0)] text-[oklch(0.45_0.005_0)]'
                  }`}>
                    {product.is_published ? 'Publié' : 'Brouillon'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link href={`/admin/produits/${product.id}`}>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-[oklch(0.5_0.005_0)] hover:text-white">
                        <Pencil size={13} />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-[oklch(0.5_0.005_0)] hover:text-white"
                      onClick={() => togglePublish(product)}
                    >
                      {product.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-[oklch(0.4_0.005_0)] hover:text-red-400"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
