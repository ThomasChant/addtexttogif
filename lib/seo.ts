import {locales} from '../i18n/routing';

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://addtexttogif.com';
const metadataBase = new URL(rawSiteUrl);

export function getMetadataBase() {
  return metadataBase;
}

export function buildCanonicalUrl(locale: string, canonicalPath: string) {
  const normalizedPath = canonicalPath === '/' ? '' : canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
  return new URL(`/${locale}${normalizedPath}`, metadataBase);
}

export function buildLanguageAlternates(canonicalPath: string) {
  return Object.fromEntries(
    locales.map((locale) => [locale, buildCanonicalUrl(locale, canonicalPath).toString()])
  );
}

export function parseKeywords(value: string | string[]) {
  if (Array.isArray(value)) {
    return value;
  }
  return value
    .split(',')
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}
