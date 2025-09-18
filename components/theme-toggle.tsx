'use client';

import {MoonStar, Sun} from 'lucide-react';
import {useTheme} from 'next-themes';
import {useEffect, useState} from 'react';
import {Button} from './ui/button';

export function ThemeToggle() {
  const {setTheme, theme} = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="Toggle theme" className="h-9 w-9" disabled>
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={theme === 'dark' ? 'Activate light mode' : 'Activate dark mode'}
      className="h-9 w-9"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? <MoonStar className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  );
}
