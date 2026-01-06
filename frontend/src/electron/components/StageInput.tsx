/**
 * StageInput Component
 *
 * Input stage for file upload, text input, and document browsing with back navigation.
 * Uses a 3-tab layout with SOTA void theme styling and aurora gradients.
 *
 * @example
 * ```tsx
 * <StageInput
 *   onBack={() => setStage('welcome')}
 *   onUpload={() => setStage('analysis')}
 * />
 * ```
 */

import { forwardRef, useState, useCallback } from 'react';
import { ArrowLeft, Upload, FileText, FolderOpen } from 'lucide-react';
import { useDocumentStore } from '../../stores/documentStore';
import { cn } from '../../lib/utils';
import { Button } from '../../design-system/components';
import { FileUploader } from './upload/FileUploader';
import { TextInputArea } from './upload/TextInputArea';
import { DocumentBrowserPanel } from './DocumentBrowserPanel';

export interface StageInputProps {
  /**
   * Callback when back button is clicked
   */
  onBack: () => void;
}

/**
 * Tab configuration
 */
type InputTab = 'upload' | 'text' | 'browse';

interface TabConfig {
  id: InputTab;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabConfig[] = [
  {
    id: 'upload',
    label: 'Upload',
    icon: <Upload className="w-4 h-4" />,
  },
  {
    id: 'text',
    label: 'Paste Text',
    icon: <FileText className="w-4 h-4" />,
  },
  {
    id: 'browse',
    label: 'Browse Documents',
    icon: <FolderOpen className="w-4 h-4" />,
  },
];

/**
 * StageInput
 *
 * Input stage with header, 3-tab navigation, and content panels.
 * Uses void background colors, aurora gradients, and SOTA styling.
 */
export const StageInput = forwardRef<HTMLDivElement, StageInputProps>(
  ({ onBack }, ref) => {
    const [activeTab, setActiveTab] = useState<InputTab>('upload');
    const { setStage } = useDocumentStore();

    const handleTabChange = useCallback((tabId: InputTab) => {
      setActiveTab(tabId);
    }, []);

    const handleDocumentLoad = useCallback(async (id: string) => {
      const { loadDocumentById } = useDocumentStore.getState();
      await loadDocumentById(id);
      setStage('visualization');
    }, [setStage]);

    return (
      <div
        ref={ref}
        className={cn(
          'flex-1',
          'flex',
          'flex-col',
          'bg-[var(--color-background-primary)]',
          'text-[var(--color-text-primary)]'
        )}
      >
        {/* Header */}
        <header
          className={cn(
            'px-[var(--spacing-lg)]',
            'py-[var(--spacing-lg)]',
            'border-b',
            'flex',
            'items-center',
            'justify-between'
          )}
          style={{
            borderColor: 'var(--color-border-subtle)',
          }}
        >
          <h2
            className={cn(
              'text-[var(--font-size-2xl)]',
              'font-[var(--font-weight-semibold)]',
              'text-[var(--color-text-primary)]',
              'leading-[var(--line-height-tight)]'
            )}
          >
            Upload Document
          </h2>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={onBack}
            title="Back"
            className="gap-[var(--spacing-sm)]"
          >
            <span />
          </Button>
        </header>

        {/* Tab Navigation */}
        <nav
          className={cn(
            'px-[var(--spacing-lg)]',
            'pt-[var(--spacing-lg)]',
            'flex',
            'gap-[var(--spacing-md)]',
            'items-center',
            'bg-gradient-to-b',
            'from-transparent',
            'to-[rgba(99,102,241,0.05)]',
            'backdrop-blur-sm',
            'relative',
            'overflow-hidden',
            'rounded-[var(--radius-xl)]',
            'border',
            'border-[var(--color-border-subtle)]'
          )}
          role="tablist"
          aria-label="Input options"
        >
          {/* Background gradient overlay */}
          <div
            className={cn(
              'absolute',
              'inset-0',
              'bg-gradient-to-r',
              'from-transparent',
              'via-[rgba(99,102,241,0.1)]',
              'to-transparent',
              'pointer-events-none'
            )}
          />

          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  'flex',
                  'items-center',
                  'gap-[var(--spacing-sm)]',
                  'px-[var(--spacing-lg)]',
                  'py-[var(--spacing-base)]',
                  'rounded-[var(--radius-xl)]',
                  'transition-all',
                  'duration-[var(--motion-duration-base)]',
                  'ease-[var(--motion-easing-ease-out)]',
                  'outline-none',
                  'relative',
                  'group',
                  'hover:scale-105',
                  'hover:shadow-[var(--elevation-lg)]',
                  isActive ? 'gradient-border-animated' : '',
                  isActive ? 'bg-[var(--color-surface-base)]' : 'bg-transparent',
                  isActive ? 'border-[var(--color-border-focus)]' : 'border-[var(--color-border-subtle)]',
                  isActive ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]',
                  'backdrop-blur-sm',
                  'hover:bg-[var(--color-surface-base)]'
                )}
              >
                {/* Icon container with enhanced styling */}
                <div
                  className={cn(
                    'flex',
                    'items-center',
                    'justify-center',
                    'w-[var(--spacing-3xl)]',
                    'h-[var(--spacing-3xl)]',
                    'rounded-[var(--radius-lg)]',
                    'transition-all',
                    'duration-[var(--motion-duration-base)]',
                    'ease-[var(--motion-easing-ease-out)]',
                    'group-hover:scale-110',
                    'bg-[var(--color-surface-base)]',
                    'border',
                    'border-[var(--color-border-subtle)]',
                    'hover:bg-[var(--color-surface-elevated)]',
                    'hover:border-[var(--color-border-strong)]'
                  )}
                >
                  {tab.icon}
                </div>

