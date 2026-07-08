import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import alerts from './locales/es/alerts.json';
import app from './locales/es/app.json';
import auth from './locales/es/auth.json';
import cattle from './locales/es/cattle.json';
import common from './locales/es/common.json';
import dashboard from './locales/es/dashboard.json';
import userManagement from './locales/es/userManagement.json';

export const defaultNamespace = 'common';

export const namespaces = ['common', 'auth', 'dashboard', 'cattle', 'alerts', 'userManagement', 'app'] as const;

void i18next.use(initReactI18next).init({
  lng: 'es',
  fallbackLng: 'es',
  defaultNS: defaultNamespace,
  ns: namespaces,
  resources: {
    es: { common, auth, dashboard, cattle, alerts, userManagement, app }
  },
  interpolation: { escapeValue: false },
  returnEmptyString: false
});

export { i18next };
