'use client';

import {Menu} from 'lucide-react';
import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link, usePathname} from '../i18n/routing';
import {LanguageSwitcher} from './language-switcher';
import {ThemeToggle} from './theme-toggle';
import {Button} from './ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from './ui/sheet';
import {cn} from '../lib/utils';

const navItems = ['home', 'tutorial', 'faq'] as const;

export function SiteHeader() {
  const t = useTranslations('Navigation');
  const [open, setOpen] = useState(false);

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
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 sm:w-80">
              <SheetHeader>
                <SheetTitle>{t('menuTitle')}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 flex flex-col space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item}
                    href={item === 'home' ? '/' : `/${item}`}
                    className="text-base font-medium"
                    onClick={() => setOpen(false)}
                    prefetch
                  >
                    {t(item)}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
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
