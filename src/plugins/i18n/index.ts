import { createI18n } from 'vue-i18n';
import en from '@/plugins/translations/en.json';
import sk from '@/plugins/translations/sk.json';

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('preferred_locale') || 'sk',
  fallbackLocale: 'en',
  messages: { en, sk },
});

export default i18n;
