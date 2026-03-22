import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendPurchaseConfirmationEmail } from '@/lib/email';
import type Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { user_id, product_id } = session.metadata ?? {};

        if (!user_id || !product_id) {
          console.error('[webhook] Missing metadata for session:', session.id);
          return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
        }

        if (session.payment_status !== 'paid') {
          console.warn(`[webhook] Session ${session.id} not paid (status: ${session.payment_status})`);
          return NextResponse.json({ received: true, skipped: 'not_paid' });
        }

        // Fetch product name for the confirmation email
        const { data: productData } = await supabase
          .from('products')
          .select('name_fr, name_en, thumbnail_url')
          .eq('id', product_id)
          .single();

        // Insert purchase and get its ID back
        const { data: insertedPurchase, error } = await supabase
          .from('purchases')
          .upsert(
            {
              user_id,
              product_id,
              stripe_session_id: session.id,
              stripe_payment_intent: session.payment_intent as string,
              amount_paid_cents: session.amount_total ?? 0,
              currency: session.currency ?? 'eur',
              status: 'completed',
              completed_at: new Date().toISOString(),
            },
            { onConflict: 'stripe_session_id' }
          )
          .select('id')
          .single();

        if (error) {
          console.error('[webhook] Insert purchase error:', error);
        } else {
          console.log(`[webhook] Purchase recorded: user=${user_id} product=${product_id}`);

          // ── Affiliate commission tracking ──
          const affiliateId = session.metadata?.affiliate_id;
          if (affiliateId && insertedPurchase?.id) {
            try {
              const { data: affiliate } = await supabase
                .from('affiliates')
                .select('id, commission_rate, status, user_id')
                .eq('id', affiliateId)
                .eq('status', 'active')
                .single();

              if (affiliate && affiliate.user_id !== user_id) {
                const saleAmount = session.amount_total ?? 0;
                const commissionCents = Math.round(saleAmount * affiliate.commission_rate / 100);

                await supabase.from('affiliate_commissions').upsert(
                  {
                    affiliate_id: affiliate.id,
                    purchase_id: insertedPurchase.id,
                    product_id,
                    sale_amount_cents: saleAmount,
                    commission_cents: commissionCents,
                    commission_rate: affiliate.commission_rate,
                    status: 'pending',
                  },
                  { onConflict: 'purchase_id' }
                );

                await supabase.rpc('increment_affiliate_earnings', {
                  p_affiliate_id: affiliate.id,
                  p_amount: commissionCents,
                });

                console.log(`[webhook] Commission recorded: affiliate=${affiliate.id} amount=${commissionCents}c`);
              }
            } catch (affErr) {
              console.error('[webhook] Affiliate commission error:', affErr);
            }
          }

          // Resolve customer email: prefer Stripe session, fallback to Supabase auth
          let customerEmail = session.customer_details?.email ?? null;
          let customerName = session.customer_details?.name ?? null;

          if (!customerEmail) {
            const { data: authUser } = await supabase.auth.admin.getUserById(user_id);
            customerEmail = authUser.user?.email ?? null;
            customerName = customerName ?? authUser.user?.user_metadata?.full_name ?? null;
          }

          if (customerEmail) {
            // Send purchase confirmation email (non-blocking — never delays webhook response)
            sendPurchaseConfirmationEmail({
              to: customerEmail,
              customerName,
              productName: productData?.name_fr ?? productData?.name_en ?? 'Produit JustEdit',
              thumbnailUrl: productData?.thumbnail_url ?? null,
              amountPaidCents: session.amount_total ?? 0,
              currency: session.currency ?? 'eur',
              purchaseId: insertedPurchase?.id ?? session.id,
              orderDate: new Date().toISOString(),
            }).catch((err) => console.error('[webhook] Email send error:', err));
          }
        }
        break;
      }

      case 'charge.dispute.created': {
        console.warn('[webhook] Dispute created:', event.data.object);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error('[webhook] Handler error:', err);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
