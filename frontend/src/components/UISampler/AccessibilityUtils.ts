/**
 * Accessibility Utilities
 *
 * WCAG AA compliance utilities and helpers for the UI Sampler.
 * Provides contrast checking, focus management, and accessibility validation.
 *
 * WCAG AA Standards:
 * - Text contrast: 4.5:1 for normal text, 3:1 for large text
 * - UI component contrast: 3:1 for UI components
 * - Focus indicators: Visible and clear
 * - Keyboard navigation: Full keyboard accessibility
 * - ARIA attributes: Proper semantic structure
 */

/**
 * WCAG Contrast Checker
 *
 * Calculates contrast ratio between two colors and validates against WCAG standards.
 */
export class ContrastChecker {
  /**
   * Convert hex color to RGB
   */
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = (/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i).exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  }

  /**
   * Convert RGB to relative luminance
   */
  static getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Calculate contrast ratio between two colors
   */
  static getContrastRatio(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    if (!rgb1 || !rgb2) return 0;

    const lum1 = this.getRelativeLuminance(rgb1);
    const lum2 = this.getRelativeLuminance(rgb2);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  }

  /**
   * Check if contrast ratio meets WCAG AA standards
   */
  static isAACompliant(contrastRatio: number, largeText: boolean = false): boolean {
    if (largeText) {
      return contrastRatio >= 3.0;
    }
    return contrastRatio >= 4.5;
  }

  /**
   * Check if contrast ratio meets WCAG AAA standards
   */
  static isAAACompliant(contrastRatio: number, largeText: boolean = false): boolean {
    if (largeText) {
      return contrastRatio >= 4.5;
    }
    return contrastRatio >= 7.0;
  }
}

/**
 * Focus Management Utilities
 *
 * Helper functions for managing focus in interactive components.
 */
export class FocusManager {
  /**
   * Focus the next focusable element
   */
  static focusNext(container: HTMLElement): void {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  /**
   * Focus the previous focusable element
   */
  static focusPrevious(container: HTMLElement): void {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  }

  /**
   * Get all focusable elements within a container
   */
  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelector))
      .filter((element) => {
        const style = window.getComputedStyle(element as HTMLElement);
        return style.display !== 'none' && style.visibility !== 'hidden';
      }) as HTMLElement[];
  }

  /**
   * Trap focus within a container
   */
  static trapFocus(container: HTMLElement): () => void {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const focusableElements = this.getFocusableElements(container);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }

  /**
   * Restore focus to previously focused element
   */
  static restoreFocus(previousFocus: HTMLElement | null): void {
    if (previousFocus && previousFocus.focus) {
      previousFocus.focus();
    }
  }
}

/**
 * ARIA Utilities
 *
 * Helper functions for managing ARIA attributes and roles.
 */
export class AriaManager {
  /**
   * Set ARIA live region attributes
   */
  static setLiveRegion(element: HTMLElement, politeness: 'polite' | 'assertive' = 'polite'): () => void {
    const previousLive = element.getAttribute('aria-live');
    const previousAtomic = element.getAttribute('aria-atomic');

    element.setAttribute('aria-live', politeness);
    element.setAttribute('aria-atomic', 'true');

    return () => {
      if (previousLive) {
        element.setAttribute('aria-live', previousLive);
      } else {
        element.removeAttribute('aria-live');
      }
      if (previousAtomic) {
        element.setAttribute('aria-atomic', previousAtomic);
      } else {
        element.removeAttribute('aria-atomic');
      }
    };
  }

  /**
   * Set ARIA expanded state
   */
  static setExpanded(element: HTMLElement, expanded: boolean): void {
    element.setAttribute('aria-expanded', expanded.toString());
  }

  /**
   * Set ARIA selected state
   */
  static setSelected(element: HTMLElement, selected: boolean): void {
    element.setAttribute('aria-selected', selected.toString());
  }

  /**
   * Set ARIA checked state
   */
  static setChecked(element: HTMLElement, checked: boolean): void {
    element.setAttribute('aria-checked', checked.toString());
  }
}

/**
 * Keyboard Navigation Utilities
 *
 * Helper functions for implementing keyboard navigation patterns.
 */
