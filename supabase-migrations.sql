-- ============================================================
-- JustEdit — Migrations Supabase
-- À exécuter dans : Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. TABLE PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  full_name    TEXT,
  role         TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger : crée automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. TABLE PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              TEXT UNIQUE NOT NULL,
  name_fr           TEXT NOT NULL,
  name_en           TEXT NOT NULL,
  description_fr    TEXT NOT NULL DEFAULT '',
  description_en    TEXT NOT NULL DEFAULT '',
  price_cents       INTEGER NOT NULL DEFAULT 0,
  is_free           BOOLEAN NOT NULL DEFAULT FALSE,
  is_published      BOOLEAN NOT NULL DEFAULT FALSE,
  stripe_price_id   TEXT,
  thumbnail_url     TEXT,
  preview_video_url TEXT,
  file_path         TEXT,
  file_size_bytes   BIGINT,
  software_tags     TEXT[] DEFAULT '{}',
  category          TEXT NOT NULL DEFAULT 'morgts' CHECK (category IN ('morgts', 'presets', 'templates')),
  sort_order        INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 3. TABLE PURCHASES
CREATE TABLE IF NOT EXISTS public.purchases (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id            UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  stripe_session_id     TEXT UNIQUE NOT NULL,
  stripe_payment_intent TEXT,
  amount_paid_cents     INTEGER NOT NULL DEFAULT 0,
  currency              TEXT NOT NULL DEFAULT 'eur',
  status                TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at          TIMESTAMPTZ,

  UNIQUE(user_id, product_id)
);


-- 4. TABLE DOWNLOADS
CREATE TABLE IF NOT EXISTS public.downloads (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  purchase_id   UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  product_id    UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address    INET
);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admin full access to profiles"
  ON public.profiles FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- PRODUCTS
CREATE POLICY "Anyone can view published products"
  ON public.products FOR SELECT
  USING (is_published = TRUE);

CREATE POLICY "Admin full access to products"
  ON public.products FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- PURCHASES
CREATE POLICY "Users view own purchases"
  ON public.purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admin view all purchases"
  ON public.purchases FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- DOWNLOADS
CREATE POLICY "Users view own downloads"
  ON public.downloads FOR SELECT
  USING (auth.uid() = user_id);


-- ============================================================
-- DONNÉES INITIALES — Just Number & Just Text
-- ============================================================

INSERT INTO public.products (
  slug, name_fr, name_en,
  description_fr, description_en,
  price_cents, is_free, is_published,
  software_tags, category, sort_order
) VALUES
(
  'just-number',
  'Just Number',
  'Just Number',
  'Un pack de compteurs animés professionnels pour After Effects et Premiere Pro. Parfait pour afficher des statistiques, des scores ou des données chiffrées dans tes vidéos.',
  'A pack of professional animated counters for After Effects and Premiere Pro. Perfect for displaying statistics, scores, or numerical data in your videos.',
  2500, false, false,
  ARRAY['After Effects', 'Premiere Pro'], 'morgts', 1
),
(
  'just-text',
  'Just Text',
  'Just Text',
  'Un pack de titres et animations texte minimalistes pour After Effects et Premiere Pro. Des designs épurés pour donner un look professionnel à tes vidéos.',
  'A pack of minimalist text titles and animations for After Effects and Premiere Pro. Clean designs to give your videos a professional look.',
  2500, false, false,
  ARRAY['After Effects', 'Premiere Pro'], 'morgts', 2
)
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- STORAGE BUCKETS
-- (à créer aussi dans Supabase Dashboard > Storage)
-- ============================================================

-- Bucket 'thumbnails' — public
INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT DO NOTHING;

-- Bucket 'previews' — public
INSERT INTO storage.buckets (id, name, public)
VALUES ('previews', 'previews', true)
ON CONFLICT DO NOTHING;

-- Bucket 'products' — privé (fichiers téléchargeables)
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', false)
ON CONFLICT DO NOTHING;

-- Policies storage pour 'thumbnails' (lecture publique)
CREATE POLICY "Public read thumbnails"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'thumbnails');

-- Policies storage pour 'previews' (lecture publique)
CREATE POLICY "Public read previews"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'previews');

-- Upload admin pour tous les buckets
CREATE POLICY "Admin upload thumbnails"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id IN ('thumbnails', 'previews', 'products')
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin update files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id IN ('thumbnails', 'previews', 'products')
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- POUR ASSIGNER LE ROLE ADMIN À TON COMPTE :
-- Après t'être inscrit sur le site, exécute :
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'TON_EMAIL@exemple.com';
-- ============================================================
