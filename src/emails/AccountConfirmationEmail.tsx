import React, { CSSProperties } from 'react';
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Html,
  Preview,
  Row,
  Section,
  Text,
  Hr,
} from '@react-email/components';

export interface AccountConfirmationEmailProps {
  customerName?: string | null;
  confirmationUrl?: string;
}

export function AccountConfirmationEmail({
  customerName = 'Mathis',
  confirmationUrl = 'https://justedit.store',
}: AccountConfirmationEmailProps) {
  const displayName = customerName ?? 'toi';
  const year = new Date().getFullYear();

  return (
    <Html lang="fr">
      <Head />
      <Preview>Confirme ton compte JustEdit pour commencer 🎬</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* ── Header ── */}
          <Section style={headerSection}>
            <Text style={logoText}>Just<span style={logoAccent}>Edit</span></Text>
          </Section>

          {/* ── Hero ── */}
          <Section style={heroBanner}>
            <Text style={heroTitle}>Confirme ton adresse email</Text>
            <Text style={heroSub}>
              Bienvenue sur JustEdit, {displayName} ! Plus qu'une étape avant de pouvoir accéder à tous nos contenus.
            </Text>
          </Section>

          {/* ── Steps ── */}
          <Section style={sectionPadded}>
            <Text style={sectionHeading}>Comment ça marche ?</Text>

            <Section style={stepCard}>
              <Row style={stepRow}>
                <Column style={stepNumCol}>
                  <Text style={stepNum}>1</Text>
                </Column>
                <Column style={stepTextCol}>
                  <Text style={stepTitle}>Clique sur le bouton ci-dessous</Text>
                  <Text style={stepDesc}>Ça confirme que cette adresse email t'appartient.</Text>
                </Column>
              </Row>

              <Hr style={stepDivider} />

              <Row style={stepRow}>
                <Column style={stepNumCol}>
                  <Text style={stepNum}>2</Text>
                </Column>
                <Column style={stepTextCol}>
                  <Text style={stepTitle}>Accède à ton espace</Text>
                  <Text style={stepDesc}>Télécharge tes packs, gère tes achats, réclame tes contenus gratuits.</Text>
                </Column>
              </Row>
            </Section>
          </Section>

          {/* ── CTA ── */}
          <Section style={ctaSection}>
            <Button href={confirmationUrl} style={ctaButton}>
              Confirmer mon compte →
            </Button>
            <Text style={ctaNote}>
              Ce lien expire dans 24h. Si tu n'es pas à l'origine de cette inscription, ignore cet email.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* ── Footer ── */}
          <Section style={footerSection}>
            <Text style={footerMain}>
              Une question ?{' '}
              <a href="https://justedit.store/contact" style={footerLink}>
                Contactez-nous
              </a>
            </Text>
            <Text style={footerMuted}>© {year} JustEdit · Tous droits réservés</Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

export default AccountConfirmationEmail;

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const body: CSSProperties = {
  backgroundColor: '#080808',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  margin: 0,
  padding: '32px 16px',
};

const container: CSSProperties = {
  backgroundColor: '#0f0f0f',
  border: '1px solid #1e1e1e',
  borderRadius: '12px',
  maxWidth: '560px',
  margin: '0 auto',
  overflow: 'hidden',
};

/* Header */
const headerSection: CSSProperties = {
  backgroundColor: '#0a0a0a',
  borderBottom: '1px solid #181818',
  padding: '20px 28px',
};

const logoText: CSSProperties = {
  color: '#ffffff',
  fontSize: '19px',
  fontWeight: '900',
  letterSpacing: '-0.4px',
  margin: 0,
};

const logoAccent: CSSProperties = {
  color: '#8b1a1a',
};

/* Hero */
const heroBanner: CSSProperties = {
  backgroundColor: '#111',
  borderBottom: '1px solid #1a1a1a',
  padding: '28px 28px 22px',
};

const heroTitle: CSSProperties = {
  color: '#f0f0f0',
  fontSize: '20px',
  fontWeight: '800',
  letterSpacing: '-0.3px',
  margin: '0 0 8px',
};

const heroSub: CSSProperties = {
  color: '#777',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: 0,
};

/* Shared */
const sectionPadded: CSSProperties = {
  padding: '24px 28px',
};

const sectionHeading: CSSProperties = {
  color: '#aaa',
  fontSize: '13px',
  fontWeight: '700',
  margin: '0 0 16px',
};

/* Steps */
const stepCard: CSSProperties = {
  backgroundColor: '#141414',
  border: '1px solid #222',
  borderRadius: '10px',
  padding: '6px 16px',
};

const stepRow: CSSProperties = {
  padding: '14px 0',
};

const stepNumCol: CSSProperties = {
  width: '36px',
  verticalAlign: 'top',
};

const stepNum: CSSProperties = {
  backgroundColor: '#8b1a1a',
  borderRadius: '50%',
  color: '#fff',
  fontSize: '12px',
  fontWeight: '800',
  height: '28px',
  lineHeight: '28px',
  margin: '2px 0 0',
  textAlign: 'center',
  width: '28px',
  display: 'block',
};

const stepTextCol: CSSProperties = {
  paddingLeft: '12px',
  verticalAlign: 'top',
};

const stepTitle: CSSProperties = {
  color: '#e0e0e0',
  fontSize: '14px',
  fontWeight: '700',
  margin: '0 0 3px',
};

const stepDesc: CSSProperties = {
  color: '#666',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: 0,
};

const stepDivider: CSSProperties = {
  borderColor: '#1e1e1e',
  margin: '0',
};

/* CTA */
const ctaSection: CSSProperties = {
  padding: '4px 28px 28px',
  textAlign: 'center',
};

const ctaButton: CSSProperties = {
  backgroundColor: '#8b1a1a',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: '700',
  padding: '13px 30px',
  textDecoration: 'none',
};

const ctaNote: CSSProperties = {
  color: '#444',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '16px 0 0',
};

/* Divider */
const divider: CSSProperties = {
  borderColor: '#181818',
  margin: '0 28px',
};

/* Footer */
const footerSection: CSSProperties = {
  padding: '20px 28px 26px',
  textAlign: 'center',
};

const footerMain: CSSProperties = {
  color: '#555',
  fontSize: '13px',
  margin: '0 0 6px',
};

const footerLink: CSSProperties = {
  color: '#8b1a1a',
  textDecoration: 'none',
};

const footerMuted: CSSProperties = {
  color: '#333',
  fontSize: '11px',
  margin: 0,
};
