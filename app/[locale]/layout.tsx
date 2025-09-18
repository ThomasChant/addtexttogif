import type {Metadata} from 'next';
import type {ReactNode} from 'react';
import {NextIntlClientProvider} from 'next-intl';
import {createTranslator, getMessages} from 'next-intl/server';
import {SiteFooter} from '../../components/site-footer';
import {SiteHeader} from '../../components/site-header';
import {ThemeProvider} from '../../components/theme-provider';
import {buildCanonicalUrl, buildLanguageAlternates, getMetadataBase, parseKeywords} from '../../lib/seo';
import {locales} from '../../i18n/routing';
import '../globals.css';

const robots = {
  index: true,
  follow: true
};

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export async function generateMetadata({
  params
}: {
  params: {locale: string};
}): Promise<Metadata> {
  const {locale} = params;
  const messages = (await import(`../../messages/${locale}.json`)).default;
  const t = createTranslator({locale, messages});
  const seo = t.raw('SEO.home') as {
    title: string;
    description: string;
    keywords: string | string[];
    canonical: string;
  };
  const siteName = t('SEO.siteName');
  const canonicalUrl = buildCanonicalUrl(locale, seo.canonical);

  return {
    metadataBase: getMetadataBase(),
    title: {
      default: seo.title,
      template: `%s | ${siteName}`
    },
    description: seo.description,
    keywords: parseKeywords(seo.keywords),
    robots,
    alternates: {
      canonical: canonicalUrl,
      languages: buildLanguageAlternates(seo.canonical)
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: canonicalUrl,
      siteName,
      locale,
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description
    }
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: {locale: string};
}) {
  const messages = await getMessages();

  return (
    <html lang={params.locale} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <NextIntlClientProvider locale={params.locale} messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div className="flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
