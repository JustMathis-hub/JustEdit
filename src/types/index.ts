export type Locale = 'fr' | 'en';

export type UserRole = 'customer' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
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
