import React, { CSSProperties } from 'react';
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
  Hr,
} from '@react-email/components';

export interface PurchaseConfirmationEmailProps {
  customerName?: string | null;
  productName?: string;
  productType?: string;
  thumbnailUrl?: string | null;
  amountPaidCents?: number;
  currency?: string;
  purchaseId?: string;
  orderDate?: string;
  accountUrl?: string;
}

function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  }).format(new Date(iso));
}

export function PurchaseConfirmationEmail({
  customerName = 'Mathis',
  productName = 'Cinematic MOGRT Pack Vol.1',
  productType = 'Produit numérique',
  thumbnailUrl = null,
  amountPaidCents = 2900,
  currency = 'eur',
  purchaseId = 'a1b2c3d4-e5f6-7890',
  orderDate = new Date().toISOString(),
  accountUrl = 'https://justedit.store/fr/compte',
}: PurchaseConfirmationEmailProps) {
  const displayName = customerName ?? 'Client';
  const formattedPrice = formatPrice(amountPaidCents, currency);
  const formattedDate = formatDate(orderDate);
  const year = new Date().getFullYear();
  const shortRef = purchaseId.split('-')[0].toUpperCase();

  return (
    <Html lang="fr">
      <Head />
      <Preview>Commande confirmée — {productName} est prêt à télécharger</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* ── Header ── */}
          <Section style={headerSection}>
            <Text style={logoText}>Just<span style={logoAccent}>Edit</span></Text>
          </Section>

          {/* ── Hero banner ── */}
          <Section style={heroBanner}>
            <Text style={heroTitle}>Votre commande a été confirmée</Text>
            <Text style={heroSub}>Bonjour {displayName}, merci pour votre achat !</Text>
          </Section>

          {/* ── Product section ── */}
          <Section style={sectionPadded}>
            <Text style={sectionHeading}>Produits achetés</Text>
            <Section style={productCard}>
              <Row>
                {/* Thumbnail */}
                <Column style={thumbCol}>
                  {thumbnailUrl ? (
                    <Img
                      src={thumbnailUrl}
                      width="90"
                      height="64"
                      alt={productName}
                      style={thumbImg}
                    />
                  ) : (
                    <Section style={thumbPlaceholder}>
                      <Text style={thumbIcon}>▶</Text>
                    </Section>
                  )}
                </Column>

                {/* Info */}
                <Column style={productInfoCol}>
                  <Text style={productName_style}>{productName}</Text>
                  <Text style={productTypeText}>{productType}</Text>
                </Column>

                {/* Price */}
                <Column style={priceCol}>
                  <Text style={priceText}>{formattedPrice}</Text>
                </Column>
              </Row>
            </Section>

            {/* Total */}
            <Section style={totalRow}>
              <Row>
                <Column>
                  <Text style={totalLabel}>Total de la commande</Text>
                </Column>
                <Column style={{ textAlign: 'right' }}>
                  <Text style={totalValue}>{formattedPrice}</Text>
                </Column>
              </Row>
            </Section>
          </Section>

          {/* ── CTA ── */}
          <Section style={ctaSection}>
            <Button href={accountUrl} style={ctaButton}>
              Accéder à mes achats
            </Button>
          </Section>

          <Hr style={divider} />

          {/* ── Order details ── */}
          <Section style={sectionPadded}>
            <Row style={{ marginBottom: '6px' }}>
              <Column><Text style={metaLabel}>Numéro de commande</Text></Column>
              <Column style={{ textAlign: 'right' }}><Text style={metaValue}>#{shortRef}</Text></Column>
            </Row>
            <Row>
              <Column><Text style={metaLabel}>Date de commande</Text></Column>
              <Column style={{ textAlign: 'right' }}><Text style={metaValue}>{formattedDate}</Text></Column>
            </Row>
            <Row style={{ marginTop: '6px' }}>
              <Column>
                <Text style={metaLabel}>
                  Retrouvez tous vos achats :{' '}
                  <a href={accountUrl} style={inlineLink}>Mon compte</a>
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* ── Footer ── */}
          <Section style={footerSection}>
            <Text style={footerMain}>
              Pour toute demande d'assistance,{' '}
              <a href="https://justedit.store/contact" style={footerLink}>
                contactez-nous
              </a>
            </Text>
            <Text style={footerMuted}>© {year} JustEdit · Tous droits réservés</Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

export default PurchaseConfirmationEmail;

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
  margin: '0 0 6px',
};

const heroSub: CSSProperties = {
  color: '#777',
  fontSize: '14px',
  margin: 0,
  lineHeight: '1.5',
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

/* Product card */
const productCard: CSSProperties = {
  backgroundColor: '#141414',
  border: '1px solid #222',
  borderRadius: '10px',
  padding: '14px 16px',
};

const thumbCol: CSSProperties = {
  width: '96px',
  verticalAlign: 'middle',
};

const thumbImg: CSSProperties = {
  borderRadius: '6px',
  objectFit: 'cover',
  display: 'block',
};

const thumbPlaceholder: CSSProperties = {
  backgroundColor: '#1a1a1a',
  border: '1px solid #2a2a2a',
  borderRadius: '6px',
  width: '90px',
  height: '64px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const thumbIcon: CSSProperties = {
  color: '#8b1a1a',
  fontSize: '20px',
  margin: 0,
  textAlign: 'center',
  lineHeight: '64px',
};

const productInfoCol: CSSProperties = {
  paddingLeft: '14px',
  verticalAlign: 'middle',
};

const productName_style: CSSProperties = {
  color: '#e5e5e5',
  fontSize: '14px',
  fontWeight: '700',
  margin: '0 0 4px',
};

const productTypeText: CSSProperties = {
  color: '#555',
  fontSize: '12px',
  margin: 0,
};

const priceCol: CSSProperties = {
  textAlign: 'right',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
};

const priceText: CSSProperties = {
  color: '#e5e5e5',
  fontSize: '14px',
  fontWeight: '700',
  margin: 0,
};

/* Total */
const totalRow: CSSProperties = {
  borderTop: '1px solid #1e1e1e',
  marginTop: '12px',
  paddingTop: '14px',
};

const totalLabel: CSSProperties = {
  color: '#888',
  fontSize: '13px',
  margin: 0,
};

const totalValue: CSSProperties = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '800',
  margin: 0,
};

/* CTA */
const ctaSection: CSSProperties = {
  padding: '0 28px 28px',
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

/* Divider */
const divider: CSSProperties = {
  borderColor: '#181818',
  margin: '0 28px',
};

/* Meta */
const metaLabel: CSSProperties = {
  color: '#666',
  fontSize: '13px',
  margin: '0 0 4px',
};

const metaValue: CSSProperties = {
  color: '#999',
  fontSize: '13px',
  fontWeight: '600',
  margin: '0 0 4px',
};

const inlineLink: CSSProperties = {
  color: '#8b1a1a',
  textDecoration: 'none',
  fontWeight: '600',
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
