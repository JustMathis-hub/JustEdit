import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
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

        // Insert purchase
        const { error } = await supabase.from('purchases').upsert(
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
        );

        if (error) {
          console.error('[webhook] Insert purchase error:', error);
        } else {
          console.log(`[webhook] Purchase recorded: user=${user_id} product=${product_id}`);
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
