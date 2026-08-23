// i18next exporte à la fois un default et des named exports (`use`, ...) sur
// le même objet — eslint-plugin-import-x signale ça comme ambigu alors que
// c'est la forme d'import documentée par i18next lui-même.
// eslint-disable-next-line import-x/no-named-as-default
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import commonEn from './en/common.json';
import commonFr from './fr/common.json';

// Ressources bundlées de façon synchrone (pas de http-backend) : la promesse
// resolue par `.init()` n'a rien à attendre, on l'ignore explicitement.
// eslint-disable-next-line import-x/no-named-as-default-member -- même quirk d'export que ci-dessus, appliqué à l'appel `.use()`
void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: commonEn },
      fr: { common: commonFr },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr'],
    load: 'languageOnly',
    ns: ['common'],
    defaultNS: 'common',
    detection: {
      // Pas de segment d'URL (/en, /fr) : préférence sauvegardée en premier,
      // sinon langue du navigateur. L'override "compte utilisateur" (plus
      // tard) passera par un appel explicite à i18n.changeLanguage() depuis
      // AuthProvider, qui se re-persiste automatiquement en localStorage.
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
