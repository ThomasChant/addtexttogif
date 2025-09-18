import {OverlayTemplate} from './editor-types';

export const overlayTemplates: OverlayTemplate[] = [
  {
    id: 'classic',
    name: 'Classic Caption',
    description: 'Bold white text with shadow, perfect for meme-style captions.',
    fontFamily: 'Impact, Haettenschweiler, "Arial Black", sans-serif',
    fontSize: 36,
    fontWeight: 700,
    color: '#ffffff',
    backgroundColor: 'rgba(0,0,0,0.55)',
    padding: 16,
    borderRadius: 4,
    shadow: '0 2px 12px rgba(0,0,0,0.6)'
  },
  {
    id: 'subtitle',
    name: 'Subtitle',
    description: 'Subtle white subtitle inspired by streaming platforms.',
    fontFamily: '"Noto Sans", "Helvetica Neue", Arial, sans-serif',
    fontSize: 24,
    color: '#f9fafb',
    backgroundColor: 'rgba(17,24,39,0.75)',
    padding: 12,
    borderRadius: 8,
    shadow: '0 1px 6px rgba(15,23,42,0.45)'
  },
  {
    id: 'highlight',
    name: 'Highlighted',
    description: 'Vibrant gradient bar that grabs attention in promotional GIFs.',
    fontFamily: '"Poppins", "Segoe UI", sans-serif',
    fontSize: 28,
    fontWeight: 600,
    color: '#111827',
    backgroundColor: 'rgba(236,72,153,0.9)',
    padding: 14,
    borderRadius: 9999,
    shadow: '0 4px 20px rgba(236,72,153,0.35)'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean typography with light background suited for tutorials.',
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    fontSize: 22,
    color: '#111827',
    backgroundColor: 'rgba(255,255,255,0.82)',
    padding: 10,
    borderRadius: 12,
    shadow: '0 10px 40px rgba(15,23,42,0.18)'
  }
];

export function getTemplate(id: string) {
  return overlayTemplates.find((template) => template.id === id) ?? overlayTemplates[0];
}
