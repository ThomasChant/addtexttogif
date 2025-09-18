'use client';

import {ChangeEvent, useTransition} from 'react';
import {useParams} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {locales, usePathname, useRouter} from '../i18n/routing';
import {cn} from '../lib/utils';

const localeLabels: Record<string, string> = {
  en: 'English',
  zh: '中文',
  de: 'Deutsch',
  fr: 'Français',
  ru: 'Русский',
  hi: 'हिन्दी',
  fil: 'Filipino',
  ja: '日本語',
  ko: '한국어'
};

export function LanguageSwitcher() {
  const t = useTranslations('Navigation');
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();
  const activeLocale = params?.locale?.toString() || 'en';

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const locale = event.target.value;
    startTransition(() => {
      router.replace(pathname, {locale});
    });
  };

  return (
    <div className="relative">
      <label className="sr-only" htmlFor="language-switcher">
        {t('languageLabel')}
      </label>
      <select
        id="language-switcher"
        value={activeLocale}
        disabled={isPending}
        onChange={handleChange}
        className={cn(
          'h-9 min-w-[5.5rem] rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-ring',
          isPending && 'opacity-70'
        )}
        aria-label={t('languageLabel')}
      >
        {locales.map((locale) => (
          <option key={locale} value={locale}>
            {localeLabels[locale]}
          </option>
        ))}
      </select>
    </div>
  );
}
