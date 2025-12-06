import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText } from 'lucide-react';
import { useDocumentStore } from '../../stores/documentStore';

export function FileUploader() {
  const { uploadDocument, isLoading, progressMessage, progressPercent } = useDocumentStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      uploadDocument(acceptedFiles[0]);
    }
  }, [uploadDocument]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isLoading
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
        transition-all duration-200
        ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center gap-4">
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <div className="text-center space-y-2">
              <p className="text-lg text-gray-900 font-medium">Processing document...</p>
              {progressPercent > 0 && (
                <>
                  <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
                    <div 
                      className="bg-primary-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">{progressMessage}</p>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <Upload className="w-12 h-12 text-primary-600" />
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Drop your file here' : 'Drag & drop a document'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                or click to browse
              </p>
            </div>
            <div className="flex gap-2 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                .txt
              </span>
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                .pdf
              </span>
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                .docx
              </span>
            </div>
            <p className="text-xs text-gray-400">Maximum file size: 10MB</p>
          </>
        )}
      </div>
    </div>
  );
}
