'use client';

import {useTransition} from 'react';
import {useParams} from 'next/navigation';
import {locales, usePathname, useRouter} from '../i18n/routing';
import {Button} from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu';

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
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();
  const activeLocale = params?.locale?.toString() || 'en';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="min-w-[5.5rem]">
          {localeLabels[activeLocale] ?? activeLocale}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onSelect={() =>
              startTransition(() => {
                router.replace(pathname, {locale});
              })
            }
            className={
              locale === activeLocale ? 'font-semibold text-primary focus:bg-muted' : undefined
            }
          >
            {localeLabels[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
