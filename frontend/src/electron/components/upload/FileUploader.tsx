import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText } from 'lucide-react';
import { useDocumentStore } from '../../../stores/documentStore';
import { Card } from '../../../design-system/components/Card';
import { cn } from '../../../lib/utils';

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
          message: `The file "${rejection.file.name}" is not supported. Please upload .txt, .pdf, or .md files.`,
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
      'text/markdown': ['.md']
    },
    maxFiles: 1,
    maxSize: 1024 * 1024 * 1024, // 1GB
    disabled: isLoading
  });

  return (
    <Card
      {...getRootProps()}
      variant={isDragActive ? 'elevated' : 'base'}
      padding="xl"
      interactive={!isLoading}
      className={cn(
        'border-2 border-dashed cursor-pointer text-center transition-all duration-[var(--motion-duration-base)] ease-[var(--motion-easing-ease-out)]',
        isDragActive && 'scale-[1.01] shadow-[var(--elevation-lg)]',
        isLoading && 'opacity-50 cursor-not-allowed',
        'hover:border-[var(--color-border-strong)]'
      )}
      style={{
        borderColor: isDragActive
          ? 'var(--aurora-1)'
          : 'var(--color-border-base)',
        backgroundColor: isDragActive
          ? 'rgba(99, 102, 241, 0.05)'
          : 'var(--color-surface-base)',
      }}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center gap-[var(--spacing-lg)]">
        {isLoading ? (
          <>
            <div
              className="inline-block animate-spin rounded-full border-4 border-current border-t-transparent"
              style={{
                width: 'var(--spacing-12xl)',
                height: 'var(--spacing-12xl)',
                color: 'var(--aurora-1)',
                borderColor: 'var(--aurora-1) transparent var(--aurora-1) transparent',
              }}
              aria-hidden="true"
            />
            <div className="text-center space-y-[var(--spacing-sm)]">
              <p
                className="text-[var(--font-size-lg)] font-[var(--font-weight-semibold)] text-[var(--color-text-primary)]"
              >
                Processing document...
              </p>
              {progressPercent > 0 && (
                <>
                  <div
                    className="w-[var(--spacing-5xl)] h-[var(--spacing-xs)] rounded-full mx-auto"
                    style={{
                      backgroundColor: 'var(--color-surface-elevated)',
                      border: '1px solid var(--color-border-subtle)',
                    }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-[var(--motion-duration-base)] ease-[var(--motion-easing-ease-out)]"
                      style={{
                        width: `${progressPercent}%`,
                        backgroundColor: 'var(--aurora-1)',
                      }}
                    />
                  </div>
                  <p
                    className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]"
                  >
                    {progressMessage}
                  </p>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <Upload
              className="w-[var(--spacing-12xl)] h-[var(--spacing-12xl)]"
              style={{
                color: 'var(--aurora-1)',
              }}
            />
            <div className="text-center">
              <p
                className="text-[var(--font-size-lg)] font-[var(--font-weight-semibold)] text-[var(--color-text-primary)]"
              >
                {isDragActive ? 'Drop your file here' : 'Drag & drop a document'}
              </p>
              <p
                className="text-[var(--font-size-sm)] mt-[var(--spacing-xs)] text-[var(--color-text-secondary)]"
              >
                or click to browse
              </p>
            </div>
            <div className="flex gap-[var(--spacing-sm)] text-[var(--font-size-xs)] text-[var(--color-text-tertiary)]">
              <span className="flex items-center gap-[var(--spacing-xs)]">
                <FileText className="w-3 h-3" />
                .txt
              </span>
              <span className="flex items-center gap-[var(--spacing-xs)]">
                <FileText className="w-3 h-3" />
                .pdf
              </span>
              <span className="flex items-center gap-[var(--spacing-xs)]">
                <FileText className="w-3 h-3" />
                .md
              </span>
            </div>
            <p
              className="text-[var(--font-size-xs)] text-[var(--color-text-tertiary)]"
            >
              Maximum file size: 1GB
            </p>
          </>
        )}
      </div>
    </Card>
  );
}