export class KeyboardManager {
  /**
   * Handle arrow key navigation for a list of elements
   */
  static handleArrowNavigation(
    e: KeyboardEvent,
    elements: HTMLElement[],
    currentIndex: number,
    orientation: 'horizontal' | 'vertical' = 'vertical',
  ): number {
    let newIndex = currentIndex;

    if (orientation === 'vertical') {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        newIndex = (currentIndex + 1) % elements.length;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        newIndex = currentIndex === 0 ? elements.length - 1 : currentIndex - 1;
      }
    } else {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        newIndex = (currentIndex + 1) % elements.length;
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        newIndex = currentIndex === 0 ? elements.length - 1 : currentIndex - 1;
      }
    }

    if (newIndex !== currentIndex) {
      elements[newIndex].focus();
    }

    return newIndex;
  }

  /**
   * Handle Home/End key navigation
   */
  static handleHomeEndNavigation(
    e: KeyboardEvent,
    elements: HTMLElement[],
    currentIndex: number,
  ): number {
    let newIndex = currentIndex;

    if (e.key === 'Home') {
      e.preventDefault();
      newIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      newIndex = elements.length - 1;
    }

    if (newIndex !== currentIndex) {
      elements[newIndex].focus();
    }

    return newIndex;
  }
}

/**
 * Screen Reader Utilities
 *
 * Helper functions for screen reader compatibility.
 */
export class ScreenReaderManager {
  /**
   * Announce a message to screen readers
   */
  static announce(message: string, politeness: 'polite' | 'assertive' = 'polite'): void {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', politeness);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;
    document.body.appendChild(announcer);

    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  }

  /**
   * Create a visually hidden but screen reader accessible element
   */
  static createSrOnlyElement(content: string): HTMLElement {
    const element = document.createElement('div');
    element.className = 'sr-only';
    element.textContent = content;
    return element;
  }
}

/**
 * WCAG AA Compliance Checker
 *
 * Validates components against WCAG AA standards.
 */
export class WCAGChecker {
  /**
   * Check if a component meets WCAG AA contrast requirements
   */
  static checkContrast(element: HTMLElement): {
    textContrast: number;
    uiContrast: number;
    textAA: boolean;
    uiAA: boolean;
  } {
    const computedStyle = window.getComputedStyle(element);
    const backgroundColor = computedStyle.backgroundColor;
    const color = computedStyle.color;

    // Convert RGB to hex for contrast checking
    const bgHex = this.rgbToHex(backgroundColor);
    const textHex = this.rgbToHex(color);

    const contrastRatio = ContrastChecker.getContrastRatio(bgHex, textHex);

    return {
      textContrast: contrastRatio,
      uiContrast: contrastRatio,
      textAA: ContrastChecker.isAACompliant(contrastRatio, false),
      uiAA: ContrastChecker.isAACompliant(contrastRatio, true),
    };
  }

  /**
   * Convert RGB to Hex
   */
  private static rgbToHex(rgb: string): string {
    const result = rgb.match(/\d+/g);
    if (!result) return '#000000';

    const [r, g, b] = result.map(n => parseInt(n).toString(16).padStart(2, '0'));
    return `#${r}${g}${b}`;
  }

  /**
   * Validate focus management for a modal
   */
  static validateModalFocus(modal: HTMLElement): boolean {
    const focusableElements = FocusManager.getFocusableElements(modal);
    return focusableElements.length > 0;
  }

  /**
   * Check if all interactive elements have proper ARIA attributes
   */
  static validateARIA(container: HTMLElement): {
    missingAriaLabels: string[];
    missingRoles: string[];
    invalidContrast: string[];
  } {
    const interactiveElements = container.querySelectorAll('button, a, input, select, textarea');
    const issues = {
      missingAriaLabels: [] as string[],
      missingRoles: [] as string[],
      invalidContrast: [] as string[],
    };

    interactiveElements.forEach((element) => {
      const el = element as HTMLElement;

      // Check for aria-label or accessible name
      if (!el.getAttribute('aria-label') && !el.textContent?.trim()) {
        issues.missingAriaLabels.push(el.tagName);
      }

      // Check contrast for buttons and links
      if (el.tagName === 'BUTTON' || el.tagName === 'A') {
        const contrast = this.checkContrast(el);
        if (!contrast.textAA) {
          issues.invalidContrast.push(`${el.tagName} with contrast ${contrast.textContrast.toFixed(2)}:1`);
        }
      }
    });

    return issues;
  }
}

/**
 * Accessibility Hook
 *
 * React hook for managing accessibility in components.
 */
export function useAccessibility() {
  const checkContrast = (color1: string, color2: string) => {
    return ContrastChecker.getContrastRatio(color1, color2);
  };

  const isAACompliant = (contrastRatio: number, largeText: boolean = false) => {
    return ContrastChecker.isAACompliant(contrastRatio, largeText);
  };

  const announce = (message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    ScreenReaderManager.announce(message, politeness);
  };

  const trapFocus = (container: HTMLElement) => {
    return FocusManager.trapFocus(container);
  };

  return {
    checkContrast,
    isAACompliant,
    announce,
    trapFocus,
    WCAGChecker,
    FocusManager,
    AriaManager,
    KeyboardManager,
    ScreenReaderManager,
  };
}
