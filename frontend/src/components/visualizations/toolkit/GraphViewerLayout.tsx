import React from 'react';

import { useTheme } from '@/design-system/ThemeProvider';

interface GraphViewerLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const GraphViewerLayout: React.FC<GraphViewerLayoutProps> = ({
  title,
  description,
  children,
  actions,
}) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  return (
    <div className={`flex flex-col h-full w-full overflow-hidden ${isDarkMode ? 'bg-[#0A0A0A]' : 'bg-[#FAFAFA]'}`}>
      {/* Header Section */}
      <header className="flex-none px-6 py-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-base)]">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[var(--color-text-primary)] tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm text-[var(--color-text-secondary)] max-w-2xl">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </header>

      {/* Main Visualization Area */}
      <main className="flex-1 relative">
        {children}
      </main>
    </div>
  );
};
