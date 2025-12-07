import React, { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useDocumentStore } from '../../stores/documentStore';

export const DocumentSearch: React.FC = () => {
  const { searchQuery, setSearchQuery, searchDocuments } = useDocumentStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Debounce search
  const debounceTimeout = React.useRef<NodeJS.Timeout>();

  const handleSearch = useCallback((query: string) => {
    setLocalQuery(query);
    setSearchQuery(query);
    
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    debounceTimeout.current = setTimeout(() => {
      searchDocuments(query);
    }, 300);
  }, [searchDocuments, setSearchQuery]);

  const handleClear = () => {
    setLocalQuery('');
    setSearchQuery('');
    searchDocuments('');
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
          size={18}
          aria-hidden="true"
        />
        <input
          type="text"
          value={localQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search documents..."
          className="w-full pl-10 pr-10 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          aria-label="Search documents by name, TLDR, or summary"
        />
        {localQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};
