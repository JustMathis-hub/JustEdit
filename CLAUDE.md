# JustEdit — Contexte projet pour Claude Code

## Vue d'ensemble

**JustEdit** est une boutique e-commerce de packs de motion graphics pour Premiere Pro (fichiers `.mogrt`).
Stack : **Next.js 16 App Router** · **TypeScript** · **Supabase** · **Stripe** · **Tailwind CSS** · **next-intl** (FR/EN) · **Resend** (emails) · **@react-email/components** (templates)
Deploye sur **Vercel** · Repo GitHub : `JustMathis-hub/JustEdit`
Domaine : `justedit.store` (DNS gerees par **Cloudflare**)
Registrar : **GoDaddy** (domaine seulement, DNS pointent vers Cloudflare)

---

## Architecture

```
src/
├── app/
│   ├── [locale]/           # Pages i18n (fr/en)
│   │   ├── page.tsx        # Accueil
│   │   ├── boutique/       # Liste des produits + pages slug
│   │   ├── packs-gratuits/ # Packs gratuits + pages slug
│   │   ├── compte/         # Espace personnel (page.tsx = Server Component)
│   │   ├── auth/           # Connexion, inscription, mot-de-passe-oublie, reset-password, callback
│   │   └── checkout/       # Succes / Annule
│   ├── admin/              # Panel admin (produits, commandes, utilisateurs)
│   ├── api/                # Routes API (Stripe webhook, contact, profile update, etc.)
│   └── layout.tsx          # Root layout
├── components/
│   ├── layout/             # Navbar, Footer, PromoBanner, CookieBanner
│   ├── shop/               # ProductCard, LicensePurchase, ProductMediaGallery, etc.
│   ├── compte/             # ProfileEditor (client), PurchasedProductCard, DownloadButton
│   ├── home/               # HeroSection, FeaturedProducts, HowItWorks, VideoIntro
│   └── ui/                 # shadcn/ui + AnimateIn, ParticlesBg, BeforeAfterSlider
├── emails/                 # Templates React Email
│   └── PurchaseConfirmationEmail.tsx  # Email confirmation achat (react-email)
├── lib/
│   ├── supabase/           # client.ts, server.ts, admin.ts
│   ├── email.ts            # Service d'envoi d'emails via Resend
│   ├── avatarConfig.ts     # Liste des 6 avatars predefinis
│   ├── productMediaConfig.ts # Videos/images/thumbnails/YouTube par produit (slug)
│   ├── freePacksConfig.ts  # Config des packs gratuits (nom FR/EN, desc FR/EN, thumbnail, video)
│   ├── promoConfig.ts      # Banniere promo (countdown)
│   ├── productChangelogs.ts # Changelogs par produit (items FR + items_en, date ISO)
│   ├── ratelimit.ts        # Rate limiting via Upstash Redis
│   ├── stripe.ts           # Client Stripe
│   └── env.ts              # Variables d'env typees
├── types/index.ts          # Types TS : Profile, Product, Purchase, Download, etc.
└── i18n/                   # routing.ts, navigation.ts, request.ts
```

---

## Base de donnees Supabase

### Tables principales
- **`profiles`** — `id, email, full_name, avatar_url (TEXT), role (customer|admin), created_at, updated_at`
- **`products`** — `id, slug, name_fr, name_en, description_fr, description_en, price_cents, is_free, is_published, stripe_price_id, thumbnail_url, preview_video_url, file_path, file_size_bytes, software_tags[], category, sort_order`
- **`purchases`** — `id, user_id, product_id, stripe_session_id, stripe_payment_intent, amount_paid_cents, currency, status (pending|completed|refunded)`
- **`free_claims`** — Packs gratuits recuperes par les utilisateurs
- **`product_likes`** — Likes sur les produits (user_id + product_id)
- **`downloads`** — Historique telechargements

