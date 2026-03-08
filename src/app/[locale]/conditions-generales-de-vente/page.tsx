import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Conditions Générales de Vente | JustEdit' };
}

export default function CGVPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <p className="text-xs font-semibold text-[#8b1a1a] uppercase tracking-widest mb-2">Légal</p>
          <h1 className="text-3xl font-black text-white tracking-tight">Conditions Générales de Vente</h1>
        </div>

        <div className="space-y-8 text-[oklch(0.65_0.005_0)] text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-white mb-3">1. Objet et champ d'application</h2>
            <p>
              Les présentes Conditions Générales de Vente (ci-après "CGV") régissent les ventes de contenus numériques (templates, presets, MOGRT) effectuées sur le site <strong className="text-white">justedit.fr</strong> par JustEdit (ci-après "le Vendeur") à tout consommateur ou professionnel (ci-après "l'Acheteur").
            </p>
            <p className="mt-3">
              Toute commande implique l'acceptation sans réserve des présentes CGV. Ces CGV prévalent sur tout autre document, sauf accord écrit préalable du Vendeur.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. Produits — Description</h2>
            <p>
              Les produits vendus sont des <strong className="text-white">contenus numériques dématérialisés</strong> (fichiers .mogrt, .zip) destinés à être utilisés avec Adobe Premiere Pro. Ils ne constituent pas des logiciels autonomes.
            </p>
            <p className="mt-3">
              Les descriptions, aperçus et captures d'écran sont fournis à titre indicatif. Le Vendeur s'efforce de représenter les produits de manière fidèle.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">3. Prix</h2>
            <p>
              Les prix sont indiqués en euros (€) toutes taxes comprises (TTC). Le Vendeur se réserve le droit de modifier ses prix à tout moment. Les commandes sont facturées au prix en vigueur au moment de la validation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">4. Paiement</h2>
            <p>
              Le paiement s'effectue en ligne et de manière sécurisée via <strong className="text-white">Stripe</strong>, qui accepte les cartes bancaires (Visa, Mastercard, American Express) et autres moyens de paiement selon disponibilité. Les coordonnées bancaires ne transitent pas par les serveurs de JustEdit.
            </p>
            <p className="mt-3">
              La commande est validée uniquement après confirmation du paiement par Stripe. En cas d'échec, la commande est automatiquement annulée.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">5. Livraison — Accès aux fichiers</h2>
            <p>
              Le téléchargement des fichiers est disponible <strong className="text-white">immédiatement</strong> après confirmation du paiement, depuis l'espace membre de l'Acheteur, accessibleindéfiniment.
            </p>
            <p className="mt-3">
              Les liens de téléchargement sont générés à la demande et sont valables 15 minutes par génération, pour des raisons de sécurité. L'Acheteur peut relancer un téléchargement autant de fois que nécessaire.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">6. Droit de rétractation — Exclusion légale</h2>
            <div className="bg-[rgba(139,26,26,0.08)] border border-[rgba(139,26,26,0.2)] rounded-xl p-4">
              <p className="text-white font-semibold mb-2">⚠️ Information importante</p>
              <p>
                Conformément à l'article <strong className="text-white">L221-28 alinéa 13° du Code de la consommation</strong>, le droit de rétractation ne peut être exercé pour les <strong className="text-white">contenus numériques non fournis sur un support matériel dont l'exécution a commencé après accord préalable exprès du consommateur et renoncement exprès à son droit de rétractation</strong>.
              </p>
              <p className="mt-3">
                En cochant la case d'acceptation lors de la commande, l'Acheteur reconnaît expressément que la fourniture du contenu numérique a commencé immédiatement après la confirmation du paiement, et <strong className="text-white">renonce expressément à son droit de rétractation de 14 jours</strong>.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">7. Licence d'utilisation</h2>
            <p>
              L'achat confère à l'Acheteur une <strong className="text-white">licence personnelle, non exclusive et non transférable</strong> pour utiliser le(s) fichier(s) dans des projets personnels et commerciaux. Cette licence couvre :
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
              <li>Usage dans des vidéos personnelles</li>
              <li>Usage dans des vidéos pour des clients</li>
              <li>Usage dans des contenus publiés sur YouTube, Instagram, TikTok, etc.</li>
            </ul>
            <p className="mt-3 text-[oklch(0.5_0.005_0)]">
              <strong className="text-[oklch(0.65_0.005_0)]">Sont interdits :</strong> la revente, redistribution, partage, ou mise à disposition gratuite ou payante des fichiers à des tiers. La création de produits concurrents basés sur les fichiers achetés est strictement interdite.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">8. Garantie et responsabilité</h2>
            <p>
              Les produits sont livrés "en l'état". Le Vendeur garantit que les fichiers sont conformes à leur description au moment de la vente. Aucune garantie n'est accordée quant à la compatibilité avec toutes les versions futures de Premiere Pro.
            </p>
            <p className="mt-3">
              En cas de fichier corrompu ou non-conforme à la description, l'Acheteur peut contacter support@justedit.fr pour obtenir un remplacement ou un remboursement, à l'appréciation du Vendeur.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">9. Données personnelles</h2>
            <p>
              Les données collectées lors d'une commande (nom, email, historique d'achat) sont traitées conformément à la <a href="/fr/politique-de-confidentialite" className="text-[#8b1a1a] hover:text-[#c0392b] underline">politique de confidentialité</a> et au RGPD.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">10. Litiges — Médiation</h2>
            <p>
              En cas de litige, l'Acheteur peut contacter contact@justedit.fr. À défaut de résolution amiable, l'Acheteur consommateur peut recourir à une médiation de la consommation (liste disponible sur <a href="https://www.economie.gouv.fr" className="text-[#8b1a1a]" target="_blank" rel="noopener">economie.gouv.fr</a>). Le droit applicable est le droit français.
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
