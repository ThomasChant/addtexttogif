import type {Config} from 'tailwindcss';
import {fontFamily} from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans]
      },
      keyframes: {
        'fade-in': {
          from: {opacity: '0'},
          to: {opacity: '1'}
        },
        'accordion-down': {
          from: {height: '0px'},
          to: {height: 'var(--radix-accordion-content-height)'}
        },
        'accordion-up': {
          from: {height: 'var(--radix-accordion-content-height)'},
          to: {height: '0px'}
        }
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-in-out',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: []
};

export default config;
