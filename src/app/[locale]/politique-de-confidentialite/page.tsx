import { getLocale } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: locale === 'en' ? 'Privacy Policy | JustEdit' : 'Politique de confidentialité | JustEdit',
  };
}

export default async function PrivacyPage() {
  const locale = await getLocale();
  const isFr = locale !== 'en';
  const dateStr = new Date().toLocaleDateString(isFr ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  if (!isFr) {
    return (
      <div className="min-h-screen pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-xs font-semibold text-[#8b1a1a] uppercase tracking-widest mb-2">Legal</p>
            <h1 className="text-3xl font-black text-white tracking-tight">Privacy Policy</h1>
          </div>

          <div className="space-y-8 text-[oklch(0.65_0.005_0)] text-sm leading-relaxed">

            <section>
              <h2 className="text-lg font-bold text-white mb-3">1. Data Controller</h2>
              <p>
                JustEdit is responsible for the processing of personal data collected on justedit.fr. DPO contact: justmathis.contact@gmail.com
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">2. Data Collected</h2>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-white">When creating an account:</p>
                  <p>Full name, email address, password (hashed).</p>
                </div>
                <div>
                  <p className="font-semibold text-white">When making a purchase:</p>
                  <p>Payment data (processed exclusively by Stripe), product purchased, date and amount of the transaction.</p>
                </div>
                <div>
                  <p className="font-semibold text-white">Automatically:</p>
                  <p>IP address (for security purposes only, during downloads), anonymised browsing data.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">3. Purposes of Processing</h2>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>User account management and authentication</li>
                <li>Order processing and tracking</li>
                <li>Access to purchased downloads</li>
                <li>Sending transactional emails (order confirmation)</li>
                <li>Security and fraud prevention</li>
                <li>Compliance with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">4. Legal Basis</h2>
              <p>
                Processing is based on the performance of a contract (Art. 6.1.b GDPR) for order-related data, and on legitimate interest (Art. 6.1.f) for security purposes.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">5. Sub-processors</h2>
              <div className="space-y-2">
                {[
                  { name: 'Supabase Inc.', role: 'Database hosting and authentication', link: 'https://supabase.com/privacy' },
                  { name: 'Stripe Inc.', role: 'Payment processing', link: 'https://stripe.com/en/privacy' },
                  { name: 'Resend Inc.', role: 'Transactional email sending', link: 'https://resend.com/privacy' },
                  { name: 'Vercel Inc.', role: 'Website hosting', link: 'https://vercel.com/legal/privacy-policy' },
                ].map((sub) => (
                  <div key={sub.name} className="flex items-start gap-2 p-3 bg-[oklch(0.11_0_0)] rounded-lg border border-[oklch(0.18_0_0)]">
                    <div>
                      <span className="font-semibold text-white">{sub.name}</span>
                      <span className="text-[oklch(0.5_0.005_0)]"> — {sub.role}</span>
                      <br/>
                      <a href={sub.link} className="text-[#8b1a1a] hover:text-[#c0392b] text-xs" target="_blank" rel="noopener">
                        Privacy policy →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">6. Retention Period</h2>
              <p>
                Account data is retained for the duration of account activity, then deleted within 3 years of the last activity. Transaction data is retained for 10 years in accordance with French accounting obligations.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">7. Your Rights (GDPR)</h2>
              <p>In accordance with Articles 15 to 22 of the GDPR, you have the following rights:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                <li><strong className="text-white">Right of access</strong> — obtain a copy of your data</li>
                <li><strong className="text-white">Right of rectification</strong> — correct inaccurate data</li>
                <li><strong className="text-white">Right to erasure</strong> — request deletion of your data</li>
                <li><strong className="text-white">Right to portability</strong> — receive your data in a readable format</li>
                <li><strong className="text-white">Right to object</strong> — object to certain processing</li>
              </ul>
              <p className="mt-3">
                To exercise these rights: <a href="mailto:justmathis.contact@gmail.com" className="text-[#8b1a1a] hover:text-[#c0392b]">justmathis.contact@gmail.com</a>. You may also lodge a complaint with your national data protection authority (e.g. the <a href="https://ico.org.uk" className="text-[#8b1a1a] hover:text-[#c0392b]" target="_blank" rel="noopener">ICO</a> in the UK, or the <a href="https://www.cnil.fr" className="text-[#8b1a1a] hover:text-[#c0392b]" target="_blank" rel="noopener">CNIL</a> in France).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">8. Cookies</h2>
              <p>
                This site uses only technical cookies (authentication session, language preferences). No advertising or third-party tracking cookies are installed. You may refuse non-essential cookies from the banner displayed on your first visit.
              </p>
            </section>

            <p className="text-xs text-[oklch(0.4_0.005_0)] pt-4 border-t border-[oklch(0.15_0_0)]">
              Last updated: {dateStr}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <p className="text-xs font-semibold text-[#8b1a1a] uppercase tracking-widest mb-2">Légal</p>
          <h1 className="text-3xl font-black text-white tracking-tight">Politique de confidentialité</h1>
        </div>

        <div className="space-y-8 text-[oklch(0.65_0.005_0)] text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-white mb-3">1. Responsable du traitement</h2>
            <p>
              JustEdit est responsable du traitement des données personnelles collectées sur justedit.fr. Contact DPO : justmathis.contact@gmail.com
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. Données collectées</h2>
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-white">Lors de la création de compte :</p>
                <p>Nom complet, adresse email, mot de passe (haché).</p>
              </div>
              <div>
                <p className="font-semibold text-white">Lors d'un achat :</p>
                <p>Données de paiement (traitées exclusivement par Stripe), produit acheté, date et montant de la transaction.</p>
              </div>
              <div>
                <p className="font-semibold text-white">Automatiquement :</p>
                <p>Adresse IP (à des fins de sécurité uniquement, lors des téléchargements), données de navigation anonymisées.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">3. Finalités du traitement</h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Gestion des comptes utilisateurs et authentification</li>
              <li>Traitement et suivi des commandes</li>
              <li>Accès aux téléchargements achetés</li>
              <li>Envoi des emails transactionnels (confirmation de commande)</li>
              <li>Sécurité et prévention de la fraude</li>
              <li>Respect des obligations légales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">4. Base légale</h2>
            <p>
              Le traitement est fondé sur l'exécution d'un contrat (art. 6.1.b RGPD) pour les données liées aux commandes, et sur l'intérêt légitime (art. 6.1.f) pour la sécurité.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">5. Sous-traitants</h2>
            <div className="space-y-2">
              {[
                { name: 'Supabase Inc.', role: 'Hébergement de la base de données et authentification', link: 'https://supabase.com/privacy' },
                { name: 'Stripe Inc.', role: 'Traitement des paiements', link: 'https://stripe.com/fr/privacy' },
                { name: 'Resend Inc.', role: 'Envoi d\'emails transactionnels', link: 'https://resend.com/privacy' },
                { name: 'Vercel Inc.', role: 'Hébergement du site', link: 'https://vercel.com/legal/privacy-policy' },
              ].map((sub) => (
                <div key={sub.name} className="flex items-start gap-2 p-3 bg-[oklch(0.11_0_0)] rounded-lg border border-[oklch(0.18_0_0)]">
                  <div>
                    <span className="font-semibold text-white">{sub.name}</span>
                    <span className="text-[oklch(0.5_0.005_0)]"> — {sub.role}</span>
                    <br/>
                    <a href={sub.link} className="text-[#8b1a1a] hover:text-[#c0392b] text-xs" target="_blank" rel="noopener">
                      Politique de confidentialité →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">6. Durée de conservation</h2>
            <p>
              Les données de compte sont conservées pendant toute la durée de l'activité du compte, puis supprimées dans un délai de 3 ans après la dernière activité. Les données de transaction sont conservées 10 ans conformément aux obligations comptables françaises.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">7. Tes droits (RGPD)</h2>
            <p>Conformément aux articles 15 à 22 du RGPD, tu disposes des droits suivants :</p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
              <li><strong className="text-white">Droit d'accès</strong> — obtenir une copie de tes données</li>
              <li><strong className="text-white">Droit de rectification</strong> — corriger des données inexactes</li>
              <li><strong className="text-white">Droit à l'effacement</strong> — demander la suppression de tes données</li>
              <li><strong className="text-white">Droit à la portabilité</strong> — recevoir tes données dans un format lisible</li>
              <li><strong className="text-white">Droit d'opposition</strong> — t'opposer à certains traitements</li>
            </ul>
            <p className="mt-3">
              Pour exercer ces droits : <a href="mailto:justmathis.contact@gmail.com" className="text-[#8b1a1a] hover:text-[#c0392b]">justmathis.contact@gmail.com</a>. Tu peux également introduire une réclamation auprès de la <a href="https://www.cnil.fr" className="text-[#8b1a1a] hover:text-[#c0392b]" target="_blank" rel="noopener">CNIL</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">8. Cookies</h2>
            <p>
              Ce site utilise uniquement des cookies techniques (session d'authentification, préférences de langue). Aucun cookie publicitaire ou de tracking tiers n'est installé. Tu peux refuser les cookies non-essentiels depuis la bannière affichée lors de ta première visite.
            </p>
          </section>

          <p className="text-xs text-[oklch(0.4_0.005_0)] pt-4 border-t border-[oklch(0.15_0_0)]">
            Dernière mise à jour : {dateStr}
          </p>
        </div>
      </div>
    </div>
  );
}
