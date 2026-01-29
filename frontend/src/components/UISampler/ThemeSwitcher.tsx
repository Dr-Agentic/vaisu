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


import { ThemeToggle } from '../primitives/ThemeToggle';

/**
 * ThemeSwitcher Component
 *
 * Compact theme switcher with three modes: Light, Dark, System.
 * Positioned in the top-right corner for easy access.
 * Uses the existing ThemeToggle component for consistency.
 */
export function ThemeSwitcher() {
  return (
    <div className="flex items-center gap-3">
      {/* Current Theme Indicator */}


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
