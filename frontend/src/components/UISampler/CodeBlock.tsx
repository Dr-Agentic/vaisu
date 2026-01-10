/**
 * CodeBlock Component
 *
 * Displays formatted code with syntax highlighting and line numbers.
 * WCAG AA compliant with proper contrast and accessibility features.
 *
 * Features:
 * - Syntax highlighting for TypeScript/JavaScript
 * - Line numbers with proper accessibility
 * - Copy-to-clipboard functionality
 * - Collapsible long code blocks
 * - Responsive design
 * - WCAG AA contrast ratios maintained
 */

import { useState } from 'react';

import { Button } from '../primitives/Button';
import { CopyToClipboard } from './CopyToClipboard';

export interface CodeBlockProps {
  /**
   * The code to display
   */
  code: string;
  /**
   * Programming language for syntax highlighting
   * @default "tsx"
   */
  language?: 'tsx' | 'jsx' | 'javascript' | 'typescript' | 'css' | 'html' | 'json';
  /**
   * Whether to show line numbers
   * @default true
   */
  showLineNumbers?: boolean;
  /**
   * Maximum number of lines to show before collapsing
   * @default 20
   */
  maxLines?: number;
  /**
   * Whether to show copy button
   * @default true
   */
  showCopyButton?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Custom title for the code block
   */
  title?: string;
  /**
   * Whether the code block is interactive (focusable)
   * @default false
   */
  interactive?: boolean;
}

/**
 * CodeBlock Component
 *
 * Displays formatted code with syntax highlighting.
 */