                {/* Label with enhanced typography */}
                <div className="flex flex-col items-start">
                  <span
                    className={cn(
                      'font-[var(--font-weight-medium)]',
                      'transition-colors',
                      'duration-[var(--motion-duration-base)]',
                      'ease-[var(--motion-easing-ease-out)]',
                      'text-[var(--color-text-primary)]',
                      'leading-[var(--line-height-tight)]'
                    )}
                  >
                    {tab.label}
                  </span>
                  <span
                    className={cn(
                      'text-[var(--font-size-sm)]',
                      'opacity-0',
                      'group-hover:opacity-100',
                      'transition-all',
                      'duration-[var(--motion-duration-base)]',
                      'ease-[var(--motion-easing-ease-out)]',
                      'mt-[var(--spacing-xs)]',
                      'text-[var(--color-text-tertiary)]'
                    )}
                  >
                    {tab.id === 'upload' && 'Drag & drop supported'}
                    {tab.id === 'text' && 'Real-time preview'}
                    {tab.id === 'browse' && 'Your documents'}
                  </span>
                </div>

                {/* Active state enhancements */}
                {isActive && (
                  <>
                    {/* Outer glow effect */}
                    <div
                      className={cn(
                        'absolute',
                        'inset-0',
                        'rounded-[var(--radius-xl)]',
                        'opacity-60',
                        'blur-xl',
                        'pointer-events-none',
                        'bg-gradient-to-r',
                        'from-[var(--aurora-1)]',
                        'via-[var(--aurora-2)]',
                        'to-[var(--aurora-3)]'
                      )}
                    />
                    {/* Inner highlight */}
                    <div
                      className={cn(
                        'absolute',
                        'top-0',
                        'left-0',
                        'right-0',
                        'h-[var(--spacing-xs)]',
                        'rounded-t-[var(--radius-xl)]',
                        'opacity-80',
                        'bg-gradient-to-r',
                        'from-[var(--aurora-1)]',
                        'via-[var(--aurora-2)]',
                        'to-[var(--aurora-1)]'
                      )}
                    />
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Tab Content */}
        <div
          className={cn(
            'flex-1',
            'flex',
            'flex-col',
            'px-8',
            'py-6',
            'overflow-hidden'
          )}
        >
          <div
            className={cn(
              'w-full',
              'max-w-2xl',
              'mx-auto',
              'h-full',
              'flex',
              'flex-col'
            )}
          >
            {/* Upload Panel */}
            <div
              role="tabpanel"
              id="panel-upload"
              aria-labelledby="tab-upload"
              className={cn(
                'transition-all',
                'duration-[var(--duration-normal)]',
                'h-full',
                'flex',
                'flex-col',
                'items-center',
                'justify-center'
              )}
              style={{
                display: activeTab === 'upload' ? 'flex' : 'none',
                opacity: activeTab === 'upload' ? 1 : 0,
              }}
            >
              <FileUploader />
            </div>

            {/* Text Input Panel */}
            <div
              role="tabpanel"
              id="panel-text"
              aria-labelledby="tab-text"
              className={cn(
                'transition-all',
                'duration-[var(--motion-duration-normal)]',
                'ease-[var(--motion-easing-ease-out)]',
                'h-full',
                'flex',
                'flex-col'
              )}
              style={{
                display: activeTab === 'text' ? 'flex' : 'none',
                opacity: activeTab === 'text' ? 1 : 0,
              }}
            >
              <div
                className={cn(
                  'h-full',
                  'p-[var(--spacing-lg)]',
                  'rounded-[var(--radius-lg)]',
                  'transition-all',
                  'duration-[var(--motion-duration-base)]',
                  'ease-[var(--motion-easing-ease-out)]',
                  'bg-[var(--color-surface-base)]',
                  'border',
                  'border-[var(--color-border-subtle)]'
                )}
              >
                <TextInputArea />
              </div>
            </div>

            {/* Browse Documents Panel */}
            <div
              role="tabpanel"
              id="panel-browse"
              aria-labelledby="tab-browse"
              className={cn(
                'transition-all',
                'duration-[var(--duration-normal)]',
                'h-full',
                'flex',
                'flex-col'
              )}
              style={{
                display: activeTab === 'browse' ? 'flex' : 'none',
                opacity: activeTab === 'browse' ? 1 : 0,
              }}
            >
              <DocumentBrowserPanel onDocumentLoad={handleDocumentLoad} />
            </div>
          </div>
        </div>

        {/* Bottom hint */}
        <div
          className={cn(
            'px-[var(--spacing-lg)]',
            'pb-[var(--spacing-lg)]',
            'text-center'
          )}
          style={{
            color: 'var(--color-text-tertiary)',
            fontSize: 'var(--font-size-xs)',
          }}
        >
          {activeTab === 'upload' && 'Upload a .txt, .pdf, or .md file to get started'}
          {activeTab === 'text' && 'Paste your text content directly'}
          {activeTab === 'browse' && 'Select from your previously uploaded documents'}
        </div>
      </div>
    );
  }
);

StageInput.displayName = 'StageInput';
