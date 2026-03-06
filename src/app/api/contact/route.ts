import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Si Resend est configuré, envoyer l'email
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: `JustEdit Contact <noreply@justedit.fr>`,
        to: process.env.CONTACT_EMAIL ?? 'contact@justedit.fr',
        subject: `[JustEdit] ${subject}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #8b1a1a;">Nouveau message de contact</h2>
            <p><strong>Nom :</strong> ${name}</p>
            <p><strong>Email :</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Sujet :</strong> ${subject}</p>
            <hr style="border: 1px solid #222;" />
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        `,
        replyTo: email,
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
