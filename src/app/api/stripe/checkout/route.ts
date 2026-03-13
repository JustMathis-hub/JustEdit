import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { productId, locale: reqLocale } = await request.json();
    const locale = reqLocale === 'en' ? 'en' : 'fr';

    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }

    // Verify auth
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('is_published', true)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.is_free) {
      return NextResponse.json({ error: 'Product is free' }, { status: 400 });
    }

    // Check not already purchased
    const { data: existing } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .eq('status', 'completed')
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Already purchased' }, { status: 409 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const productName = locale === 'fr' ? product.name_fr : product.name_en;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: product.price_cents,
            product_data: {
              name: productName,
              description: `JustEdit — ${product.category.toUpperCase()} pack`,
              images: product.thumbnail_url ? [product.thumbnail_url] : [],
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id: user.id,
        product_id: product.id,
      },
      success_url: `${siteUrl}/${locale}/checkout/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/${locale}/boutique/${product.slug}`,
      payment_intent_data: {
        metadata: {
          user_id: user.id,
          product_id: product.id,
        },
      },
      custom_text: {
        submit: {
          message: locale === 'en'
            ? 'By confirming, you waive your right of withdrawal for this digital content.'
            : 'En confirmant, vous renoncez à votre droit de rétractation pour ce contenu numérique (art. L221-28 Code de la consommation).',
        },
      },
      locale: locale === 'en' ? 'en' : 'fr',
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[stripe/checkout]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
