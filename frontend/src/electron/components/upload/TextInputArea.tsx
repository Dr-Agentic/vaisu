import { useState } from 'react';
import { Send, X } from 'lucide-react';
import { useDocumentStore } from '../../../stores/documentStore';

export function TextInputArea() {
  const [text, setText] = useState('');
  const { uploadText, isLoading } = useDocumentStore();

  const handleSubmit = () => {
    if (text.trim()) {
      uploadText(text);
    }
  };

  const handleClear = () => {
    setText('');
  };

  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Or paste your text here..."
          className="w-full h-[var(--spacing-64)] p-[var(--spacing-lg)] border-2 border-[var(--color-border-subtle)] rounded-[var(--radius-xl)] focus:border-[var(--aurora-1)] focus:ring-2 focus:ring-[var(--aurora-1)] focus:ring-opacity-20 focus:outline-none resize-none transition-all duration-[var(--motion-duration-base)] hover:border-[var(--color-border-strong)]"
          disabled={isLoading}
        />
        {text && (
          <button
            onClick={handleClear}
            className="absolute top-[var(--spacing-sm)] right-[var(--spacing-sm)] p-[var(--spacing-sm)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
            disabled={isLoading}
          >
            <X className="w-[var(--spacing-lg)] h-[var(--spacing-lg)]" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </span>

        <button
          onClick={handleSubmit}
          disabled={!text.trim() || isLoading}
          className="flex items-center gap-[var(--spacing-sm)] px-[var(--spacing-lg)] py-[var(--spacing-base)] bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-secondary-600)] text-white rounded-[var(--radius-xl)] hover:from-[var(--color-primary-700)] hover:to-[var(--color-secondary-700)] hover:scale-[1.02] hover:shadow-[var(--elevation-lg)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-[var(--motion-duration-base)] ease-[var(--motion-easing-ease-out)]"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-[var(--spacing-lg)] w-[var(--spacing-lg)] border-b-2 border-white" />
              Analyzing...
            </>
          ) : (
            <>
              <Send className="w-[var(--spacing-lg)] h-[var(--spacing-lg)]" />
              Analyze Text
            </>
          )}
        </button>
      </div>
    </div>
  );
}
