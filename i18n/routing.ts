import {createSharedPathnamesNavigation} from 'next-intl/navigation';

export const locales = ['en', 'zh', 'de', 'fr', 'ru', 'hi', 'fil', 'ja', 'ko'] as const;
export const defaultLocale = 'en';
export const localePrefix = 'always';

export const {Link, redirect, usePathname, useRouter} = createSharedPathnamesNavigation({
  locales,
  localePrefix
});
