/**
 * Design System Tokens – barrel file
 * Re-exports all token categories for unified access.
 */

// Re-export token categories from dedicated files
export { spacing } from './spacing';
export { radius } from './radius';
export { elevation } from './elevation';
export { motion } from './motion';
export { colorPalette } from './colorPalette';
export { gradients } from './gradients';

// Typography – kept inline for convenience (font families, sizes, etc.)
export const typography = {
  fontFamily: {
    sans: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(', '),
    mono: [
      '"SF Mono"',
      'Monaco',
      '"Cascadia Code"',
      'Consolas',
      '"Courier New"',
      'monospace',
    ].join(', '),
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
    '8xl': '6rem',
    '9xl': '7.5rem',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;
export type Typography = typeof typography;

// Aggregate all tokens into a single object for backward compatibility
export const designTokens = {
  ...spacing,
  ...radius,
  ...elevation,
  ...motion,
  ...colorPalette,
  ...gradients,
  typography,
} as const;
export type DesignTokens = typeof designTokens;
