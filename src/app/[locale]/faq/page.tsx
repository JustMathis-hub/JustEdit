import { getTranslations } from 'next-intl/server';
import { ChevronDown } from 'lucide-react';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'FAQ | JustEdit' };
}

const faqItems = [
  {
    q: 'Qu\'est-ce qu\'un MOGRT ?',
    a: 'Un MOGRT (Motion Graphics Template) est un format de fichier Adobe qui permet d\'importer des animations directement dans Premiere Pro via le panneau "Graphiques essentiels". C\'est le format parfait pour gagner du temps en montage.',
  },
  {
    q: 'Comment installer un MOGRT ?',
    a: 'Dans Premiere Pro : ouvre le panneau Graphiques essentiels (Fenêtre > Graphiques essentiels), clique sur Parcourir, puis importe le fichier .mogrt. L\'animation apparaît dans ta séquence et tu peux modifier ses paramètres directement dans Premiere Pro.',
  },
  {
    q: 'Quelles versions d\'Adobe sont compatibles ?',
    a: 'Nos packs sont compatibles avec Premiere Pro 2024 et supérieur.',
  },
  {
    q: 'Puis-je utiliser les packs pour des projets clients/commerciaux ?',
    a: 'Oui. La licence incluse avec chaque achat couvre l\'utilisation dans des projets personnels et commerciaux (YouTube, réseaux sociaux, vidéos clients, etc.). La revente ou redistribution des fichiers est interdite.',
  },
  {
    q: 'Puis-je modifier les templates ?',
    a: 'Oui, les templates sont entièrement personnalisables. Tu peux modifier les couleurs, textes, durées et la plupart des paramètres directement depuis Premiere Pro.',
  },
  {
    q: 'Comment télécharger après achat ?',
    a: 'Après paiement, tu es redirigé vers une page de confirmation avec un bouton de téléchargement. Ton achat est également accessible en permanence depuis ton espace membre (Mon Compte > Mes achats).',
  },
  {
    q: 'Je n\'arrive pas à télécharger, que faire ?',
    a: 'Les liens de téléchargement expirent après 15 minutes mais tu peux en générer un nouveau depuis ton espace membre. Si le problème persiste, contacte-nous à contact@justedit.fr.',
  },
  {
    q: 'Puis-je obtenir un remboursement ?',
    a: 'Les contenus numériques téléchargés ne sont pas remboursables (conformément à l\'article L221-28 du Code de la consommation). En cas de problème technique avéré, contacte-nous et nous trouverons une solution.',
  },
];

export default async function FAQPage() {
  const t = await getTranslations('faq');

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <p className="text-xs font-semibold text-[#8b1a1a] uppercase tracking-widest mb-2">Support</p>
          <h1 className="text-3xl font-black text-white tracking-tight">{t('title')}</h1>
          <p className="text-[oklch(0.5_0.005_0)] mt-2">{t('subtitle')}</p>
        </div>

        <div className="space-y-2.5">
          {faqItems.map((item, i) => (
            <details
              key={i}
              className="group bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl overflow-hidden"
            >
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-white font-medium text-sm list-none hover:bg-[oklch(0.13_0_0)] transition-colors">
                {item.q}
                <ChevronDown
                  size={16}
                  className="text-[oklch(0.4_0.005_0)] group-open:rotate-180 transition-transform duration-200 shrink-0 ml-4"
                />
              </summary>
              <div className="px-5 pb-5 text-sm text-[oklch(0.6_0.005_0)] leading-relaxed border-t border-[oklch(0.15_0_0)] pt-3">
                {item.a}
              </div>
            </details>
          ))}
        </div>

        <div className="mt-10 p-5 bg-[oklch(0.11_0_0)] border border-[oklch(0.18_0_0)] rounded-xl text-center">
          <p className="text-white font-semibold mb-1">Tu n'as pas trouvé ta réponse ?</p>
          <p className="text-sm text-[oklch(0.5_0.005_0)] mb-4">On est là pour t'aider.</p>
          <a
            href="/fr/contact"
            className="inline-flex items-center px-5 py-2.5 bg-[#8b1a1a] hover:bg-[#a02020] text-white font-medium text-sm rounded-lg transition-colors"
          >
            Contacter le support
          </a>
        </div>
      </div>
    </div>
  );
}
