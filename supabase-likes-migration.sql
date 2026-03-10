-- ============================================================
-- TABLE PRODUCT_LIKES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_likes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_product_likes_product_id ON public.product_likes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_likes_user_id ON public.product_likes(user_id);

ALTER TABLE public.product_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can read like counts
CREATE POLICY "Anyone can view likes"
  ON public.product_likes FOR SELECT
  USING (true);

-- Authenticated users can insert their own likes
CREATE POLICY "Authenticated users can like"
  ON public.product_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own likes
CREATE POLICY "Users can unlike own likes"
  ON public.product_likes FOR DELETE
  USING (auth.uid() = user_id);
