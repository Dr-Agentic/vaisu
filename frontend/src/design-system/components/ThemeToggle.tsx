/**
 * Theme Toggle Component
 *
 * Accessible theme switcher that cycles between light, dark, and system modes.
 *
 * @example
 * ```tsx
 * <ThemeToggle />
 * ```
 */

import { Moon, Sun, Monitor } from 'lucide-react';

import { cn } from '../../lib/utils';
import { useTheme } from '../ThemeProvider';

import { Button, type ButtonVariant } from './Button';

export interface ThemeToggleProps {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Show labels for each theme option
   */
  showLabels?: boolean;
  /**
   * Button variant
   * @default "ghost"
   */
  variant?: ButtonVariant;
}

/**
 * Theme Toggle Component
 *
 * Cycles through: system -> light -> dark -> system
 */
export function ThemeToggle({ className, showLabels = false, variant = 'ghost' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const handleToggle = () => {
    if (theme === 'system') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('system');
    }
  };

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="w-4 h-4" aria-hidden="true" />;
    }
    if (resolvedTheme === 'dark') {
      return <Moon className="w-4 h-4" aria-hidden="true" />;
    }
    return <Sun className="w-4 h-4" aria-hidden="true" />;
  };

  const getLabel = () => {
    if (theme === 'system') {
      return 'System';
    }
    if (theme === 'light') {
      return 'Light';
    }
    return 'Dark';
  };

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleToggle}
      className={cn('gap-[var(--spacing-sm)]', className)}
      aria-label={`Switch to ${theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system'} theme`}
    >
      {getIcon()}
      {showLabels && <span>{getLabel()}</span>}
    </Button>
  );
}

