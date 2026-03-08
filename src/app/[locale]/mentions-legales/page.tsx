import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Mentions légales | JustEdit' };
}

export default async function MentionsLegalesPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <p className="text-xs font-semibold text-[#8b1a1a] uppercase tracking-widest mb-2">Légal</p>
          <h1 className="text-3xl font-black text-white tracking-tight">Mentions légales</h1>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-[oklch(0.65_0.005_0)] text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-white mb-3">1. Éditeur du site</h2>
            <p>
              Le site <strong className="text-white">justedit.fr</strong> est édité par :<br/>
              <strong className="text-white">JustEdit</strong><br/>
              Directeur de la publication : [Ton prénom et nom]<br/>
              Email de contact : contact@justedit.fr
            </p>
            <p className="mt-3 text-[oklch(0.5_0.005_0)]">
              <em>Si tu as un numéro SIRET (auto-entrepreneur ou société), indique-le ici.</em>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. Hébergeur</h2>
            <p>
              Le site est hébergé par :<br/>
              <strong className="text-white">Vercel Inc.</strong><br/>
              340 Pine Street, Suite 701<br/>
              San Francisco, CA 94104 – États-Unis<br/>
              Site : <a href="https://vercel.com" className="text-[#8b1a1a] hover:text-[#c0392b]" target="_blank" rel="noopener">vercel.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">3. Propriété intellectuelle</h2>
            <p>
              L'ensemble du contenu de ce site (textes, graphismes, logos, icônes, images, vidéos, sons, et logiciels) est la propriété exclusive de JustEdit, sauf mention contraire. Toute reproduction, distribution, modification, adaptation, retransmission ou publication, même partielle, est strictement interdite sans l'accord exprès et écrit de JustEdit.
            </p>
            <p className="mt-3">
              Les templates, presets et MOGRT vendus sur ce site sont protégés par le droit d'auteur. Leur achat confère une <strong className="text-white">licence d'utilisation personnelle et commerciale limitée</strong>, définie dans les CGV.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">4. Données personnelles</h2>
            <p>
              Les informations collectées lors de la création de compte ou de l'achat sont utilisées uniquement pour la gestion des commandes et l'accès aux téléchargements. Elles ne sont jamais revendues à des tiers. Conformément au RGPD, tu disposes d'un droit d'accès, de rectification et de suppression de tes données. Pour l'exercer : contact@justedit.fr.
            </p>
            <p className="mt-3">
              Voir la <a href="/fr/politique-de-confidentialite" className="text-[#8b1a1a] hover:text-[#c0392b] underline">politique de confidentialité</a> complète.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">5. Cookies</h2>
            <p>
              Ce site utilise des cookies techniques indispensables à son fonctionnement (session d'authentification) et des cookies d'analyse anonymisée. Aucun cookie publicitaire tiers n'est installé. Tu peux refuser les cookies non-essentiels depuis la bannière de consentement affichée à ta première visite.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">6. Liens hypertextes</h2>
            <p>
              JustEdit ne peut être tenu responsable du contenu des sites tiers vers lesquels des liens sont proposés. La mise en place de liens pointant vers le site justedit.fr est possible sans autorisation préalable pour tout lien ne présentant pas un caractère trompeur.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">7. Droit applicable</h2>
            <p>
              Le présent site et ses mentions légales sont soumis au droit français. En cas de litige, les tribunaux français seront seuls compétents.
            </p>
          </section>

          <p className="text-xs text-[oklch(0.4_0.005_0)] pt-4 border-t border-[oklch(0.15_0_0)]">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
