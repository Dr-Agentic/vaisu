import React from 'react';
import { X, ChevronLeft, ChevronRight, History, RefreshCw } from 'lucide-react';
import { DocumentSearch } from './DocumentSearch';
import { DocumentList } from './DocumentList';
import { useDocumentStore } from '../../stores/documentStore';

interface DocumentHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentHistorySidebar: React.FC<DocumentHistorySidebarProps> = ({
  isOpen,
  onClose
}) => {
  const { fetchDocumentList, isLoadingList } = useDocumentStore();

  const handleRefresh = () => {
    fetchDocumentList();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        aria-label="Document history sidebar"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <History className="text-blue-500" size={20} />
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Document History
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isLoadingList}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors disabled:opacity-50"
              aria-label="Refresh documents"
              title="Refresh documents"
            >
              <RefreshCw
                size={18}
                className={`text-gray-600 dark:text-gray-400 ${isLoadingList ? 'animate-spin' : ''}`}
              />
            </button>
            <button
              onClick={onClose}
              className="lg:hidden p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <DocumentSearch />
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto p-4">
          <DocumentList />
        </div>
      </aside>
    </>
  );
};

// Toggle button for mobile/tablet
export const DocumentHistoryToggle: React.FC<{ onClick: () => void; isOpen: boolean }> = ({
  onClick,
  isOpen
}) => {
  return (
    <button
      onClick={onClick}
      className="lg:hidden fixed left-0 top-20 z-30 bg-blue-500 text-white p-2 rounded-r-lg shadow-lg hover:bg-blue-600 transition-colors"
      aria-label={isOpen ? 'Close document history' : 'Open document history'}
    >
      {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
    </button>
  );
};
