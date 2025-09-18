import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {locales} from './routing';

type Locale = (typeof locales)[number];

const messagesImports: Record<Locale, () => Promise<any>> = {
  en: () => import('../messages/en.json'),
  zh: () => import('../messages/zh.json'),
  de: () => import('../messages/de.json'),
  fr: () => import('../messages/fr.json'),
  ru: () => import('../messages/ru.json'),
  hi: () => import('../messages/hi.json'),
  fil: () => import('../messages/fil.json'),
  ja: () => import('../messages/ja.json'),
  ko: () => import('../messages/ko.json')
};

export default getRequestConfig(async ({locale}) => {
  const typedLocale = locale as Locale;
  if (!messagesImports[typedLocale]) {
    notFound();
  }

  const messages = await messagesImports[typedLocale]();

  return {
    messages: messages.default
  };
});
