'use client';

import {Menu, X} from 'lucide-react';
import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link, usePathname} from '../i18n/routing';
import {LanguageSwitcher} from './language-switcher';
import {ThemeToggle} from './theme-toggle';
import {Button} from './ui/button';
import {cn} from '../lib/utils';

const navItems = ['home', 'tutorial', 'faq'] as const;

export function SiteHeader() {
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2" prefetch>
          <span className="text-lg font-semibold">AddTextToGIF</span>
        </Link>
        <nav className="hidden items-center space-x-6 md:flex">
          {navItems.map((item) => (
            <NavLink key={item} href={item === 'home' ? '/' : `/${item}`} label={t(item)} />
          ))}
        </nav>
        <div className="flex items-center space-x-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={t('menuTitle')}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {open ? (
        <div className="md:hidden">
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40"
            aria-label={t('menuTitle')}
            onClick={() => setOpen(false)}
          />
          <div
            id="mobile-navigation"
            className="fixed right-0 top-16 z-50 w-64 space-y-3 rounded-l-2xl border border-r-0 bg-background p-6 shadow-xl sm:w-80"
          >
            <p className="text-sm font-semibold text-muted-foreground">{t('menuTitle')}</p>
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item}
                  href={item === 'home' ? '/' : `/${item}`}
                  className="text-base font-medium"
                  prefetch
                >
                  {t(item)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

interface NavLinkProps {
  href: string;
  label: string;
}

function NavLink({href, label}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname === `${href}/`;

  return (
    <Link
      href={href}
      className={cn(
        'text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
        isActive && 'text-foreground'
      )}
      prefetch
    >
      {label}
    </Link>
  );
}
