import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/boutique': {
      fr: '/boutique',
      en: '/shop',
    },
    '/boutique/[slug]': {
      fr: '/boutique/[slug]',
      en: '/shop/[slug]',
    },
    '/auth/connexion': {
      fr: '/auth/connexion',
      en: '/auth/login',
    },
    '/auth/inscription': {
      fr: '/auth/inscription',
      en: '/auth/register',
    },
    '/auth/mot-de-passe-oublie': {
      fr: '/auth/mot-de-passe-oublie',
      en: '/auth/forgot-password',
    },
    '/auth/reset-password': '/auth/reset-password',
    '/compte': {
      fr: '/compte',
      en: '/account',
    },
    '/packs-gratuits': {
      fr: '/packs-gratuits',
      en: '/free-packs',
    },
    '/faq': '/faq',
    '/contact': '/contact',
    '/mentions-legales': {
      fr: '/mentions-legales',
      en: '/legal-notice',
    },
    '/conditions-generales-de-vente': {
      fr: '/conditions-generales-de-vente',
      en: '/terms-of-sale',
    },
    '/politique-de-confidentialite': {
      fr: '/politique-de-confidentialite',
      en: '/privacy-policy',
    },
  },
});
