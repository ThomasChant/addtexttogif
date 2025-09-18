import type {Metadata} from 'next';
import {createTranslator, getTranslations} from 'next-intl/server';
import {GifEditor} from '../../components/editor/gif-editor';
import {Button} from '../../components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../../components/ui/card';
import {Link} from '../../i18n/routing';
import {buildCanonicalUrl, buildLanguageAlternates, getMetadataBase, parseKeywords} from '../../lib/seo';

const featureKeys = ['split', 'timeline', 'drag', 'templates'] as const;
const workflowKeys = ['upload', 'overlay', 'review', 'export'] as const;

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
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description
    }
  };
}

export default async function HomePage({params}: {params: {locale: string}}) {
  const {locale} = params;
  const t = await getTranslations({locale, namespace: 'Home'});
  const seo = await getTranslations({locale, namespace: 'SEO.home'});

  return (
    <div className="space-y-16 pb-16">
      <section className="bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container mx-auto flex flex-col gap-6 px-4 py-20 text-center lg:max-w-4xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{seo('h1')}</h1>
          <p className="text-lg text-muted-foreground sm:text-xl">{t('heroSubtitle')}</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="#editor">{t('heroPrimaryCta')}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/tutorial">{t('heroSecondaryCta')}</Link>
            </Button>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-muted-foreground sm:text-3xl">
            {seo('h2')}
          </h2>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="grid gap-10 lg:grid-cols-[2fr,3fr] lg:items-center">
          <div className="space-y-4 text-left">
            <p className="text-sm uppercase tracking-wide text-primary/80">{t('featureSubtitle')}</p>
            <h3 className="text-3xl font-semibold tracking-tight">{t('featureTitle')}</h3>
            <p className="text-base text-muted-foreground">
              {t('heroSubtitle')}
            </p>
          </div>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>{t('workflowTitle')}</CardTitle>
              <CardDescription>{t('workflowSubtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="grid gap-6 sm:grid-cols-2">
                {workflowKeys.map((key) => (
                  <li key={key} className="space-y-2 rounded-lg border p-4">
                    <h4 className="text-lg font-semibold">{t(`workflow.${key}.title`)}</h4>
                    <p className="text-sm text-muted-foreground">{t(`workflow.${key}.description`)}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-4" aria-labelledby="features-heading">
        <div className="mx-auto max-w-3xl text-center">
          <h3 id="features-heading" className="text-3xl font-semibold tracking-tight">
            {t('featureTitle')}
          </h3>
          <p className="mt-3 text-base text-muted-foreground">{t('featureSubtitle')}</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {featureKeys.map((key) => (
            <Card key={key} className="h-full border-primary/20">
              <CardHeader>
                <CardTitle>{t(`features.${key}.title`)}</CardTitle>
                <CardDescription>{t(`features.${key}.description`)}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4" id="editor">
        <div className="mx-auto max-w-3xl text-center">
          <h3 className="text-3xl font-semibold tracking-tight">{t('heroTitle')}</h3>
          <p className="mt-3 text-base text-muted-foreground">{t('heroSubtitle')}</p>
        </div>
        <div className="mt-8">
          <GifEditor id="gif-editor" />
        </div>
      </section>

      <section className="container mx-auto px-4" aria-labelledby="faq-preview">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-muted/20 p-8 text-center">
          <h3 id="faq-preview" className="text-3xl font-semibold tracking-tight">
            {t('faqPreviewTitle')}
          </h3>
          <p className="mt-3 text-base text-muted-foreground">{t('faqPreviewSubtitle')}</p>
          <div className="mt-6 flex justify-center">
            <Button asChild>
              <Link href="/faq">{t('faqPreviewCta')}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
