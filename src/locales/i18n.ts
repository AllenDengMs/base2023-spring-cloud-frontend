import type { App } from 'vue';
import { createI18n } from 'vue-i18n';
import { localStg } from '@/utils';
import messages from './lang';
import type { LocaleKey } from './lang';

const i18n = createI18n({
  locale: localStg.get('lang') || 'zh-CN',
  fallbackLocale: 'en-US',
  messages,
  legacy: false
});

export function setupI18n(app: App) {
  app.use(i18n);
}

export function t(key: string) {
  return i18n.global.t(key);
}

export function setLocale(locale: LocaleKey) {
  i18n.global.locale.value = locale;
}
