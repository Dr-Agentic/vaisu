/**
 * DocumentBrowserPanel Component
 *
 * Panel for browsing existing documents from the database.
 * Features search, document list with SOTA design system styling.
 *
 * @example
 * ```tsx
 * <DocumentBrowserPanel onDocumentLoad={(id) => loadDocumentById(id)} />
 * ```
 */

import { useEffect, useState, useCallback, memo } from 'react';
import { Search, FileX, Loader2, FileText, Clock } from 'lucide-react';
import { useDocumentStore } from '../../stores/documentStore';
import type { DocumentListItem as DocumentListItemType } from '../../stores/documentStore';
import { cn } from '../../lib/utils';
import { List as VirtualizedList } from 'react-virtualized';

export interface DocumentBrowserPanelProps {
  /**
   * Callback when a document is selected
   */
  onDocumentLoad: (id: string) => Promise<void>;
}

/**
 * DocumentBrowserPanel
 *
 * Document browser with search and SOTA void theme styling.
 * Uses mesh glow effects and aurora gradients for interactive states.
 */
export const DocumentBrowserPanel = ({ onDocumentLoad }: DocumentBrowserPanelProps) => {
  const {
    documentList,
    isLoadingList,
    fetchDocumentList,
    searchDocuments,
    document: currentDocument
  } = useDocumentStore();

  const [searchQuery, setSearchQueryState] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Fetch documents on mount and when search changes
  useEffect(() => {
    const fetchDocs = async () => {
      if (debouncedQuery.trim()) {
        await searchDocuments(debouncedQuery);
      } else {
        await fetchDocumentList();
      }
    };
    fetchDocs();
  }, [debouncedQuery, fetchDocumentList, searchDocuments]);

  const getFileIcon = useCallback((fileType: string): string => {
    if (fileType.includes('pdf')) return '📕';
    if (fileType.includes('docx') || fileType.includes('word')) return '📘';
    if (fileType.includes('md')) return '📝';
    return '📄';
  }, []);

  const formatDate = useCallback((date: Date | string): string => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  const getTLDRText = useCallback((tldr?: { text?: string } | string): string => {
    if (!tldr) return '';
    if (typeof tldr === 'string') return tldr;
    return tldr.text || '';
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQueryState(e.target.value);
  }, []);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Search Bar */}
      <div
        className={cn(
          'relative',
          'transition-all',
          'duration-[var(--duration-fast)]'
        )}
        style={{
          backgroundColor: 'var(--color-surface-base)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <Search
          className={cn(
            'absolute',
            'left-4',
            'top-1/2',
            '-translate-y-1/2',
            'transition-colors',
            'duration-[var(--duration-fast)]'
          )}
          style={{
            width: '20px',
            height: '20px',
            color: 'var(--color-text-secondary)',
          }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search documents..."
          className={cn(
            'w-full',
            'pl-12',
            'pr-4',
            'py-3',
            'bg-transparent',
            'outline-none',
            'transition-colors',
            'duration-[var(--duration-fast)]'
          )}
          style={{
            color: 'var(--color-text-primary)',
            fontSize: 'var(--font-size-base)',
            '--tw-placeholder-color': 'var(--color-text-tertiary)',
          } as React.CSSProperties}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQueryState('')}
            className={cn(
              'absolute',
              'right-3',
              'top-1/2',
              '-translate-y-1/2',
              'p-1',
              'rounded-sm',
              'hover:bg-white/10',
              'transition-colors',
              'duration-[var(--duration-fast)]'
            )}
            aria-label="Clear search"
          >
            <span style={{ color: 'var(--color-text-tertiary)', fontSize: '18px' }}>
              ×
            </span>
          </button>
        )}
      </div>

      {/* Document List */}
      <div
        className={cn(
          'flex-1',
          'overflow-y-auto',
          'pr-2',
          'custom-scrollbar'
        )}
        style={{
          maxHeight: 'calc(100vh - 250px)',
        }}
      >
        {isLoadingList ? (
          <div
            className={cn(
              'flex',
              'flex-col',
              'items-center',
              'justify-center',
              'py-16',
              'gap-4'
            )}
          >
            <Loader2
              className="animate-spin"
              style={{
                width: '32px',
                height: '32px',
                color: 'var(--aurora-1)',
              }}
            />
            <span
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              Loading documents...
            </span>
          </div>
        ) : documentList.length === 0 ? (
          <div
            className={cn(
              'flex',
              'flex-col',
              'items-center',
              'justify-center',
              'py-16',
              'px-4',
              'text-center'
            )}
          >
            <FileX
              style={{
                width: '48px',
                height: '48px',
                color: 'var(--color-text-tertiary)',
                marginBottom: 'var(--space-md)',
              }}
            />
            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-base)',
              }}
            >
              {searchQuery ? 'No documents found' : 'No documents yet'}
            </p>
            {searchQuery && (
              <p
                style={{
                  color: 'var(--color-text-tertiary)',
                  fontSize: 'var(--font-size-sm)',
                  marginTop: 'var(--space-xs)',
                }}
              >
                Try a different search term
              </p>
            )}
          </div>
        ) : (
          <DocumentList
            documents={documentList}
            currentDocumentId={currentDocument?.id}
            onDocumentLoad={onDocumentLoad}
            getFileIcon={getFileIcon}
            formatDate={formatDate}
            getTLDRText={getTLDRText}
          />
        )}
      </div>
    </div>
  );
};

/**
 * DocumentList - Virtualized document list component
 */
interface DocumentListProps {
  documents: DocumentListItemType[];
  currentDocumentId?: string;
  onDocumentLoad: (id: string) => void;
  getFileIcon: (fileType: string) => string;
  formatDate: (date: Date | string) => string;
  getTLDRText: (tldr?: { text?: string } | string) => string;
}

