import { Send, X } from 'lucide-react';
import { useState } from 'react';

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
          className="w-full h-64 p-4 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 focus:outline-none resize-none transition-all duration-200 hover:border-gray-400"
          disabled={isLoading}
        />
        {text && (
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </span>

        <button
          onClick={handleSubmit}
          disabled={!text.trim() || isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl hover:from-primary-700 hover:to-secondary-700 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Analyzing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Analyze Text
            </>
          )}
        </button>
      </div>
    </div>
  );
}
