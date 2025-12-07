import React from 'react';
import type { DocumentListItem as DocumentListItemType } from '../../stores/documentStore';

interface DocumentListItemProps {
  document: DocumentListItemType;
  isActive: boolean;
  onClick: () => void;
}

const getFileIcon = (fileType: string) => {
  if (fileType.includes('pdf')) return '📕';
  if (fileType.includes('docx') || fileType.includes('word')) return '📘';
  return '📄';
};

const formatDate = (date: Date | string) => {
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
};

export const DocumentListItem: React.FC<DocumentListItemProps> = ({
  document,
  isActive,
  onClick
}) => {
  const fileIcon = getFileIcon(document.fileType);
  const formattedDate = formatDate(document.uploadDate);

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-3 rounded-lg transition-all
        ${isActive 
          ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500' 
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm'
        }
      `}
      aria-label={`Load document: ${document.title}`}
    >
      <div className="flex items-start gap-2">
        <span className="text-xl flex-shrink-0 mt-0.5" role="img" aria-label={`${document.fileType} file`}>
          {fileIcon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">
              {document.title}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
              {formattedDate}
            </span>
          </div>
          
          {document.tldr && (
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-1">
              {typeof document.tldr === 'string' ? document.tldr : document.tldr.text}
            </p>
          )}
          
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
            <span>{document.wordCount.toLocaleString()} words</span>
          </div>
        </div>
      </div>
    </button>
  );
};
