/**
 * CopyToClipboard Component
 *
 * Provides copy-to-clipboard functionality with visual feedback and error handling.
 * WCAG AA compliant with keyboard accessibility and proper ARIA attributes.
 *
 * Features:
 * - Visual feedback on successful copy (toast, button state change)
 * - Error handling if clipboard API fails
 * - Keyboard accessible (Enter/Space)
 * - ARIA labels for screen readers
 * - WCAG compliant (visible focus, good contrast)
 * - Maintains code formatting on paste
 */

import { useState, useCallback } from 'react';

import { Button } from '../primitives/Button';
import { useDocumentStore } from '../../stores/documentStore';

export interface CopyToClipboardProps {
  /**
   * Text to copy to clipboard
   */
  text: string;
  /**
   * Tooltip text for the copy button
   * @default "Copy to clipboard"
   */
  tooltip?: string;
  /**
   * Success message to show after copying
   * @default "Copied to clipboard!"
   */
  successMessage?: string;
  /**
   * Error message to show if copying fails
   * @default "Failed to copy. Please try again."
   */
  errorMessage?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Button variant
   * @default "ghost"
   */
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  /**
   * Button size
   * @default "sm"
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Custom icon for the copy button
   */
  icon?: React.ReactNode;
}

/**
 * CopyToClipboard Component
 *
 * Button that copies text to clipboard with visual feedback.
 */
export function CopyToClipboard({
  text,
  tooltip = 'Copy to clipboard',
  successMessage = 'Copied to clipboard!',
  errorMessage = 'Failed to copy. Please try again.',
  className,
  variant = 'ghost',
  size = 'sm',
  icon,
}: CopyToClipboardProps) {
  const [isCopying, setIsCopying] = useState(false);
  const { addToast } = useDocumentStore();

  const handleCopy = useCallback(async () => {
    if (!text) return;

    setIsCopying(true);

    try {
      // Modern Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        addToast({
          title: 'Success',
          message: successMessage,
          type: 'success',
        });
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          const successful = document.execCommand('copy');
          if (successful) {
            addToast({
              title: 'Success',
              message: successMessage,
              type: 'success',
            });
          } else {
            throw new Error('Copy command failed');
          }
        } catch (err) {
          throw new Error('Fallback copy method failed');
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      console.error('Copy failed:', err);
      addToast({
        title: 'Error',
        message: errorMessage,
        type: 'error',
      });
    } finally {
      setIsCopying(false);
    }
  }, [text, successMessage, errorMessage, addToast]);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      disabled={isCopying || !text}
      aria-label={tooltip}
      title={tooltip}
      className={className}
    >
      {icon || (
        <svg
          className={`w-4 h-4 ${isCopying ? 'animate-spin' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          {isCopying ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          )}
        </svg>
      )}
      <span className="sr-only">{tooltip}</span>
    </Button>
  );
}

/**
 * useCopyToClipboard Hook
 *
 * Hook for copying text to clipboard with state management.
 */
export function useCopyToClipboard() {
  const [isCopying, setIsCopying] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const { addToast } = useDocumentStore();

  const copyToClipboard = useCallback(async (text: string, successMessage?: string) => {
    if (!text || isCopying) return false;

    setIsCopying(true);

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback method
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setHasCopied(true);
      setIsCopying(false);

      if (successMessage) {
        addToast({
          title: 'Success',
          message: successMessage,
          type: 'success',
        });
      }

      // Reset hasCopied after 2 seconds
      setTimeout(() => setHasCopied(false), 2000);

      return true;
    } catch (err) {
      console.error('Copy failed:', err);
      setIsCopying(false);
      addToast({
        title: 'Error',
        message: 'Failed to copy. Please try again.',
        type: 'error',
      });
      return false;
    }
  }, [isCopying, addToast]);

  return {
    isCopying,
    hasCopied,
    copyToClipboard,
  };
}