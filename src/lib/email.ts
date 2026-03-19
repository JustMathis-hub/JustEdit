import { Resend } from 'resend';
import { PurchaseConfirmationEmail } from '@/emails/PurchaseConfirmationEmail';

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

const FROM_ADDRESS = 'JustEdit <noreply@justedit.store>';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://justedit.store';

/* ─── Purchase Confirmation ──────────────────────────────────────────────── */

interface SendPurchaseConfirmationParams {
  to: string;
  customerName: string | null;
  productName: string;
  thumbnailUrl?: string | null;
  amountPaidCents: number;
  currency: string;
  purchaseId: string;
  orderDate?: string;
}

export async function sendPurchaseConfirmationEmail(
  params: SendPurchaseConfirmationParams
): Promise<void> {
  const resend = getResend();

  if (!resend) {
    console.log('[email] RESEND_API_KEY not set — skipping purchase confirmation email');
    return;
  }

  const { to, customerName, productName, thumbnailUrl, amountPaidCents, currency, purchaseId, orderDate } = params;

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `Commande confirmée — ${productName}`,
    react: PurchaseConfirmationEmail({
      customerName,
      productName,
      thumbnailUrl,
      amountPaidCents,
      currency,
      purchaseId,
      orderDate: orderDate ?? new Date().toISOString(),
      accountUrl: `${SITE_URL}/fr/compte`,
    }),
  });

  if (error) {
    console.error('[email] Failed to send purchase confirmation:', error);
  } else {
    console.log(`[email] Purchase confirmation sent to ${to}`);
  }
}
