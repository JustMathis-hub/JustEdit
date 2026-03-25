export type Locale = 'fr' | 'en';

export type UserRole = 'customer' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url?: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string;
  description_fr: string;
  description_en: string;
  price_cents: number;
  is_free: boolean;
  is_published: boolean;
  stripe_price_id: string | null;
  thumbnail_url: string | null;
  preview_video_url: string | null;
  file_path: string | null;
  file_size_bytes: number | null;
  software_tags: string[];
  category: 'mogrt' | 'presets' | 'templates';
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  product_id: string;
  stripe_session_id: string;
  stripe_payment_intent: string | null;
  amount_paid_cents: number;
  currency: string;
  status: 'pending' | 'completed' | 'refunded';
  created_at: string;
  completed_at: string | null;
  product?: Product;
}

export interface Download {
  id: string;
  user_id: string;
  purchase_id: string;
  product_id: string;
  downloaded_at: string;
}

export interface ProductLike {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface ProductWithPurchase extends Product {
  purchased?: boolean;
  purchase_id?: string;
}

// ── Affiliate system ──

export type AffiliateStatus = 'pending' | 'active' | 'paused' | 'rejected';
export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'rejected';

export interface Affiliate {
  id: string;
  user_id: string;
  code: string;
  commission_rate: number;
  status: AffiliateStatus;
  payout_method: 'paypal' | 'bank_transfer' | null;
  payout_details: string | null;
  total_earned_cents: number;
  total_paid_cents: number;
  stripe_connect_account_id: string | null;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface ReferralClick {
  id: string;
  affiliate_id: string;
  ip_address: string | null;
  user_agent: string | null;
  landing_page: string | null;
  created_at: string;
}

export interface AffiliateCommission {
  id: string;
  affiliate_id: string;
  purchase_id: string;
  product_id: string;
  sale_amount_cents: number;
  commission_cents: number;
  commission_rate: number;
  status: CommissionStatus;
  created_at: string;
  affiliate?: Affiliate;
  product?: Product;
}

export interface AffiliatePayout {
  id: string;
  affiliate_id: string;
  amount_cents: number;
  payout_method: 'paypal' | 'bank_transfer' | 'stripe';
  reference: string | null;
  notes: string | null;
  stripe_transfer_id: string | null;
  created_at: string;
}
