import { NextResponse } from 'next/server';
import { contactRatelimit, getIp } from '@/lib/ratelimit';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_SUBJECT = 200;
const MAX_MESSAGE = 5000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    // Rate limiting
    if (contactRatelimit) {
      const ip = getIp(request);
      const { success } = await contactRatelimit.limit(ip);
      if (!success) {
        return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });
      }
    }

    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Input validation
    if (typeof name !== 'string' || name.length > MAX_NAME ||
        typeof email !== 'string' || email.length > MAX_EMAIL || !EMAIL_REGEX.test(email) ||
        typeof subject !== 'string' || subject.length > MAX_SUBJECT ||
        typeof message !== 'string' || message.length > MAX_MESSAGE) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Si Resend est configuré, envoyer l'email
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      const safeName = escapeHtml(name.trim());
      const safeEmail = escapeHtml(email.trim());
      const safeSubject = escapeHtml(subject.trim());
      const safeMessage = escapeHtml(message.trim());

      await resend.emails.send({
        from: `JustEdit Contact <noreply@justedit.store>`,
        to: process.env.CONTACT_EMAIL ?? 'justmathis.contact@gmail.com',
        subject: `[JustEdit] ${safeSubject}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #8b1a1a;">Nouveau message de contact</h2>
            <p><strong>Nom :</strong> ${safeName}</p>
            <p><strong>Email :</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
            <p><strong>Sujet :</strong> ${safeSubject}</p>
            <hr style="border: 1px solid #222;" />
            <p style="white-space: pre-wrap;">${safeMessage}</p>
          </div>
        `,
        replyTo: email.trim(),
      });
    } else {
      // Log en développement
      console.log('[contact]', { name, email, subject, message });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[contact]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
