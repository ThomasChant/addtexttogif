import type {Metadata} from 'next';
import {createTranslator, getTranslations} from 'next-intl/server';
import {Button} from '../../../../components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '../../../../components/ui/card';
import {Link} from '../../../../i18n/routing';
import {buildCanonicalUrl, buildLanguageAlternates, getMetadataBase, parseKeywords} from '../../../../lib/seo';

const faqKeys = ['files', 'privacy', 'fonts', 'licensing', 'support'] as const;

export async function generateMetadata({
  params
}: {
  params: {locale: string};
}): Promise<Metadata> {
  const {locale} = params;
  const messages = (await import(`../../../../messages/${locale}.json`)).default;
  const t = createTranslator({locale, messages});
  const seo = t.raw('SEO.faq') as {
    title: string;
    description: string;
    keywords: string | string[];
    canonical: string;
  };
  const siteName = t('SEO.siteName');
  const canonicalUrl = buildCanonicalUrl(locale, seo.canonical);

  return {
    metadataBase: getMetadataBase(),
    title: seo.title,
    description: seo.description,
    keywords: parseKeywords(seo.keywords),
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
      type: 'article'
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description
    }
  };
}

export default async function FaqPage({params}: {params: {locale: string}}) {
  const {locale} = params;
  const t = await getTranslations({locale, namespace: 'FAQ'});
  const seo = await getTranslations({locale, namespace: 'SEO.faq'});
  const navigation = await getTranslations({locale, namespace: 'Navigation'});
  const home = await getTranslations({locale, namespace: 'Home'});

  return (
    <div className="space-y-16 pb-16">
      <section className="bg-primary/5">
        <div className="container mx-auto flex flex-col gap-6 px-4 py-16 text-center lg:max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{seo('h1')}</h1>
          <p className="text-lg text-muted-foreground">{t('intro')}</p>
          <h2 className="text-2xl font-semibold text-muted-foreground">{seo('h2')}</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild>
              <Link href="/">{navigation('home')}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/tutorial">{navigation('tutorial')}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4" aria-labelledby="faq-list">
        <div className="mx-auto max-w-3xl text-center">
          <h3 id="faq-list" className="text-3xl font-semibold tracking-tight">
            {t('title')}
          </h3>
          <p className="mt-3 text-base text-muted-foreground">{t('intro')}</p>
        </div>
        <div className="mx-auto mt-10 max-w-3xl space-y-4">
          {faqKeys.map((key) => (
            <details
              key={key}
              id={key}
              className="group rounded-2xl border bg-background p-4 transition-colors open:border-primary/40"
            >
              <summary className="cursor-pointer list-none text-left text-lg font-semibold marker:hidden">
                <span className="flex items-center justify-between gap-4">
                  {t(`items.${key}.question`)}
                  <span className="text-base text-primary/70 transition-transform group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-base text-muted-foreground">{t(`items.${key}.answer`)}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="h-full border-primary/20" id="privacy">
            <CardHeader>
              <CardTitle>{t('items.privacy.question')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base text-muted-foreground">{t('items.privacy.answer')}</p>
            </CardContent>
          </Card>
          <Card className="h-full border-primary/20" id="licensing">
            <CardHeader>
              <CardTitle>{t('items.licensing.question')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base text-muted-foreground">{t('items.licensing.answer')}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="rounded-2xl border bg-muted/30 p-8 text-center">
          <p className="text-lg text-muted-foreground">
            {home('faqPreviewSubtitle')}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/">{navigation('home')}</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/#editor">{home('heroPrimaryCta')}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
