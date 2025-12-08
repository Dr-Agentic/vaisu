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
    <div className="relative bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl p-8 text-white shadow-strong border-4 border-transparent hover:shadow-glow transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide opacity-90">
              TL;DR
            </h3>
            <span className="px-2 py-1 text-xs font-medium bg-white/20 rounded-full backdrop-blur-sm">
              AI Generated
            </span>
          </div>
          <p className="text-lg leading-relaxed">
            {content}
          </p>
        </div>
        
        <button
          onClick={handleCopy}
          className="flex-shrink-0 p-2 hover:bg-white/20 hover:scale-110 rounded-lg transition-all duration-200"
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