const DocumentList = memo<DocumentListProps>(({ documents, currentDocumentId, onDocumentLoad, getFileIcon, formatDate, getTLDRText }) => {
  const rowHeight = 120; // Fixed height for virtualization
  const overscanRowCount = 5; // Render extra rows for smooth scrolling

  const rowRenderer = ({ index, key, style }: { index: number; key: string; style: React.CSSProperties }) => {
    const doc = documents[index];
    const isActive = currentDocumentId === doc.id;
    const tldrText = getTLDRText(doc.tldr);
    const fileIcon = getFileIcon(doc.fileType);
    const formattedDate = formatDate(doc.uploadDate);

    return (
      <div key={key} style={style}>
        <DocumentListItem
          document={doc}
          isActive={isActive}
          fileIcon={fileIcon}
          formattedDate={formattedDate}
          tldrText={tldrText}
          onClick={() => onDocumentLoad(doc.id)}
        />
      </div>
    );
  };

  return (
    <VirtualizedList
      width={1000}
      height={Math.min(documents.length * rowHeight, 600)}
      rowCount={documents.length}
      rowHeight={rowHeight}
      rowRenderer={rowRenderer}
      overscanRowCount={overscanRowCount}
      className="overflow-y-auto"
      // Pass documents prop to force re-render when list changes
      // This fixes potential stale closure issues where rowRenderer might not be re-evaluated
      // by VirtualizedList if rowCount remains the same but content changes.
      documents={documents}
    />
  );
});

DocumentList.displayName = 'DocumentList';

/**
 * DocumentListItem - Internal component for individual document items
 */
interface DocumentListItemProps {
  document: DocumentListItemType;
  isActive: boolean;
  fileIcon: string;
  formattedDate: string;
  tldrText: string;
  onClick: () => void;
}

const DocumentListItem = memo<DocumentListItemProps>(({ document, isActive, fileIcon, formattedDate, tldrText, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full',
        'text-left',
        'p-4',
        'transition-all',
        'duration-[var(--duration-normal)]',
        'group',
        'outline-none'
      )}
      style={{
        backgroundColor: isActive
          ? 'rgba(99, 102, 241, 0.15)'
          : 'var(--color-surface-base)',
        border: '1px solid',
        borderColor: isActive
          ? 'var(--aurora-1)'
          : 'var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
        boxShadow: isActive
          ? '0 0 20px rgba(99, 102, 241, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          : 'none',
        marginBottom: '12px',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.borderColor = 'var(--color-border-strong)';
          e.currentTarget.style.backgroundColor = 'var(--color-surface-elevated)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
          e.currentTarget.style.backgroundColor = 'var(--color-surface-base)';
        }
      }}
      aria-label={`Load document: ${document.title}`}
      aria-pressed={isActive}
    >
      <div className={cn('flex', 'items-start', 'gap-3')}>
        {/* File Icon */}
        <span
          className={cn(
            'text-2xl',
            'flex-shrink-0',
            'mt-0.5',
            'transition-transform',
            'duration-[var(--duration-fast)]',
            'group-hover:scale-110'
          )}
          role="img"
          aria-label={`${document.fileType} file`}
        >
          {fileIcon}
        </span>

        {/* Content */}
        <div className={cn('flex-1', 'min-w-0')}>
          {/* Header: Title and Date */}
          <div
            className={cn(
              'flex',
              'items-start',
              'justify-between',
              'gap-3',
              'mb-2'
            )}
          >
            <h3
              className="truncate"
              style={{
                color: isActive ? 'var(--aurora-2)' : 'var(--color-text-primary)',
                fontSize: 'var(--font-size-base)',
                fontWeight: isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
                lineHeight: 'var(--line-height-tight)',
              }}
            >
              {document.title}
            </h3>
            <span 
              className="font-mono opacity-40 text-[10px] ml-2 shrink-0"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              ID: {document.id}
            </span>
            <div
              className={cn(
                'flex',
                'items-center',
                'gap-1',
                'flex-shrink-0'
              )}
              style={{
                color: 'var(--color-text-tertiary)',
                fontSize: 'var(--font-size-xs)',
              }}
            >
              <Clock size={12} />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* TL;DR Preview */}
          {tldrText && (
            <p
              className="line-clamp-2 mb-2"
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-sm)',
                lineHeight: 'var(--line-height-normal)',
              }}
            >
              {tldrText}
            </p>
          )}

          {/* Footer: Word Count and File Type */}
          <div
            className={cn(
              'flex',
              'items-center',
              'gap-3'
            )}
            style={{
              color: 'var(--color-text-tertiary)',
              fontSize: 'var(--font-size-xs)',
            }}
          >
            <div className={cn('flex', 'items-center', 'gap-1.5')}>
              <FileText size={12} />
              <span>{document.wordCount.toLocaleString()} words</span>
            </div>
            <span
              style={{
                padding: '2px 8px',
                backgroundColor: isActive
                  ? 'rgba(99, 102, 241, 0.2)'
                  : 'rgba(255, 255, 255, 0.05)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid',
                borderColor: isActive
                  ? 'var(--aurora-1)'
                  : 'var(--color-border-subtle)',
              }}
            >
              {document.fileType.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Active Indicator */}
        {isActive && (
          <div
            className={cn(
              'flex-shrink-0',
              'w-1.5',
              'h-1.5',
              'rounded-full'
            )}
            style={{
              backgroundColor: 'var(--aurora-2)',
              boxShadow: '0 0 8px var(--aurora-2)',
              marginTop: '6px',
            }}
          />
        )}
      </div>
    </button>
  );
});

DocumentListItem.displayName = 'DocumentListItem';

DocumentBrowserPanel.displayName = 'DocumentBrowserPanel';
