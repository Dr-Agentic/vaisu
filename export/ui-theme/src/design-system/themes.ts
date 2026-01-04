/**
 * Theme System
 * 
 * Semantic color tokens mapped to light and dark themes.
 * Uses CSS custom properties for runtime theme switching.
 */

import { colorPalette } from './colorPalette';

/**
 * Light Theme
 * High contrast, optimized for readability
 */
export const lightTheme = {
  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#FAFAFA',
    tertiary: '#F5F5F5',
    inverse: '#171717',
  },
  // Surface Colors (Cards, Panels, etc.)
  surface: {
    base: '#FFFFFF',
    elevated: '#FFFFFF',
    overlay: 'rgba(255, 255, 255, 0.95)',
    inverse: '#171717',
  },
  // Text Colors
  text: {
    primary: '#171717',
    secondary: '#525252',
    tertiary: '#737373',
    disabled: '#A3A3A3',
    inverse: '#FFFFFF',
    link: colorPalette.primary[600],
    linkHover: colorPalette.primary[700],
  },
  // Border Colors
  border: {
    subtle: '#E5E5E5',
    base: '#D4D4D4',
    strong: '#A3A3A3',
    focus: colorPalette.primary[500],
    error: colorPalette.error[500],
  },
  // Interactive Colors
  interactive: {
    primary: {
      base: colorPalette.primary[600],
      hover: colorPalette.primary[700],
      active: colorPalette.primary[800],
      disabled: colorPalette.neutral[300],
    },
    secondary: {
      base: colorPalette.secondary[600],
      hover: colorPalette.secondary[700],
      active: colorPalette.secondary[800],
      disabled: colorPalette.neutral[300],
    },
    accent: {
      base: colorPalette.accent[500],
      hover: colorPalette.accent[600],
      active: colorPalette.accent[600],
      disabled: colorPalette.neutral[300],
    },
  },
  // Semantic Colors
  semantic: {
    success: {
      base: colorPalette.success[500],
      background: colorPalette.success[50],
      border: colorPalette.success[200],
      text: colorPalette.success[700],
    },
    error: {
      base: colorPalette.error[500],
      background: colorPalette.error[50],
      border: colorPalette.error[200],
      text: colorPalette.error[700],
    },
    warning: {
      base: colorPalette.warning[500],
      background: colorPalette.warning[50],
      border: colorPalette.warning[200],
      text: colorPalette.warning[700],
    },
    info: {
      base: colorPalette.info[500],
      background: colorPalette.info[50],
      border: colorPalette.info[200],
      text: colorPalette.info[700],
    },
  },
} as const;

/**
 * Dark Theme
 * Optimized for low-light environments, maintains contrast ratios
 */
export const darkTheme = {
  // Background Colors
  background: {
    primary: '#0A0A0A',
    secondary: '#171717',
    tertiary: '#262626',
    inverse: '#FFFFFF',
  },
  // Surface Colors
  surface: {
    base: '#171717',
    elevated: '#262626',
    overlay: 'rgba(23, 23, 23, 0.95)',
    inverse: '#FFFFFF',
  },
  // Text Colors
  text: {
    primary: '#FAFAFA',
    secondary: '#D4D4D4',
    tertiary: '#A3A3A3',
    disabled: '#525252',
    inverse: '#171717',
    link: colorPalette.primary[400],
    linkHover: colorPalette.primary[300],
  },
  // Border Colors
  border: {
    subtle: '#262626',
    base: '#404040',
    strong: '#525252',
    focus: colorPalette.primary[400],
    error: colorPalette.error[400],
  },
  // Interactive Colors
  interactive: {
    primary: {
      base: colorPalette.primary[500],
      hover: colorPalette.primary[400],
      active: colorPalette.primary[300],
      disabled: colorPalette.neutral[700],
    },
    secondary: {
      base: colorPalette.secondary[500],
      hover: colorPalette.secondary[400],
      active: colorPalette.secondary[300],
      disabled: colorPalette.neutral[700],
    },
    accent: {
      base: colorPalette.accent[500],
      hover: colorPalette.accent[400],
      active: colorPalette.accent[400],
      disabled: colorPalette.neutral[700],
    },
  },
  // Semantic Colors
  semantic: {
    success: {
      base: colorPalette.success[400],
      background: colorPalette.success[900],
      border: colorPalette.success[800],
      text: colorPalette.success[300],
    },
    error: {
      base: colorPalette.error[400],
      background: colorPalette.error[900],
      border: colorPalette.error[800],
      text: colorPalette.error[300],
    },
    warning: {
      base: colorPalette.warning[400],
      background: colorPalette.warning[900],
      border: colorPalette.warning[800],
      text: colorPalette.warning[300],
    },
    info: {
      base: colorPalette.info[400],
      background: colorPalette.info[900],
      border: colorPalette.info[800],
      text: colorPalette.info[300],
    },
  },
} as const;

export type Theme = typeof lightTheme;
export type ThemeMode = 'light' | 'dark' | 'system';

