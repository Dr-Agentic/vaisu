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
        style={{
          backgroundColor: 'var(--color-background-primary)',
          color: 'var(--color-text-primary)',
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
            borderColor: 'var(--color-border-subtle)',
          }}
        >
          <h2
            className="text-2xl font-semibold"
            style={{
              color: 'var(--color-text-primary)',
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-semibold)',
            }}
          >
            Upload Document
          </h2>
          <button
            onClick={onBack}
            className={cn(
              'flex',
              'items-center',
              'gap-2',
              'px-4',
              'py-2',
              'rounded-md',
              'transition-all',
              'duration-[var(--duration-fast)]',
              'outline-none',
              'hover:bg-white/5'
            )}
            style={{
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border-subtle)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-strong)';
              e.currentTarget.style.color = 'var(--color-text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span style={{ fontSize: 'var(--font-size-sm)' }}>Back</span>
          </button>
        </header>

        {/* Tab Navigation */}
        <nav
          className={cn(
            'px-8',
            'pt-6',
            'flex',
            'gap-3',
            'items-center',
            'bg-gradient-to-b',
            'from-transparent',
            'to-[rgba(99,102,241,0.05)]',
            'backdrop-blur-sm',
            'relative',
            'overflow-hidden',
            'rounded-xl',
            'border',
            'border-[rgba(99,102,241,0.1)]'
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
                  'gap-3',
                  'px-6',
                  'py-3.5',
                  'rounded-xl',
                  'transition-all',
                  'duration-[var(--duration-fast)]',
                  'outline-none',
                  'relative',
                  'group',
                  'hover:scale-105',
                  'hover:shadow-xl'
                )}
                style={{
                  backgroundColor: isActive
                    ? 'rgba(99, 102, 241, 0.25)'
                    : 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid',
                  borderColor: isActive
                    ? 'rgba(99, 102, 241, 0.8)'
                    : 'rgba(255, 255, 255, 0.08)',
                  color: isActive
                    ? 'var(--color-text-primary)'
                    : 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: isActive
                    ? 'var(--font-weight-semibold)'
                    : 'var(--font-weight-medium)',
                  boxShadow: isActive
                    ? '0 0 25px rgba(99, 102, 241, 0.35), inset 0 0 20px rgba(99, 102, 241, 0.1)'
                    : '0 4px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)';
                  }
                }}
              >
                {/* Icon container with enhanced styling */}
                <div
                  className={cn(
                    'flex',
                    'items-center',
                    'justify-center',
                    'w-10',
                    'h-10',
                    'rounded-lg',
                    'transition-all',
                    'duration-[var(--duration-fast)]',
                    'group-hover:scale-110'
                  )}
                  style={{
                    backgroundColor: isActive
                      ? 'rgba(99, 102, 241, 0.35)'
                      : 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid',
                    borderColor: isActive
                      ? 'rgba(99, 102, 241, 0.6)'
                      : 'rgba(255, 255, 255, 0.1)',
                    boxShadow: isActive
                      ? '0 0 15px rgba(99, 102, 241, 0.4)'
                      : '0 2px 10px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  {tab.icon}
                </div>

                {/* Label with enhanced typography */}
                <div className="flex flex-col items-start">
                  <span
                    className={cn(
                      'font-medium',
                      'transition-colors',
                      'duration-[var(--duration-fast)]'
                    )}
                    style={{
                      color: isActive
                        ? 'var(--aurora-1)'
                        : 'var(--color-text-primary)',
                      textShadow: isActive
                        ? '0 0 10px rgba(99, 102, 241, 0.5)'
                        : 'none',
                    }}
                  >
                    {tab.label}
                  </span>
                  <span
                    className={cn(
                      'text-xs',
                      'opacity-0',
                      'group-hover:opacity-100',
                      'transition-all',
                      'duration-[var(--duration-fast)]',
                      'mt-0.5'
                    )}
                    style={{
                      color: isActive
                        ? 'rgba(99, 102, 241, 0.8)'
                        : 'var(--color-text-tertiary)',
                    }}
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
                        'rounded-xl',
                        'opacity-60',
                        'blur-xl',
                        'pointer-events-none'
                      )}
                      style={{
                        background: 'var(--gradient-aurora)',
                        boxShadow: '0 0 40px rgba(99, 102, 241, 0.6)',
                      }}
                    />
                    {/* Inner highlight */}
                    <div
                      className={cn(
                        'absolute',
                        'top-0',
                        'left-0',
                        'right-0',
                        'h-1',
                        'rounded-t-xl',
                        'opacity-80'
                      )}
                      style={{
                        background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.8), rgba(167, 139, 250, 0.6), rgba(99, 102, 241, 0.8))',
                      }}
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
                'duration-[var(--duration-normal)]',
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
                  'p-4',
                  'rounded-lg',
                  'transition-all',
                  'duration-[var(--duration-fast)]'
                )}
                style={{
                  backgroundColor: 'var(--color-surface-base)',
                  border: '1px solid var(--color-border-subtle)',
                }}
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
            'px-8',
            'pb-6',
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