### Migrations deja effectuees
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
```

---

## Fonctionnalites cles

### Authentification
- Supabase Auth (email/password)
- Reset password : formulaire `/auth/mot-de-passe-oublie` → email Supabase → callback `/auth/callback?type=recovery` → page `/auth/reset-password`
- **IMPORTANT** : le `redirectTo` dans `mot-de-passe-oublie/page.tsx` pointe directement vers `/${locale}/auth/reset-password` (URL propre, sans query params). Le `callback` n'est PAS utilise pour le reset password. La page `reset-password` echange elle-meme le code via `exchangeCodeForSession` cote client (via `useSearchParams`). Raison : le wildcard Supabase `https://justedit.store/**` ne matche pas les URLs avec query params, causant un fallback vers le Site URL (home page).
- Role admin : `profiles.role = 'admin'` → acces `/admin`
- Supabase URL Configuration → Redirect URLs : `https://justedit.store/**` (wildcard pour tous les sous-chemins)

### Emails (Resend + React Email)

#### Service d'envoi (`src/lib/email.ts`)
- Utilise **Resend** (`resend` package) pour envoyer des emails
- Adresse expediteur : `JustEdit <noreply@justedit.store>`
- Domaine verifie sur Resend : `justedit.store`
- Si `RESEND_API_KEY` absent, les emails sont ignores silencieusement (pas de crash)

#### Templates email
| Template | Fichier | Usage |
|---|---|---|
| Confirmation achat | `src/emails/PurchaseConfirmationEmail.tsx` | Envoye via Resend apres paiement Stripe (webhook) |
| Confirmation compte | `src/emails/account-confirmation-supabase.html` | Colle dans Supabase Dashboard → Auth → Email Templates → Confirm sign up |
| Reset password | `src/emails/reset-password-supabase.html` | Colle dans Supabase Dashboard → Auth → Email Templates → Reset Password |

#### Email de confirmation d'achat — Flux complet
1. Stripe webhook (`checkout.session.completed`) → `src/app/api/stripe/webhook/route.ts`
2. Le webhook recupere le product name + customer email depuis Supabase/Stripe
3. Appelle `sendPurchaseConfirmationEmail()` depuis `src/lib/email.ts` (non-bloquant)
4. Le template React Email est rendu et envoye via Resend

#### Templates Supabase (account-confirmation + reset-password)
- Ce sont des fichiers HTML bruts (pas React Email) car Supabase utilise son propre moteur de templates
- Variables Supabase disponibles : `{{ .ConfirmationURL }}`, `{{ .Token }}`, `{{ .TokenHash }}`, `{{ .SiteURL }}`, `{{ .Email }}`, `{{ .Data }}`, `{{ .RedirectTo }}`
- Le bouton utilise `href="{{ .ConfirmationURL }}"` pour le lien de confirmation/reset
- Design : fond noir #080808, container #0f0f0f, header avec logo image (`https://justedit.store/Logo.png`), bouton rouge #8b1a1a
- Pour modifier : editer les fichiers HTML dans `src/emails/` puis copier-coller le contenu dans Supabase Dashboard → Authentication → Email Templates

#### Previsualisation des templates React Email
```bash
npx react-email dev --dir src/emails
```
Ouvre `localhost:3000` avec un apercu en temps reel du template.

#### BIMI (logo dans les boites mail)
- `logo.svg` dans `public/` → accessible a `https://justedit.store/logo.svg`
- Enregistrement DNS BIMI sur Cloudflare : `default._bimi` TXT `v=BIMI1; l=https://justedit.store/logo.svg`
- Enregistrement DMARC deja en place : `_dmarc` TXT `v=DMARC1; p=quarantine; ...`
- Propagation : 24-48h pour que le logo apparaisse dans Gmail

### Paiement Stripe
- Stripe Checkout Session (mode `payment`)
- Webhook `/api/stripe/webhook` → event `checkout.session.completed` :
  1. Insere le purchase dans Supabase (upsert idempotent sur `stripe_session_id`)
  2. Envoie l'email de confirmation via Resend (non-bloquant)
