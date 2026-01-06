/**
 * useClickOutside Hook
 *
 * React hook to detect clicks outside of a referenced element.
 * Useful for dropdowns, modals, and popovers.
 *
 * @example
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null);
 * useClickOutside(ref, () => setIsOpen(false));
 * ```
 */

import { useEffect, RefObject } from 'react';

/**
 * Hook to detect clicks outside of an element
 *
 * @param ref - React ref to the element
 * @param handler - Callback function to execute when click outside is detected
 * @param enabled - Whether the hook is enabled (default: true)
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled: boolean = true,
): void {
  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    // Use capture phase to detect clicks before they bubble
    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('touchstart', handleClickOutside, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
    };
  }, [ref, handler, enabled]);
}

