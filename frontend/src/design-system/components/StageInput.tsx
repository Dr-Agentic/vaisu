/**
 * StageInput Component
 *
 * Input stage for file upload and text input with back navigation.
 * Integrates existing FileUploader and TextInputArea components.
 *
 * @example
 * ```tsx
 * <StageInput
 *   onBack={() => setStage('welcome')}
 *   onUpload={() => setStage('analysis')}
 * />
 * ```
 */

import { forwardRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/utils';
import { FileUploader } from '../../components/upload/FileUploader';
import { TextInputArea } from '../../components/upload/TextInputArea';

export interface StageInputProps {
  /**
   * Callback when back button is clicked
   */
  onBack: () => void;
}

/**
 * StageInput
 *
 * Input stage with header, upload area, and text input.
 * Uses void background colors and SOTA styling.
 */
export const StageInput = forwardRef<HTMLDivElement, StageInputProps>(
  ({ onBack }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          backgroundColor: 'var(--void-deepest)',
          color: 'var(--text-primary)',
        }}
        className={cn(
          'flex-1',
          'flex',
          'flex-col'
        )}
      >
        {/* Header */}
        <header
          className={cn(
            'px-8',
            'py-6',
            'border-b',
            'flex',
            'items-center',
            'justify-between'
          )}
          style={{
            borderColor: 'var(--void-border)',
          }}
        >
          <h2
            className="text-2xl font-semibold"
            style={{
              color: 'var(--text-primary)',
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-semibold)',
            }}
          >
            Upload Document
          </h2>
          <Button
            variant="ghost"
            size="md"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={onBack}
          >
            Back
          </Button>
        </header>

        {/* Content */}
        <div
          className={cn(
            'flex-1',
            'flex',
            'flex-col',
            'items-center',
            'justify-center',
            'p-8',
            'gap-8'
          )}
        >
          {/* Upload Area */}
          <div className="w-full max-w-2xl">
            <FileUploader />
          </div>

          {/* Divider */}
          <div
            className={cn(
              'flex',
              'items-center',
              'gap-4',
              'w-full',
              'max-w-2xl'
            )}
          >
            <div
              className="flex-1 h-px"
              style={{ backgroundColor: 'var(--void-border)' }}
            />
            <span
              className="whitespace-nowrap"
              style={{
                color: 'var(--text-secondary)',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              OR
            </span>
            <div
              className="flex-1 h-px"
              style={{ backgroundColor: 'var(--void-border)' }}
            />
          </div>

          {/* Text Input */}
          <div className="w-full max-w-2xl">
            <TextInputArea />
          </div>
        </div>
      </div>
    );
  }
);

StageInput.displayName = 'StageInput';
