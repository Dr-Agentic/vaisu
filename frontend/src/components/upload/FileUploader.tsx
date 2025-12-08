import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText } from 'lucide-react';
import { useDocumentStore } from '../../stores/documentStore';

export function FileUploader() {
  const { uploadDocument, isLoading, progressMessage, progressPercent, addToast } = useDocumentStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      uploadDocument(acceptedFiles[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // uploadDocument is a stable Zustand action

  const onDropRejected = useCallback((fileRejections: any[]) => {
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      const errors = rejection.errors;
      
      if (errors.some((e: any) => e.code === 'file-too-large')) {
        const fileSizeMB = (rejection.file.size / (1024 * 1024)).toFixed(2);
        addToast({
          type: 'error',
          title: 'File too large',
          message: `The file "${rejection.file.name}" is ${fileSizeMB}MB. Maximum size is 1GB.`,
          duration: 0
        });
      } else if (errors.some((e: any) => e.code === 'file-invalid-type')) {
        addToast({
          type: 'error',
          title: 'Invalid file type',
          message: `The file "${rejection.file.name}" is not supported. Please upload .txt, .pdf, or .docx files.`,
          duration: 0
        });
      } else {
        addToast({
          type: 'error',
          title: 'Upload rejected',
          message: errors[0]?.message || 'File could not be uploaded',
          duration: 0
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // addToast is a stable Zustand action

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 1024 * 1024 * 1024, // 1GB
    disabled: isLoading
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-3 border-dashed rounded-xl text-center cursor-pointer
        transition-all duration-200 ease-out
        ${isDragActive 
          ? 'border-primary-500 bg-primary-100 scale-[1.02] shadow-glow animate-pulse-slow' 
          : 'border-gray-300 hover:border-primary-400 hover:bg-gradient-panel hover:shadow-medium hover:scale-[1.01]'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        py-16 px-12
      `}
      style={{
        borderWidth: '3px'
      }}
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
            <p className="text-xs text-gray-400">Maximum file size: 1GB</p>
          </>
        )}
      </div>
    </div>
  );
}