export function CodeBlock({
  code,
  language = 'tsx',
  showLineNumbers = true,
  maxLines = 20,
  showCopyButton = true,
  className,
  title,
  interactive = false,
}: CodeBlockProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const lines = code.split('\n');
  const shouldCollapse = lines.length > maxLines;
  const displayLines = isCollapsed && shouldCollapse ? lines.slice(0, maxLines) : lines;

  // Safe syntax highlighting using React elements instead of dangerouslySetInnerHTML
  const highlightSyntax = (text: string, lang: string) => {
    if (lang === 'json') {
      return highlightJSON(text);
    }
    return highlightTSX(text);
  };

  // JSON syntax highlighting with React elements
  const highlightJSON = (text: string) => {
    const tokens = tokenizeJSON(text);
    return tokens.map((token, index) => (
      <span key={index} className={getTokenClass(token.type)}>
        {token.value}
      </span>
    ));
  };

  // TypeScript/JavaScript syntax highlighting with React elements
  const highlightTSX = (text: string) => {
    const tokens = tokenizeTSX(text);
    return tokens.map((token, index) => (
      <span key={index} className={getTokenClass(token.type)}>
        {token.value}
      </span>
    ));
  };

  // Tokenizer for JSON
  const tokenizeJSON = (text: string) => {
    const tokens: Array<{ type: string; value: string }> = [];
    let i = 0;

    while (i < text.length) {
      if (text[i] === '"' && !isEscaped(text, i)) {
        const start = i;
        i++;
        while (i < text.length && (text[i] !== '"' || isEscaped(text, i))) {
          i++;
        }
        if (i < text.length) i++; // Include closing quote
        tokens.push({ type: 'string', value: text.slice(start, i) });
      } else if (/[0-9-]/.test(text[i])) {
        const start = i;
        if (text[i] === '-') i++;
        while (i < text.length && /[0-9.]/.test(text[i])) i++;
        if (i < text.length && (text[i] === 'e' || text[i] === 'E')) {
          i++;
          if (i < text.length && (text[i] === '+' || text[i] === '-')) i++;
          while (i < text.length && /[0-9]/.test(text[i])) i++;
        }
        tokens.push({ type: 'number', value: text.slice(start, i) });
      } else if (text.slice(i, i + 4) === 'true') {
        tokens.push({ type: 'boolean', value: 'true' });
        i += 4;
      } else if (text.slice(i, i + 5) === 'false') {
        tokens.push({ type: 'boolean', value: 'false' });
        i += 5;
      } else if (text.slice(i, i + 4) === 'null') {
        tokens.push({ type: 'null', value: 'null' });
        i += 4;
      } else {
        tokens.push({ type: 'text', value: text[i] });
        i++;
      }
    }

    return tokens;
  };

  // Tokenizer for TypeScript/JavaScript
  const tokenizeTSX = (text: string) => {
    const tokens: Array<{ type: string; value: string }> = [];
    let i = 0;

    while (i < text.length) {
      // Comments
      if (text.slice(i, i + 2) === '//') {
        const start = i;
        while (i < text.length && text[i] !== '\n') i++;
        tokens.push({ type: 'comment', value: text.slice(start, i) });
      } else if (text.slice(i, i + 2) === '/*') {
        const start = i;
        i += 2;
        while (i < text.length - 1 && text.slice(i, i + 2) !== '*/') i++;
        if (i < text.length - 1) i += 2;
        tokens.push({ type: 'comment', value: text.slice(start, i) });
      }
      // Strings
      else if ((text[i] === '"' || text[i] === "'") && !isEscaped(text, i)) {
        const start = i;
        const quote = text[i];
        i++;
        while (i < text.length && (text[i] !== quote || isEscaped(text, i))) i++;
        if (i < text.length) i++; // Include closing quote
        tokens.push({ type: 'string', value: text.slice(start, i) });
      }
      // Keywords and identifiers
      else if (/[a-zA-Z_$]/.test(text[i])) {
        const start = i;
        while (i < text.length && /[a-zA-Z0-9_$]/.test(text[i])) i++;
        const word = text.slice(start, i);
        if (isKeyword(word)) {
          tokens.push({ type: 'keyword', value: word });
        } else if (isBoolean(word)) {
          tokens.push({ type: 'boolean', value: word });
        } else if (isJSXTag(text, i, word)) {
          tokens.push({ type: 'jsx-tag', value: word });
        } else {
          tokens.push({ type: 'identifier', value: word });
        }
      }
      // Numbers
      else if (/[0-9]/.test(text[i])) {
        const start = i;
        while (i < text.length && /[0-9.]/.test(text[i])) i++;
        tokens.push({ type: 'number', value: text.slice(start, i) });
      }
      // JSX tags
      else if (text[i] === '<' && /[a-zA-Z]/.test(text[i + 1])) {
        const start = i;
        i++;
        while (i < text.length && text[i] !== '>') i++;
        if (i < text.length) i++; // Include closing >
        tokens.push({ type: 'jsx-tag', value: text.slice(start, i) });
      }
      else {
        tokens.push({ type: 'text', value: text[i] });
        i++;
      }
    }

    return tokens;
  };

  // Helper functions
  const isEscaped = (text: string, index: number) => {
    let backslashCount = 0;
    let i = index - 1;
    while (i >= 0 && text[i] === '\\') {
      backslashCount++;
      i--;
    }
    return backslashCount % 2 === 1;
  };

  const isKeyword = (word: string) => {
    const keywords = [
      'import', 'export', 'from', 'const', 'let', 'var', 'function', 'class',
      'interface', 'type', 'enum', 'namespace', 'declare', 'default', 'as',
      'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue',
      'return', 'throw', 'try', 'catch', 'finally', 'new', 'this', 'super',
      'extends', 'implements', 'private', 'protected', 'public', 'static',
      'readonly', 'abstract', 'async', 'await', 'yield', 'of', 'in', 'instanceof',
      'typeof', 'void'
    ];
    return keywords.includes(word);
  };

  const isBoolean = (word: string) => word === 'true' || word === 'false';

  const isJSXTag = (text: string, index: number, word: string) => {
    return word[0] === '<' || word.includes('<') || word.includes('>') || word.includes('className') || word.includes('style');
  };

  const getTokenClass = (type: string) => {
    switch (type) {
      case 'comment': return 'text-[var(--color-syntax-comment)]';
      case 'string': return 'text-[var(--color-syntax-string)]';
      case 'keyword': return 'text-[var(--color-syntax-keyword)]';
      case 'boolean': return 'text-[var(--color-syntax-boolean)]';
      case 'null': return 'text-[var(--color-syntax-null)]';
      case 'number': return 'text-[var(--color-syntax-number)]';
      case 'identifier': return 'text-[var(--color-text-primary)]';
      case 'jsx-tag': return 'text-[var(--color-syntax-tag)]';
      case 'jsx-attribute': return 'text-[var(--color-syntax-attribute)]';
      default: return 'text-[var(--color-text-primary)]';
    }
  };

  const highlightedCode = highlightSyntax(code, language);

  const containerClasses = `
    ${className || ''}
    bg-[var(--color-surface-tertiary)]
    border
    border-[var(--color-border-subtle)]
    rounded-lg
    overflow-hidden
    ${interactive ? 'focus:outline-none focus:ring-2 focus:ring-[var(--color-interactive-primary-base)] focus:ring-offset-2 focus:ring-offset-[var(--color-surface-primary)]' : ''}
  `;

  const headerClasses = `
    flex
    items-center
    justify-between
    px-4
    py-2
    bg-[var(--color-surface-secondary)]
    border-b
    border-[var(--color-border-subtle)]
    sticky
    top-0
    z-10
  `;

  const codeContainerClasses = `
    relative
    overflow-x-auto
    ${shouldCollapse && isCollapsed ? 'max-h-96' : ''}
  `;

  const codeContentClasses = `
    font-mono
    text-sm
    leading-relaxed
    ${showLineNumbers ? 'pl-12' : 'px-4'}
    py-4
    ${shouldCollapse && isCollapsed ? 'pb-16' : ''}
  `;

  const lineNumberClasses = `
    absolute
    left-0
    top-0
    bottom-0
    w-10
    bg-[var(--color-surface-tertiary)]
    border-r
    border-[var(--color-border-subtle)]
    text-right
    text-[var(--color-text-tertiary)]
    font-mono
    text-sm
    px-2
    py-4
    select-none
    pointer-events-none
    opacity-75
  `;

  return (
    <div
      className={containerClasses}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={(e) => {
        if (interactive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          // Handle interactive code block behavior
        }
      }}
    >
      {/* Header */}
      {(title || showCopyButton) && (
        <div className={headerClasses}>
          {title && (
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              {title}
            </span>
          )}
          {showCopyButton && (
            <CopyToClipboard
              text={code}
              tooltip="Copy code"
              variant="ghost"
              size="sm"
            />
          )}
        </div>
      )}

      {/* Code Content */}
      <div className={codeContainerClasses}>
        {showLineNumbers && (
          <div className={lineNumberClasses}>
            {displayLines.map((_, index) => (
              <div key={index} className="leading-relaxed">
                {index + 1}
              </div>
            ))}
          </div>
        )}

        <pre
          className={codeContentClasses}
          style={{ whiteSpace: 'pre' }}
          aria-label={title || `${language} code example`}
        >
          <code className="block">
            {highlightedCode}
          </code>
        </pre>

        {/* Collapse/Expand Button */}
        {shouldCollapse && (
          <div className="absolute bottom-2 right-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="bg-[var(--color-surface-secondary)] border border-[var(--color-border-subtle)]"
            >
              {isCollapsed ? 'Show more' : 'Show less'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * InlineCode Component
 *
 * For displaying short code snippets inline with text.
 */
export function InlineCode({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <code
      className={`
        ${className || ''}
        font-mono
        text-sm
        px-2
        py-1
        bg-[var(--color-surface-secondary)]
        border
        border-[var(--color-border-subtle)]
        rounded
        text-[var(--color-text-primary)]
      `}
    >
      {children}
    </code>
  );
}