import { Send, X } from 'lucide-react';
import { useState } from 'react';

import { useDocumentStore } from '../../stores/documentStore';
import { Button, Badge } from '@/components/primitives';
import { cn } from '@/lib/utils';

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
    <div className="space-y-4 h-full flex flex-col">
      <div className="relative flex-1">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your text content here for analysis..."
          className={cn(
            "w-full h-full min-h-[200px] p-4 rounded-xl border-2 transition-all duration-200 outline-none resize-none bg-[var(--color-surface-base)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)]",
            "focus:border-[var(--color-border-strong)] focus:ring-1 focus:ring-[var(--color-border-strong)]",
            "hover:border-[var(--color-border-strong)]"
          )}
          style={{
            '--tw-placeholder-color': 'var(--color-text-tertiary)'
          } as React.CSSProperties}
          disabled={isLoading}
        />
        {text && !isLoading && (
          <button
            onClick={handleClear}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-[var(--color-surface-elevated)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors border border-[var(--color-border-subtle)]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="neutral" className="text-[10px] uppercase">
            {wordCount.toLocaleString()} {wordCount === 1 ? 'word' : 'words'}
          </Badge>
          {wordCount > 0 && wordCount < 10 && (
            <span className="text-[10px] text-[var(--color-text-tertiary)] italic">
              Min 10 words recommended
            </span>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          variant="aurora"
          disabled={!text.trim() || isLoading || wordCount < 3}
          loading={isLoading}
          leftIcon={<Send className="w-4 h-4" />}
        >
          Analyze Text
        </Button>
      </div>
    </div>
  );
}
