import { createI18n } from 'vue-i18n';

function loadLocaleMessages() {
  const locales = import.meta.glob('../locales/*.json', { eager: true });
  const messages = {};
  Object.keys(locales).forEach((key) => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i);
    if (matched && matched.length > 1) {
      const locale = matched[1];
      messages[locale] = locales[key].default || locales[key];
    }
  });
  return messages;
}

const i18n = createI18n({
  legacy: true, // Set to true to support Options API (this.$i18n, this.$t)
  globalInjection: true,
  locale: localStorage.getItem('language') || 'ar', // Default to Arabic (RTL)
  fallbackLocale: 'ar',
  messages: loadLocaleMessages(),
});

export default i18n;
