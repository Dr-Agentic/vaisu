import React, { useEffect } from 'react';
import { useDocumentStore } from '../../stores/documentStore';
import { DocumentListItem } from './DocumentListItem';
import { Loader2, FileX } from 'lucide-react';

export const DocumentList: React.FC = () => {
  const { 
    documentList, 
    isLoadingList, 
    document: currentDocument,
    fetchDocumentList,
    loadDocumentById,
    searchQuery
  } = useDocumentStore();

  useEffect(() => {
    fetchDocumentList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // fetchDocumentList is a stable Zustand action

  if (isLoadingList) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin text-blue-500" size={24} />
      </div>
    );
  }

  if (documentList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <FileX className="text-gray-400 mb-2" size={32} />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {searchQuery ? 'No documents found' : 'No documents yet'}
        </p>
        {searchQuery && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Try a different search term
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documentList.map((doc) => (
        <DocumentListItem
          key={doc.id}
          document={doc}
          isActive={currentDocument?.id === doc.id}
          onClick={() => loadDocumentById(doc.id)}
        />
      ))}
    </div>
  );
};