- **Page succes** (`/checkout/succes`) : verifie le paiement directement via l'API Stripe (ne depend pas du webhook) et upsert le purchase immediatement → affiche le bouton telecharger
- Cles **test** dans `.env.local` (local uniquement) — **cles live** sur Vercel pour la production
- Pour passer en live : remplacer `sk_live_`, `pk_live_`, `whsec_live_` dans Vercel → redeployer
- Le webhook live doit pointer vers `https://justedit.store/api/stripe/webhook`
- Les cles live ne changent pas tant qu'elles ne sont pas revoquees

#### Test local avec Stripe CLI
1. Installer Stripe CLI : telecharger depuis [github.com/stripe/stripe-cli/releases](https://github.com/stripe/stripe-cli/releases)
2. L'exe est dans `C:\Users\mathi\Desktop\App\Stripe\stripe.exe` (pas dans le PATH)
3. Commandes :
```bash
C:\Users\mathi\Desktop\App\Stripe\stripe.exe login
C:\Users\mathi\Desktop\App\Stripe\stripe.exe listen --forward-to http://localhost:3001/api/stripe/webhook
```
4. Copier le `whsec_...` affiche et le mettre dans `.env.local` comme `STRIPE_WEBHOOK_SECRET`
5. Redemarrer `npm run dev`
6. Faire un achat test avec carte `4242 4242 4242 4242`
7. **IMPORTANT** : le port local est souvent `3001` car le port 3000 est pris

### i18n (next-intl)
- Locales : `fr` (defaut) et `en`
- **IMPORTANT** : `src/i18n/routing.ts` — le bloc `pathnames` a ete **supprime** (fix du language switcher)
  - Sans `pathnames`, toutes les URLs sont identiques entre FR et EN (`/fr/boutique/slug` et `/en/boutique/slug`)
  - Avec `pathnames`, `router.replace` ne resolvait pas les segments dynamiques sur la page produit → le switcher ne faisait rien
- Traductions dans `messages/fr.json` et `messages/en.json`
- Pour les textes conditionnels non stockes dans JSON (ex : contenu long cote boutique) : utiliser `locale === 'fr' ? '...' : '...'`

### Espace personnel (`/compte`)
- **`compte/page.tsx`** est un **Server Component** → jamais d'event handlers directs dedans
- **`ProfileEditor`** (client component) : bandeau horizontal avec avatar + nom + stats (membre depuis, nb packs)
- **`PurchasedProductCard`** (client component) : carte achat avec poster image + video on-hover
- **`ClaimedFreePackCard`** (client component) : carte free pack avec poster image + video on-hover
- Edition profil : picker parmi 6 avatars predefinis + nom d'affichage
- Avatars : `/public/images/avatars/avatar-1.png` a `avatar-6.png`
- Sauvegarde via `POST /api/profile/update` → dispatch `profile-updated` event → Navbar se met a jour
- Section "Packs Gratuits" + "Mes Achats" avec badges design rouge

### Pattern video on-hover (compte + boutique)
Utilise dans `PurchasedProductCard`, `ClaimedFreePackCard`, `FreePackCard` :
```tsx
// Poster image visible par defaut, disparait au hover
<Image className="... group-hover:opacity-0 transition-opacity" />
// Video invisible par defaut, apparait au hover et joue
<video ref={videoRef} preload="none" className="... opacity-0 group-hover:opacity-100" />
// handlers
onMouseEnter={() => videoRef.current?.play().catch(() => {})}
onMouseLeave={() => { videoRef.current?.pause(); videoRef.current.currentTime = 0; }}
```
- `preload="none"` → ne charge rien tant que l'utilisateur ne survole pas

### Navbar
- Desktop : logo | liens centres | langue | avatar mini + nom + "Espace personnel" (traduit)
- Mobile : `h-14` (reduit) | logo | avatar cliquable (→ /compte) | burger menu
- Menu mobile : avatar + nom + "Espace personnel" + deconnexion
- Hauteur : `h-14 md:h-20`
- Se re-fetch au `profile-updated` event

### Galerie produit (ProductMediaGallery)
- `preload="auto"`, `onCanPlay`, `currentTime = 1.5` pour afficher la frame a 1.5s
- Thumbnails statiques sur mobile (config dans `productMediaConfig.ts`)

### Bouton ACHETER (LicensePurchase)
- Gradient rouge anime, texte `ACHETER` en uppercase bold dans `<span>` (fix z-index)
- Overlay hover discret sans masquer le texte

### Changelogs produit (`productChangelogs.ts`)
- Format date : ISO string `'2026-03-01'` (pas de string en dur comme "Mars 2026")
- Champ `items_en` optionnel pour la version anglaise des entrees
- `ChangelogAccordion.tsx` formate la date avec `toLocaleDateString` selon la locale

### Animations (globals.css)
- `@keyframes cardPulse` → `.je-profile-card` (glow rouge sur le bandeau profil)
- `@keyframes pulseGlow` → `.profile-avatar-ring` (anneau rouge sur avatar)
- `.navbar-avatar-ring` → anneau rouge dans la navbar
- `ScrollRevealInit` + `AnimateIn` → apparition au scroll sur les pages

---

## Performance — ParticlesBg

`src/components/ui/ParticlesBg.tsx` a ete **majorement optimise** (session mars 2026) :
- Nombre de particules : 75 → **40 desktop / 25 mobile**
- `CONNECTION_DIST` : 130 → **110 desktop / 0 mobile** (supprime la boucle O(n2) sur mobile)
- **Cap a 30fps** : `frameRef.current ^= 1; if (frameRef.current) return;`
- Distance au carre (evite `Math.sqrt` dans la hot path)
- **Page Visibility API** : animation pausee quand l'onglet est en arriere-plan
- Curseur dot cache sur mobile
- Resultat : ~86% de reduction CPU desktop, ~100% sur mobile

---

## Produits existants

### Payants
- **Just Number** (slug: `just-number`) — pack de compteurs animes `.mogrt` — 16EUR (promo -36% depuis 25EUR)

### Gratuits
- **11 Backgrounds Animes** (slug: `11-backgrounds-animes`)
  - Thumbnail : `/public/images/thumbnails/11-backgrounds-animes/thumb-1.png`
  - Video preview : `/public/videos/video-11backgrounds-free.mp4`

---

## Configuration produit — comment ajouter du contenu

### Videos supplementaires
Fichier : `src/lib/productMediaConfig.ts`
```ts
PRODUCT_EXTRA_VIDEOS['slug'] = ['/videos/slug/video-2.mp4', ...]
PRODUCT_THUMBNAILS['slug'] = ['/images/thumbnails/slug/thumb-1.jpg', ...]
PRODUCT_YOUTUBE_VIDEOS['slug'] = 'YOUTUBE_VIDEO_ID'
```

### Packs gratuits
Fichier : `src/lib/freePacksConfig.ts`
```ts
{
  slug: 'mon-pack',
  name_fr: 'Mon Pack FR',
  name_en: 'My Pack EN',
  description_fr: '...',
  description_en: '...',
  videoThumbnail: '/images/thumbnails/mon-pack/thumb-1.png', // poster image
  videoUrl: '/videos/mon-pack/preview.mp4',                  // video hover
}
```

### Avatars predefinis
Fichier : `src/lib/avatarConfig.ts`
Ajouter l'image dans `/public/images/avatars/` et l'entree dans le tableau `AVATARS`.

---

## Traductions — cles importantes (en.json / fr.json)

Sections existantes : `nav`, `home`, `product`, `license`, `freePacks`, `account`, `boutique`, `auth`, `common`, `checkout`

Cles ajoutees lors de la session de traduction :
- `nav.personalSpace`
- `product.price`, `tutorialTitle`, `tutorialSubtitle`, `issuesTitle`, `issuesSubtitle`, `changelogTitle`
- `license.promoLabel`, `price`, `securePayment`
- `freePacks.backLink`, `freeBadge`, `alreadyClaimed`, `alreadyClaimedBefore`, `alreadyClaimedLink`, `alreadyClaimedAfter`, `contains`, `price`, `entirelyFree`, `freeAccount`, `directDownload`, `videoPreview`
- `account.freePacks`, `obtained`, `memberSince`, `packCount`, `editButton`, `cancelButton`, `displayName`, `namePlaceholder`, `saving`, `saveButton`, `updateSuccess`, `updateError`, `avatar`, `comingSoon`

---

## Design system (DA)

- **Fond** : noir profond `oklch(0.07_0_0)` / `#0a0a0a`
- **Rouge principal** : `#8b1a1a` (dark), `#c0392b` (hover), rouge vif pour boutons CTA
- **Texte** : blanc `#fff`, gris `oklch(0.65_0.005_0)`
- **Borders** : `oklch(0.18_0_0)` tres subtil
- **Badges sections** : fond `rgba(139,26,26,0.15)`, border `rgba(139,26,26,0.25)`, texte rouge `#e07070`
- Pas d'emojis dans le code. Pas de styled-jsx (utiliser `globals.css` pour les keyframes).
- **`<img>` au lieu de `<Image>`** pour les avatars (evite les problemes de z-index avec `fill`)
- **Emails** : meme DA — fond #080808, container #0f0f0f, border #1e1e1e, bouton rouge #8b1a1a, header avec logo

---

## Variables d'environnement

### `.env.local` (developpement local)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxx
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxx

# Stripe (TEST keys)
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx  # Remplacer par celui de Stripe CLI pour test local

# Resend (emails)
RESEND_API_KEY=re_xxx
CONTACT_EMAIL=justmathis.contact@gmail.com

# Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Vercel (production)
Toutes les memes variables mais avec :
- `STRIPE_SECRET_KEY` = `sk_live_xxx`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_xxx`
- `STRIPE_WEBHOOK_SECRET` = `whsec_xxx` (webhook live, pas CLI)
- `NEXT_PUBLIC_SITE_URL` = `https://justedit.store`

---

## Branche Git

- La branche `feat/security-hardening` est la branche de dev active (mars 2026)
- Les PRs sont mergees dans `master` depuis cette branche
- PRs mergees : #16 (security hardening), #17 (email + BIMI + fixes)
- Workflow : developper sur `feat/security-hardening` → PR vers `master` → merge → Vercel auto-deploy

---

## Securite — Audit complet (session mars 2026)

### Note de securite : 8.2/10

Un audit de securite complet a ete realise et corrige. Voici les details :

### Failles critiques corrigees
1. **Path Traversal** (`/api/media/[...path]/route.ts`) — Validation stricte des segments de chemin, verification que la resolution reste dans `public/`. Bloque `../`, segments vides, chemins absolus.
2. **Injection HTML** (`/api/contact/route.ts`) — Echappement HTML de tous les inputs (`<`, `>`, `&`, `"`, `'`), validation email par regex, limites de longueur (nom 100 chars, email 254, sujet 200, message 5000).
3. **Admin Auth renforce** — Middleware Supabase verifie le token JWT + le role admin dans la table profiles (pas juste la presence d'un cookie).
4. **Stripe Webhook** — Retourne 400 si metadata manquante (avant : ignorait silencieusement). Signature verifiee obligatoirement.
5. **Precision prix Stripe** — `Math.round()` ajoute pour eviter les erreurs de floating point sur `price_cents`.

### Rate Limiting (Upstash Redis)
- **Fichier** : `src/lib/ratelimit.ts`
- **Provider** : Upstash Redis (free tier) — `sincere-baboon-72031.upstash.io`
- **Limites** :
  - Contact : 3 requetes/heure
  - Download : 20 requetes/10 minutes
  - Free-claim : 10 requetes/heure
  - Profile update : 10 requetes/heure
- **Variables d'env requises** : `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- **Fallback** : si Redis non configure, le rate limiting est desactive (pas de crash)

### Headers de securite (`next.config.ts`)
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; ...
```

### SEO ajoute
- **`src/app/sitemap.ts`** — Generation dynamique de toutes les routes (statiques + produits + packs gratuits), en FR et EN
- **`src/app/robots.ts`** — Bloque `/admin/`, `/api/`, `/auth/` pour les crawlers
- **OpenGraph metadata** — Pages produits avec `og:image`, `og:url`, `twitter:card`
- **Hreflang alternates** — FR/EN sur le layout principal

### Accessibilite ajoutee
- `aria-expanded`, `aria-controls`, `aria-label` sur le menu burger Navbar
- `aria-label` sur les boutons de navigation de la galerie produit
- Page 404 personnalisee : `src/app/[locale]/not-found.tsx`

### Pages admin ajoutees
- `src/app/admin/commandes/page.tsx` — Liste des commandes avec statut
- `src/app/admin/utilisateurs/page.tsx` — Liste des utilisateurs avec roles

### Validation d'environnement
- **`src/lib/env.ts`** — Verifie que toutes les variables d'env requises sont presentes au demarrage

### Couverture OWASP Top 10
| Categorie | Statut |
|---|---|
| Broken Access Control | OK Middleware + RLS Supabase |
| Cryptographic Failures | OK Supabase/Stripe gerent le chiffrement |
| Injection | OK Requetes parametrees, inputs echappes |
| Insecure Design | OK Rate limiting actif |
| Security Misconfiguration | OK Env vars validees, headers configures |
| Vulnerable Components | OK Dependencies a jour |
| Authentication Failures | OK Supabase auth robuste |
| Data Integrity Failures | OK Stripe webhook signe |
| Logging & Monitoring | Logs basiques (pas de Sentry) |
| SSRF | OK Pas de requetes externes dangereuses |

---

## DNS (Cloudflare) — Enregistrements configures

| Type | Name | Content | Proxy |
|---|---|---|---|
| A | justedit.store | 76.76.21.21 (Vercel) | Proxied |
| CNAME | www | cname.vercel-dns.com | Proxied |
| R2 | assets.justedit.store | justedit-assets | Proxied |
| MX | send | feedback-smtp.eu-west... (Resend) | DNS only |
| TXT | _dmarc | v=DMARC1; p=quarantine; ... | DNS only |
| TXT | resend._domainkey | DKIM key pour Resend | DNS only |
| TXT | send | v=spf1 include:amazonses... (SPF) | DNS only |
| TXT | default._bimi | v=BIMI1; l=https://justedit.store/logo.svg | DNS only |

---

## Points d'attention

1. **Server Components** : `compte/page.tsx` est un Server Component → pas d'event handlers directs, pas de styled-jsx. Creer un Client Component dedie si besoin d'interactivite (ex : `PurchasedProductCard`).
2. **Variables d'env** : `.env.local` requis (Supabase URL/keys, Stripe TEST keys, Resend API key, **Upstash Redis URL/token**). Les cles Stripe Live sont sur Vercel uniquement.
3. **Admin** : acces via `/admin` uniquement si `profile.role === 'admin'` — verifie au niveau middleware (pas juste cookie)
4. **Cache navigateur** : si un fichier statique (avatar, video) ne s'affiche pas → Ctrl+Shift+R
5. **`profile-updated` event** : dispatche par `ProfileEditor` apres sauvegarde → Navbar ecoute et re-fetch le profil
6. **Language switcher** : fonctionne car `pathnames` est absent de `routing.ts`. Ne pas le rajouter.
7. **Import `Package`** : icone lucide-react utilisee dans `compte/page.tsx` — verifier qu'elle est importee si on modifie ce fichier (erreur de build Vercel passee a cause de ca).
8. **Rate limiting** : necessite `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN` dans `.env.local`. Sans ces vars, le rate limiting est desactive silencieusement.
9. **Security headers** : configures dans `next.config.ts` via la propriete `headers()`. Ne pas supprimer.
10. **Path traversal** : la route `/api/media/[...path]` valide chaque segment de chemin. Ne pas simplifier cette validation.
11. **Password reset flow** : `mot-de-passe-oublie` → `redirectTo` avec `?type=recovery` → callback detecte `type=recovery` → redirige vers `/auth/reset-password`. Ne pas utiliser `?next=...` (Supabase strip les query params complexes).
12. **Stripe webhook secret** : en local, utiliser le `whsec_...` genere par Stripe CLI (`stripe listen`). En prod, utiliser celui configure dans le dashboard Stripe.
13. **Port local** : `npm run dev` utilise souvent le port **3001** car le port 3000 est pris. Verifier dans le terminal.
14. **Emails Supabase** : les templates HTML sont dans `src/emails/*.html` mais doivent etre copies manuellement dans Supabase Dashboard → Auth → Email Templates.

---

## Taches en attente / TODO prochaine session

- [ ] **Tester le flux d'achat complet** avec Stripe CLI en local (email + download + page succes)
- [ ] **Redesign boutique** (voir section "Plan boutique" ci-dessous) — non code.
- [ ] **HeroSection background** — forme artistique SVG (voir section "Experimentations design") — non finalise.
- [ ] **Integrer Sentry** pour monitoring/logging en production (actuellement logs basiques seulement)
- [ ] **Ajouter CAPTCHA** (hCaptcha ou reCAPTCHA v3) sur inscription/login si risque de brute force
- [ ] **Verifier BIMI** — le logo devrait apparaitre dans Gmail apres propagation DNS (24-48h depuis le 20 mars 2026)

---

## Experimentations design (testees puis revertees)

### Background HeroSection — session 2025-03-20
Deux concepts ont ete testes sur `src/components/home/HeroSection.tsx` puis revertes avec `git checkout` :
- **"Volcanic Editorial"** : fond plus eclaire, sweep diagonal bordeaux→ember, grain texture visible, multiple radial gradients. Rendu pas concluant.
- **Forme artistique SVG** : grand systeme orbital (anneaux concentriques, arcs d'accent bordeaux→ember, crosshairs, dots, rotation lente 90s). Concept non finalise, revert demande.

**A retenir** : Mathis veut une forme artistique **grosse et visible** sur le background, hyper creative. Le concept orbital etait dans la bonne direction mais n'a pas ete finalise. Composants concernes : `HeroSection.tsx`.

---

## Plan boutique — a implementer (non code)

Vision discutee pour la page boutique (`src/app/[locale]/boutique/page.tsx`) :
- **Volume cible** : 20+ produits a terme (MOGRTs, templates, presets)
- **Priorite visuelle** : thumbnails en grand + titre produit + quelques infos
- **Layout** : grid propre, 3 colonnes desktop, 1 **featured card** (plus grande) pour le produit mis en avant / nouveau / promo
- **Animation cards** : leger zoom thumbnail + elevation (shadow bordeaux) au hover — simple, pas d'overload
- **Filtres** : barre de filtres a preparer (par logiciel, type, prix) mais inactive dans un premier temps
- **ProductCard redesign** : numerotation `01/02`, tags colores bordeaux, prix imposant, separateur visuel
- **Header boutique** : plus editorial (grand titre + ligne separatrice bordeaux + compteur de produits)
