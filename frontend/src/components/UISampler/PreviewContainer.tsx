/**
 * PreviewContainer Component
 *
 * Core infrastructure component for the UI Sampler.
 * Provides a standardized container for live interactive previews
 * with visual separation, copy-to-clipboard functionality, and responsive design.
 *
 * Features:
 * - Live rendering of components (not static screenshots)
 * - Component is fully interactive (clicks, inputs work)
 * - Visual separation between preview and code examples
 * - Support for multiple examples per component
 * - Copy-to-clipboard button for each code example
 * - Responsive preview that works on all screen sizes
 * - Preview has visual boundary/border for clarity
 */

import { useState, ReactNode } from 'react';

import { Button } from '../primitives/Button';
import { Card, CardContent } from '../primitives/Card';
import { CopyToClipboard } from './CopyToClipboard';
import { CodeBlock } from './CodeBlock';

export interface PreviewExample {
  title: string;
  code: string;
  preview: ReactNode;
  description?: string;
}

export type CategoryKey = 'typography' | 'colors' | 'primitives' | 'patterns' | 'visualizations';

export interface SamplerCategory {
  key: CategoryKey;
  label: string;
  icon: ReactNode;
  description: string;
  components: PreviewExample[];
}

export interface SamplerComponent {
  key: string;
  title: string;
  description: string;
  component: React.ComponentType;
  code?: string;
}

export interface PreviewContainerProps {
  /**
   * Title for the preview section
   */
  title?: string;
  /**
   * Description for the preview section
   */
  description?: string;
  /**
   * Array of preview examples to display
   */
  examples?: PreviewExample[];
  /**
   * The main component to preview (live rendering)
   */
  children?: ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Whether to show the code block below the preview
   * @default true
   */
  showCode?: boolean;
  /**
   * Default code to show when no examples provided
   */
  defaultCode?: string;
  /**
   * Layout variant
   * @default 'stacked'
   */
  layout?: 'stacked' | 'horizontal' | 'grid';
}

/**
 * PreviewContainer Component
 *
 * Container for live component previews with code examples.
 */
export function PreviewContainer({
  title,
  description,
  examples,
  children,
  className,
  showCode = true,
  defaultCode,
  layout = 'stacked',
}: PreviewContainerProps) {
  const [activeExampleIndex, setActiveExampleIndex] = useState(0);

  const containerClasses = `
    ${className || ''}
    space-y-6
  `;

  const cardClasses = `
    bg-[var(--color-surface-base)]
    border
    border-[var(--color-border-subtle)]
    rounded-xl
    shadow-lg
    transition-all
    duration-300
    ease-in-out
    hover:shadow-xl
    hover:border-[var(--color-border-strong)]
  `;

  const previewClasses = `
    relative
    min-h-[200px]
    p-6
    rounded-lg
    bg-[var(--color-surface-secondary)]
    border
    border-[var(--color-border-subtle)]
    overflow-hidden
  `;

  const codeBlockClasses = `
    mt-4
    bg-[var(--color-surface-tertiary)]
    border
    border-[var(--color-border-subtle)]
    rounded-lg
    overflow-hidden
  `;

  const activeExample = examples?.[activeExampleIndex];

  return (
    <div className={containerClasses}>
      {/* Header */}
      {(title || description) && (
        <div className="border-b border-[var(--color-border-subtle)] pb-6">
          {title && (
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-[var(--color-text-secondary)] text-lg">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Content Area */}
      <div className={cardClasses}>
        {/* Preview Area */}
        <div className={previewClasses}>
          {/* Live Preview */}
          <div className="relative z-10">
            {children || (activeExample ? activeExample.preview : (
              <div className="flex items-center justify-center h-48 text-[var(--color-text-secondary)]">
                {examples ? 'Select an example to preview' : 'No preview available'}
              </div>
            ))}
          </div>

          {/* Preview Overlay Border */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-interactive-primary-base)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-[var(--color-interactive-primary-base)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-interactive-primary-base)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 w-1 h-full bg-gradient-to-t from-transparent via-[var(--color-interactive-primary-base)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>

        {/* Examples Navigation */}
        {examples && examples.length > 1 && (
          <div className="flex flex-wrap gap-2 p-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-tertiary)] rounded-t-lg">
            {examples.map((example, index) => (
              <Button
                key={index}
                variant={activeExampleIndex === index ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveExampleIndex(index)}
                className="transition-all duration-200"
              >
                {example.title}
              </Button>
            ))}
          </div>
        )}

        {/* Code Block */}
        {showCode && (activeExample?.code || defaultCode) && (
          <div className={codeBlockClasses}>
            <div className="flex items-center justify-between p-3 bg-[var(--color-surface-secondary)] border-b border-[var(--color-border-subtle)]">
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                {activeExample?.title ? `${activeExample.title} Code` : 'Code Example'}
              </span>
              <CopyToClipboard
                text={activeExample?.code || defaultCode || ''}
                tooltip="Copy code"
              />
            </div>
            <CodeBlock
              code={activeExample?.code || defaultCode || ''}
              language="tsx"
              className="p-4"
            />
          </div>
        )}
      </div>

      {/* Examples Grid (if layout is grid) */}
      {examples && layout === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {examples.map((example, index) => (
            <Card key={index} className="hover:shadow-xl transition-shadow duration-300">
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    {example.title}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveExampleIndex(index)}
                  >
                    Preview
                  </Button>
                </div>
                {example.description && (
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {example.description}
                  </p>
                )}
                <div className="border border-[var(--color-border-subtle)] rounded-lg p-4 bg-[var(--color-surface-secondary)]">
                  {example.preview}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--color-text-tertiary)]">Code</span>
                    <CopyToClipboard text={example.code} tooltip="Copy code" />
                  </div>
                  <CodeBlock
                    code={example.code}
                    language="tsx"
                    className="text-xs"
                    maxLines={10}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * SimplePreview Component
 *
 * Simplified version of PreviewContainer for single component previews.
 */
export function SimplePreview({
  title,
  description,
  preview,
  code,
  className,
}: {
  title: string;
  description?: string;
  preview: ReactNode;
  code: string;
  className?: string;
}) {
  return (
    <PreviewContainer
      title={title}
      description={description}
      className={className}
      showCode={true}
      defaultCode={code}
    >
      {preview}
    </PreviewContainer>
  );
}