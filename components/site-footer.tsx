import {useTranslations} from 'next-intl';
import {Link} from '../i18n/routing';

export function SiteFooter() {
  const t = useTranslations('Footer');

  return (
    <footer className="border-t bg-muted/40 py-10">
      <div className="container mx-auto grid gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 className="text-lg font-semibold">AddTextToGIF</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t('tagline')}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t('productTitle')}
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:underline" prefetch>
                {t('links.home')}
              </Link>
            </li>
            <li>
              <Link href="/tutorial" className="hover:underline" prefetch>
                {t('links.tutorial')}
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:underline" prefetch>
                {t('links.faq')}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t('resourcesTitle')}
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="#editor" className="hover:underline">
                {t('links.editor')}
              </Link>
            </li>
            <li>
              <Link href="/tutorial#workflow" className="hover:underline" prefetch>
                {t('links.workflow')}
              </Link>
            </li>
            <li>
              <Link href="/faq#licensing" className="hover:underline" prefetch>
                {t('links.licensing')}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t('openSourceTitle')}
          </h3>
          <p className="mt-3 text-sm text-muted-foreground">
            {t.rich('openSourceDescription', {
              repo: (chunks) => (
                <Link href="https://github.com/sanidhya711/text-on-gif" className="hover:underline" target="_blank">
                  {chunks}
                </Link>
              )
            })}
          </p>
        </div>
      </div>
      <div className="container mx-auto mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 text-sm text-muted-foreground md:flex-row">
        <p>© {new Date().getFullYear()} AddTextToGIF. {t('rights')}</p>
        <div className="flex gap-4">
          <Link href="/faq#privacy" className="hover:underline" prefetch>
            {t('links.privacy')}
          </Link>
          <Link href="/faq#support" className="hover:underline" prefetch>
            {t('links.support')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
