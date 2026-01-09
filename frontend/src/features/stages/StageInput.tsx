/**
 * StageInput Component
 *
 * Clean input stage for document upload with elegant tabbed interface.
 * Matches visual style of StageWelcome with gradient text and aurora effects.
 *
 * @example
 * ```tsx
 * <StageInput onBack={() => setStage('welcome')} />
 * ```
 */

import { ArrowLeft, Upload, FileText, FolderOpen } from 'lucide-react';
import { forwardRef, useState, useCallback } from 'react';

import { Button } from '../../components/primitives';
import { cn } from '../../lib/utils';
import { useDocumentStore } from '../../stores/documentStore';
import { DocumentBrowserPanel } from '../document/DocumentBrowserPanel';
import { FileUploader } from '../document/FileUploader';
import { TextInputArea } from '../document/TextInputArea';

export interface StageInputProps {}

type InputTab = 'upload' | 'text' | 'browse';

interface TabConfig {
  id: InputTab;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const TABS: TabConfig[] = [
  {
    id: 'upload',
    label: 'Upload',
    description: 'Drag & drop files (PDF, TXT, MD)',
    icon: <Upload className="w-5 h-5" />,
  },
  {
    id: 'text',
    label: 'Paste Text',
    description: 'Direct input with preview',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: 'browse',
    label: 'Your Documents',
    description: 'Access saved content',
    icon: <FolderOpen className="w-5 h-5" />,
  },
];

/**
 * StageInput
 *
 * Clean, elegant input stage with minimal header and tabbed content.
 * Uses hero styling with subtle aurora backgrounds matching StageWelcome.
 */
export const StageInput = forwardRef<HTMLDivElement, StageInputProps>(
  (_, ref) => {
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
          'items-center',
          'justify-start',
          'pt-12',
          'bg-[var(--color-background-primary)]',
          'text-[var(--color-text-primary)]',
          'hero-bg',
        )}
      >
        {/* Header */}
        <div className="max-w-3xl mx-auto w-full px-8 flex items-center justify-between mb-8">
          <h2
            className={cn(
              'text-gradient-glow',
              'font-bold',
              'leading-tight',
            )}
            style={{
              fontSize: 'var(--font-size-3xl)',
              fontWeight: 'var(--font-weight-bold)',
            }}
          >
            Upload Document
          </h2>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => setStage('welcome')}
            className="text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Back
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-3xl mx-auto w-full px-8 mb-8">
          <div
            className={cn(
              'flex',
              'gap-3',
              'p-2',
              'rounded-2xl',
              'bg-[var(--color-surface-base)]',
              'border',
              'border-[var(--color-border-subtle)]',
              'backdrop-blur-sm',
              'shadow-lg',
            )}
            role="tablist"
            aria-label="Input methods"
          >
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
                    'flex-1',
                    'flex',
                    'flex-col',
                    'items-center',
                    'justify-center',
                    'gap-2',
                    'p-4',
                    'rounded-xl',
                    'transition-all',
                    'duration-300',
                    'ease-out',
                    'min-w-[140px]',
                    'relative',
                    'group',
                    isActive ? 'bg-[var(--color-surface-elevated)]' : 'hover:bg-[var(--color-surface-tertiary)]',
                    isActive && 'ring-2 ring-purple-500/30 ring-offset-2 ring-offset-[var(--color-background-primary)]',
                  )}
                  style={{
                    outline: 'none',
                  }}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      'p-3',
                      'rounded-lg',
                      'transition-all',
                      'duration-300',
                      isActive ? 'bg-purple-500/20 scale-110' : 'bg-[var(--color-surface-base)]',
                      'border',
                      isActive ? 'border-purple-400/50' : 'border-[var(--color-border-subtle)]',
                    )}
                  >
                    {tab.icon}
                  </div>

                  {/* Text */}
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className={cn(
                        'font-semibold',
                        'text-sm',
                        'transition-colors',
                        'duration-300',
                        isActive ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]',
                      )}
                    >
                      {tab.label}
                    </span>
                    <span
                      className={cn(
                        'text-xs',
                        'text-center',
                        'transition-all',
                        'duration-300',
                        'leading-tight',
                        isActive ? 'opacity-90 text-[var(--color-text-primary)]' : 'opacity-0 text-[var(--color-text-tertiary)]',
                        'h-0',
                        'group-hover:h-auto',
                        'group-hover:opacity-100',
                      )}
                    >
                      {tab.description}
                    </span>
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <div className={cn(
                      'absolute',
                      'bottom-0',
                      'left-0',
                      'right-0',
                      'h-0.5',
                      'bg-gradient-to-r',
                      'from-purple-400',
                      'via-pink-400',
                      'to-purple-400',
                      'animate-pulse',
                    )} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-2xl mx-auto w-full px-8 flex-1 flex flex-col min-h-[400px]">
          <div
            className={cn(
              'flex-1',
              'rounded-2xl',
              'overflow-hidden',
              'bg-[var(--color-surface-base)]',
              'border',
              'border-[var(--color-border-subtle)]',
              'backdrop-blur-sm',
              'relative',
            )}
          >
            {/* Upload Panel */}
            {activeTab === 'upload' && (
              <div
                role="tabpanel"
                id="panel-upload"
                className="w-full h-full flex items-center justify-center p-8"
              >
                <FileUploader />
              </div>
            )}

            {/* Text Panel */}
            {activeTab === 'text' && (
              <div
                role="tabpanel"
                id="panel-text"
                className="w-full h-full"
              >
                <div className="h-full p-6">
                  <TextInputArea />
                </div>
              </div>
            )}

            {/* Browse Panel */}
            {activeTab === 'browse' && (
              <div
                role="tabpanel"
                id="panel-browse"
                className="w-full h-full"
              >
                <DocumentBrowserPanel onDocumentLoad={handleDocumentLoad} />
              </div>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="max-w-3xl mx-auto w-full px-8 py-6">
          <p className="text-center text-sm text-[var(--color-text-tertiary)]">
            {activeTab === 'upload' && 'Supports PDF, TXT, MD • Max 10MB'}
            {activeTab === 'text' && 'Paste or type your content • Auto-saved'}
            {activeTab === 'browse' && 'Select from your saved documents'}
          </p>
        </div>
      </div>
    );
  },
);

StageInput.displayName = 'StageInput';
