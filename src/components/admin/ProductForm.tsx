'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { createAdminClient } from '@/lib/supabase/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { slugify } from '@/lib/utils';
import type { Product } from '@/types';

interface Props {
  product?: Product;
}

export function ProductForm({ product }: Props) {
  const isEditing = !!product;
  const router = useRouter();
  const supabase = createClient();

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'fr' | 'en'>('fr');

  const [formData, setFormData] = useState({
    name_fr: product?.name_fr ?? '',
    name_en: product?.name_en ?? '',
    description_fr: product?.description_fr ?? '',
    description_en: product?.description_en ?? '',
    price_euros: product ? (product.price_cents / 100).toString() : '25',
    is_free: product?.is_free ?? false,
    is_published: product?.is_published ?? false,
    category: product?.category ?? 'mogrt',
    software_tags: product?.software_tags ?? ['Premiere Pro'],
    preview_video_url: product?.preview_video_url ?? '',
    sort_order: product?.sort_order ?? 0,
  });

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [packFile, setPackFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSoftwareTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      software_tags: prev.software_tags.includes(tag)
        ? prev.software_tags.filter((t) => t !== tag)
        : [...prev.software_tags, tag],
    }));
  };

  const uploadFile = async (file: File, bucket: string, path: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });
    if (error) {
      toast.error(`Erreur upload: ${error.message}`);
      return null;
    }
    return data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const slug = isEditing ? product.slug : slugify(formData.name_fr);
      let thumbnailUrl = product?.thumbnail_url ?? null;
      let filePath = product?.file_path ?? null;

      setUploading(true);

      if (thumbnailFile) {
        const path = await uploadFile(thumbnailFile, 'thumbnails', `products/${slug}/thumbnail.jpg`);
        if (path) {
          const { data } = supabase.storage.from('thumbnails').getPublicUrl(path);
          thumbnailUrl = data.publicUrl;
        }
      }

      if (packFile) {
        filePath = await uploadFile(packFile, 'products', `products/${slug}/pack.zip`);
      }

      setUploading(false);

      const productData = {
        slug,
        name_fr: formData.name_fr,
        name_en: formData.name_en,
        description_fr: formData.description_fr,
        description_en: formData.description_en,
        price_cents: formData.is_free ? 0 : Math.round(parseFloat(formData.price_euros) * 100),
        is_free: formData.is_free,
        is_published: formData.is_published,
        category: formData.category,
        software_tags: formData.software_tags,
        preview_video_url: formData.preview_video_url || null,
        thumbnail_url: thumbnailUrl,
        file_path: filePath,
        sort_order: formData.sort_order,
        updated_at: new Date().toISOString(),
      };

      let error;
      if (isEditing) {
        ({ error } = await supabase.from('products').update(productData).eq('id', product.id));
      } else {
        ({ error } = await supabase.from('products').insert({ ...productData, created_at: new Date().toISOString() }));
      }

      if (error) throw error;

      toast.success(isEditing ? 'Produit mis à jour !' : 'Produit créé !');
      router.push('/admin/produits');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const inputClass = 'bg-[oklch(0.09_0_0)] border-[oklch(0.22_0_0)] text-white placeholder:text-[oklch(0.35_0.005_0)] focus:border-[#8b1a1a]';

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">

      {/* Langue tabs */}
      <div className="flex gap-1 p-1 bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl w-fit">
        {(['fr', 'en'] as const).map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setActiveTab(lang)}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === lang
                ? 'bg-[#8b1a1a] text-white'
                : 'text-[oklch(0.55_0.005_0)] hover:text-white'
            }`}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Name */}
      <div className="space-y-1.5">
        <Label className="text-sm text-[oklch(0.7_0.005_0)]">Nom ({activeTab.toUpperCase()})</Label>
        <Input
          value={activeTab === 'fr' ? formData.name_fr : formData.name_en}
          onChange={(e) => setFormData((p) => ({ ...p, [`name_${activeTab}`]: e.target.value }))}
          required={activeTab === 'fr'}
          className={inputClass}
          placeholder={activeTab === 'fr' ? 'Just Number' : 'Just Number'}
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label className="text-sm text-[oklch(0.7_0.005_0)]">Description ({activeTab.toUpperCase()})</Label>
        <textarea
          value={activeTab === 'fr' ? formData.description_fr : formData.description_en}
          onChange={(e) => setFormData((p) => ({ ...p, [`description_${activeTab}`]: e.target.value }))}
          required={activeTab === 'fr'}
          rows={4}
          className={`w-full px-3 py-2 rounded-md text-sm resize-none ${inputClass}`}
          placeholder="Description du pack..."
        />
      </div>

      {/* Price + Free toggle */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm text-[oklch(0.7_0.005_0)]">Prix (€)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={formData.price_euros}
            onChange={(e) => setFormData((p) => ({ ...p, price_euros: e.target.value }))}
            disabled={formData.is_free}
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm text-[oklch(0.7_0.005_0)]">Catégorie</Label>
          <select
            value={formData.category}
            onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value as any }))}
            className={`w-full h-9 px-3 rounded-md text-sm ${inputClass}`}
          >
            <option value="mogrt">MOGRT</option>
            <option value="presets">Presets</option>
            <option value="templates">Templates</option>
          </select>
        </div>
      </div>

      {/* Toggles */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.is_free}
            onChange={(e) => setFormData((p) => ({ ...p, is_free: e.target.checked }))}
            className="accent-[#8b1a1a] w-4 h-4"
          />
          <span className="text-sm text-[oklch(0.7_0.005_0)]">Pack gratuit</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.is_published}
            onChange={(e) => setFormData((p) => ({ ...p, is_published: e.target.checked }))}
            className="accent-[#8b1a1a] w-4 h-4"
          />
          <span className="text-sm text-[oklch(0.7_0.005_0)]">Publié</span>
        </label>
      </div>

      {/* Software tags */}
      <div className="space-y-2">
        <Label className="text-sm text-[oklch(0.7_0.005_0)]">Logiciels compatibles</Label>
        <div className="flex gap-2">
          {['After Effects', 'Premiere Pro', 'Final Cut'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleSoftwareTag(tag)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                formData.software_tags.includes(tag)
                  ? 'bg-[rgba(139,26,26,0.2)] text-white border-[rgba(139,26,26,0.4)]'
                  : 'bg-transparent text-[oklch(0.55_0.005_0)] border-[oklch(0.22_0_0)] hover:border-[oklch(0.35_0_0)]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Preview video URL */}
      <div className="space-y-1.5">
        <Label className="text-sm text-[oklch(0.7_0.005_0)]">URL vidéo de prévisualisation (optionnel)</Label>
        <Input
          type="url"
          value={formData.preview_video_url}
          onChange={(e) => setFormData((p) => ({ ...p, preview_video_url: e.target.value }))}
          className={inputClass}
          placeholder="https://..."
        />
      </div>

      {/* Thumbnail upload */}
      <div className="space-y-2">
        <Label className="text-sm text-[oklch(0.7_0.005_0)]">Image miniature</Label>
        <div className="flex items-center gap-3">
          {(thumbnailFile || product?.thumbnail_url) && (
            <img
              src={thumbnailFile ? URL.createObjectURL(thumbnailFile) : product?.thumbnail_url!}
              alt="preview"
              className="w-24 h-14 object-cover rounded-lg border border-[oklch(0.22_0_0)]"
            />
          )}
          <label className="flex items-center gap-2 px-4 py-2 bg-[oklch(0.13_0_0)] border border-[oklch(0.22_0_0)] rounded-lg text-sm text-[oklch(0.65_0.005_0)] hover:text-white cursor-pointer hover:border-[oklch(0.35_0_0)] transition-colors">
            <Upload size={14} />
            {thumbnailFile ? thumbnailFile.name : 'Choisir une image'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      </div>

      {/* Pack file upload */}
      <div className="space-y-2">
        <Label className="text-sm text-[oklch(0.7_0.005_0)]">
          Fichier du pack (.zip contenant les .mogrt)
        </Label>
        <label className="flex items-center gap-2 px-4 py-2.5 bg-[oklch(0.13_0_0)] border border-[oklch(0.22_0_0)] rounded-lg text-sm text-[oklch(0.65_0.005_0)] hover:text-white cursor-pointer hover:border-[oklch(0.35_0_0)] transition-colors w-fit">
          <Upload size={14} />
          {packFile ? packFile.name : product?.file_path ? 'Remplacer le fichier' : 'Uploader le pack (.zip)'}
          <input
            type="file"
            accept=".zip,.mogrt"
            className="hidden"
            onChange={(e) => setPackFile(e.target.files?.[0] ?? null)}
          />
        </label>
        {product?.file_path && !packFile && (
          <p className="text-xs text-[oklch(0.45_0.005_0)]">Fichier actuel : {product.file_path}</p>
        )}
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={saving}
          className="bg-[#8b1a1a] hover:bg-[#a02020] text-white border-0 font-semibold px-6"
        >
          {saving ? (
            <Loader2 size={15} className="animate-spin mr-2" />
          ) : (
            <Save size={15} className="mr-2" />
          )}
          {uploading ? 'Upload en cours...' : saving ? 'Sauvegarde...' : isEditing ? 'Mettre à jour' : 'Créer le produit'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/produits')}
          className="border-[oklch(0.25_0_0)] text-[oklch(0.6_0.005_0)] hover:text-white bg-transparent"
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
