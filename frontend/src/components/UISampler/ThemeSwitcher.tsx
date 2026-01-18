/**
 * ThemeSwitcher Component
 *
 * A compact theme switcher component for the UI Sampler.
 * Provides quick access to light, dark, and system theme modes.
 *
 * Features:
 * - Three-way toggle: Light / Dark / System
 * - Visual indicators for current mode
 * - Smooth transitions between themes
 * - Accessible design with proper ARIA labels
 * - Matches the existing design system aesthetic
 */

import { useTheme } from '../../design-system/ThemeProvider';
import { ThemeToggle } from '../primitives/ThemeToggle';

/**
 * ThemeSwitcher Component
 *
 * Compact theme switcher with three modes: Light, Dark, System.
 * Positioned in the top-right corner for easy access.
 * Uses the existing ThemeToggle component for consistency.
 */
export function ThemeSwitcher() {
  const { theme } = useTheme();

  return (
    <div className="flex items-center gap-3">
      {/* Current Theme Indicator */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-surface-secondary)] rounded-lg border border-[var(--color-border-subtle)]">
        <span className="text-sm font-medium text-[var(--color-text-secondary)]">
          Theme
        </span>
        <div className="flex items-center gap-1.5 text-sm">
          {theme === 'light' && (
            <span className="text-lg" aria-hidden="true">☀️</span>
          )}
          {theme === 'system' && (
            <span className="text-lg" aria-hidden="true">🖥️</span>
          )}
          {theme === 'dark' && (
            <span className="text-lg" aria-hidden="true">🌙</span>
          )}
          <span className="text-[var(--color-text-primary)] font-medium">
            {theme === 'light' ? 'Light' : theme === 'system' ? 'System' : 'Dark'}
          </span>
          {theme === 'system' && (
            <span className="text-xs text-[var(--color-text-tertiary)] bg-[var(--color-surface-primary)] px-1.5 py-0.5 rounded border border-[var(--color-border-subtle)]">
              Auto
            </span>
          )}
        </div>
      </div>

      {/* Theme Toggle Button */}
      <ThemeToggle
        variant="primary"
        showLabels={false}
        className="group"
      />
    </div>
  );
}

/**
 * ThemeSwitcher Usage Examples
 *
 * @example Basic usage in header
 * ```tsx
 * import { ThemeSwitcher } from './components/UISampler/ThemeSwitcher';
 *
 * function Header() {
 *   return (
 *     <header className="flex justify-between items-center p-4 border-b">
 *       <h1>App Title</h1>
 *       <ThemeSwitcher />
 *     </header>
 *   );
 * }
 * ```
 */
