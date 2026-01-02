import { useState, useEffect, useRef } from 'react';
import { useDocumentStore } from './stores/documentStore';
import { HeroSection } from './components/layout/HeroSection';
import { FileUploader } from './components/upload/FileUploader';
import { TextInputArea } from './components/upload/TextInputArea';
import { TLDRBox } from './components/summary/TLDRBox';
import { ExecutiveSummary } from './components/summary/ExecutiveSummary';
import { VisualizationSelector } from './components/visualizations/VisualizationSelector';
import { VisualizationRenderer } from './components/visualizations/VisualizationRenderer';
import { ToastContainer } from './components/feedback/ToastContainer';
import { SkeletonCard, SkeletonGrid } from './components/feedback/SkeletonCard';
import { DocumentHistorySidebar, DocumentHistoryToggle } from './components/history/DocumentHistorySidebar';
import { ThemeToggle } from './design-system/components/ThemeToggle';
import { FileText, X, AlertCircle, Palette } from 'lucide-react';

function App() {
  const {
    document,
    analysis,
    isLoading,
    isAnalyzing,
    error,
    progressPercent,
    progressMessage,
    toasts,
    clearDocument,
    clearError,
    removeToast
  } = useDocumentStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const uploadSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const hasDocument = document !== null;
  const hasAnalysis = analysis !== null;

  return (
    <div className="min-h-screen bg-[var(--color-background-primary)] flex">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Document History Sidebar */}
      <DocumentHistorySidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar Toggle for Mobile */}
      <DocumentHistoryToggle
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        isOpen={isSidebarOpen}
      />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <header className={`bg-[var(--color-surface-base)] border-b border-[var(--color-border-subtle)] sticky top-0 z-30 transition-shadow duration-200 ${isScrolled ? 'shadow-medium' : 'shadow-soft'}`}>
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-2 rounded-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Vaisu</h1>
                  <p className="text-sm text-[var(--color-text-secondary)]">Text to Visual Intelligence</p>
                </div>
              </div>

              {hasDocument && (
                <button
                  onClick={clearDocument}
                  className="flex items-center gap-2 px-4 py-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)] hover:scale-105 rounded-xl transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                  New Document
                </button>
              )}
              <div className="flex items-center gap-2">
                <ThemeToggle showLabels />
                <a
                  href="/theme-sampler.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)] hover:scale-105 rounded-xl transition-all duration-200"
                >
                  <Palette className="w-4 h-4" />
                  Theme Sampler
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-[color-mix(in_srgb, var(--color-semantic-error-base) 15%, transparent)] border-l-4 border-[var(--color-semantic-error-base)] rounded-xl p-4 flex items-start gap-3 shadow-medium animate-slide-in-right">
              <AlertCircle className="w-5 h-5 text-[var(--color-semantic-error-text)] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[var(--color-semantic-error-text)]">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="text-[var(--color-semantic-error-text)] hover:text-[color-mix(in_srgb, var(--color-semantic-error-text) 70%, black)] hover:scale-110 transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Hero Section */}
          {!hasDocument && (
            <>
              <HeroSection onGetStarted={handleGetStarted} />

              {/* Upload Section */}
              <div ref={uploadSectionRef} className="space-y-8 py-16">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
                    Get Started
                  </h2>
                  <p className="text-lg text-[var(--color-text-secondary)]">
                    Upload a document or paste text to generate interactive visualizations
                  </p>
                </div>

                <FileUploader />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--color-border-base)]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-[var(--color-background-primary)] text-[var(--color-text-secondary)]">OR</span>
                  </div>
                </div>

                <TextInputArea />
              </div>
            </>
          )}

          {/* Analysis Results */}
          {hasDocument && (
            <div className="space-y-8">
              {/* Document Info */}
              <div className="bg-[var(--color-surface-base)] rounded-xl p-6 shadow-medium border border-[var(--color-border-subtle)] hover:shadow-strong hover:-translate-y-1 transition-all duration-250">
                <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">{document.title}</h2>
                <div className="flex gap-4 text-sm text-[var(--color-text-secondary)]">
                  <span>{document.metadata.wordCount.toLocaleString()} words</span>
                  {document.structure?.sections && (
                    <>
                      <span>•</span>
                      <span>{document.structure.sections.length} sections</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{document.metadata.fileType.toUpperCase()}</span>
                </div>
              </div>

              {/* TLDR and Executive Summary - Show as soon as available */}
              {analysis?.tldr && analysis?.executiveSummary && (
                <div className="space-y-6">
                  <TLDRBox content={typeof analysis.tldr === 'string' ? analysis.tldr : analysis.tldr.text} />
                  <ExecutiveSummary summary={analysis.executiveSummary} />
                </div>
              )}

              {/* Loading State with Progress - Show if still analyzing */}
              {(isLoading || isAnalyzing) && !analysis?.tldr && (
                <div className="space-y-6">
                  <SkeletonCard />
                  <SkeletonGrid count={3} />

                  {/* Progress Bar */}
                  <div className="bg-[var(--color-surface-base)] rounded-xl p-6 shadow-medium border border-[var(--color-border-subtle)]">
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--color-interactive-primary-base)]"></div>
                        <p className="text-sm text-[var(--color-text-primary)] font-medium">
                          Analyzing document...
                        </p>
                      </div>

                      <div className="w-full max-w-md space-y-2">
                        <div className="w-full bg-[var(--color-background-secondary)] rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-[var(--color-interactive-primary-base)] to-[var(--color-interactive-secondary-base)] h-full transition-all duration-500 ease-out"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>

                        <div className="text-center">
                          <p className="text-xs text-[var(--color-text-secondary)]">
                            {progressMessage || 'This may take a few moments'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Bar for Visualization Generation - Show when loading individual visualizations */}
              {isLoading && hasAnalysis && progressMessage && (
                <div className="bg-[var(--color-surface-base)] rounded-xl p-6 shadow-medium border border-[var(--color-border-subtle)]">
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--color-interactive-primary-base)]"></div>
                      <p className="text-sm text-[var(--color-text-primary)] font-medium">
                        {progressMessage}
                      </p>
                    </div>

                    <div className="w-full max-w-md">
                      <div className="w-full bg-[var(--color-background-secondary)] rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[var(--color-interactive-primary-base)] to-[var(--color-interactive-secondary-base)] h-full transition-all duration-500 ease-out"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Visualization Section - Show structured view as soon as document is available */}
              {hasDocument && !isLoading && (
                <div className="space-y-6">
                  {hasAnalysis && <VisualizationSelector />}
                  <div className="bg-[var(--color-surface-base)] rounded-xl p-6 shadow-medium border border-[var(--color-border-subtle)]">
                    <VisualizationRenderer />
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-[var(--color-surface-base)] border-t border-[var(--color-border-subtle)] mt-16">
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-sm text-[var(--color-text-secondary)]">
              Vaisu - Powered by AI • Built with React, TypeScript, and OpenRouter
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
