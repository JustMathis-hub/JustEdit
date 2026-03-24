-- ============================================================
-- AFFILIATE SYSTEM — Tables, Indexes, RLS, RPC
-- Run in Supabase SQL Editor
-- ============================================================

-- AFFILIATES: tied to existing profiles
CREATE TABLE IF NOT EXISTS public.affiliates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  code            TEXT NOT NULL UNIQUE,
  commission_rate INTEGER NOT NULL DEFAULT 20,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'active', 'paused', 'rejected')),
  payout_method   TEXT CHECK (payout_method IN ('paypal', 'bank_transfer')),
  payout_details  TEXT,
  total_earned_cents  INTEGER NOT NULL DEFAULT 0,
  total_paid_cents    INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliates_code ON public.affiliates(code);
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON public.affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON public.affiliates(status);

-- REFERRAL_CLICKS: every visit via an affiliate link
CREATE TABLE IF NOT EXISTS public.referral_clicks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id  UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  ip_address    INET,
  user_agent    TEXT,
  landing_page  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_clicks_affiliate_id ON public.referral_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_created_at ON public.referral_clicks(created_at);

-- AFFILIATE_COMMISSIONS: one row per purchase that earns a commission
CREATE TABLE IF NOT EXISTS public.affiliate_commissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id    UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  purchase_id     UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sale_amount_cents   INTEGER NOT NULL,
  commission_cents    INTEGER NOT NULL,
  commission_rate     INTEGER NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commissions_affiliate_id ON public.affiliate_commissions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON public.affiliate_commissions(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_commissions_purchase_unique ON public.affiliate_commissions(purchase_id);

-- AFFILIATE_PAYOUTS: when admin sends money to an affiliate
CREATE TABLE IF NOT EXISTS public.affiliate_payouts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id    UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  amount_cents    INTEGER NOT NULL,
  payout_method   TEXT NOT NULL CHECK (payout_method IN ('paypal', 'bank_transfer')),
  reference       TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payouts_affiliate_id ON public.affiliate_payouts(affiliate_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- Affiliates: users view own, admins full access
CREATE POLICY "Users view own affiliate" ON public.affiliates
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin full access affiliates" ON public.affiliates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Clicks: admin only
CREATE POLICY "Admin view referral clicks" ON public.referral_clicks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Commissions: affiliates see own, admins full access
CREATE POLICY "Affiliates view own commissions" ON public.affiliate_commissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.affiliates WHERE id = affiliate_id AND user_id = auth.uid())
  );
CREATE POLICY "Admin full access commissions" ON public.affiliate_commissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Payouts: affiliates see own, admins full access
CREATE POLICY "Affiliates view own payouts" ON public.affiliate_payouts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.affiliates WHERE id = affiliate_id AND user_id = auth.uid())
  );
CREATE POLICY "Admin full access payouts" ON public.affiliate_payouts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- RPC: Atomic increment of affiliate earnings
-- ============================================================

CREATE OR REPLACE FUNCTION public.increment_affiliate_earnings(
  p_affiliate_id UUID,
  p_amount INTEGER
) RETURNS VOID AS $$
BEGIN
  UPDATE public.affiliates
  SET total_earned_cents = total_earned_cents + p_amount,
      updated_at = NOW()
  WHERE id = p_affiliate_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_affiliate_paid(
  p_affiliate_id UUID,
  p_amount INTEGER
) RETURNS VOID AS $$
BEGIN
  UPDATE public.affiliates
  SET total_paid_cents = total_paid_cents + p_amount,
      updated_at = NOW()
  WHERE id = p_affiliate_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
