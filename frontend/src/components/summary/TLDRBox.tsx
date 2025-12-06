import React from 'react';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface TLDRBoxProps {
  content: string;
}

export function TLDRBox({ content }: TLDRBoxProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg p-6 text-white shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide mb-2 opacity-90">
            TL;DR
          </h3>
          <p className="text-lg leading-relaxed">
            {content}
          </p>
        </div>
        
        <button
          onClick={handleCopy}
          className="flex-shrink-0 p-2 hover:bg-white/20 rounded-lg transition-colors"
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="w-5 h-5" />
          ) : (
            <Copy className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
