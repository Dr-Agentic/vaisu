import React from 'react';
import { useDocumentStore } from './stores/documentStore';
import { FileUploader } from './components/upload/FileUploader';
import { TextInputArea } from './components/upload/TextInputArea';
import { TLDRBox } from './components/summary/TLDRBox';
import { ExecutiveSummary } from './components/summary/ExecutiveSummary';
import { VisualizationSelector } from './components/visualizations/VisualizationSelector';
import { VisualizationRenderer } from './components/visualizations/VisualizationRenderer';
import { FileText, X, AlertCircle } from 'lucide-react';

function App() {
  const { document, analysis, isLoading, isAnalyzing, error, clearDocument, clearError } = useDocumentStore();

  const hasDocument = document !== null;
  const hasAnalysis = analysis !== null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-2 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vaisu</h1>
                <p className="text-sm text-gray-600">Text to Visual Intelligence</p>
              </div>
            </div>

            {hasDocument && (
              <button
                onClick={clearDocument}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                New Document
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Upload Section */}
        {!hasDocument && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Transform Text into Visual Insights
              </h2>
              <p className="text-lg text-gray-600">
                Upload a document or paste text to generate interactive visualizations
              </p>
            </div>

            <FileUploader />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 text-gray-500">OR</span>
              </div>
            </div>

            <TextInputArea />
          </div>
        )}

        {/* Analysis Results */}
        {hasDocument && (
          <div className="space-y-8">
            {/* Document Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{document.title}</h2>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>{document.metadata.wordCount.toLocaleString()} words</span>
                <span>•</span>
                <span>{document.structure.sections.length} sections</span>
                <span>•</span>
                <span>{document.metadata.fileType.toUpperCase()}</span>
              </div>
            </div>

            {/* Loading State */}
            {(isLoading || isAnalyzing) && (
              <div className="bg-white rounded-lg p-12 shadow-sm border border-gray-200">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                  <p className="text-lg text-gray-600">
                    {isAnalyzing ? 'Analyzing document...' : 'Processing...'}
                  </p>
                  <p className="text-sm text-gray-500">
                    This may take a few moments
                  </p>
                </div>
              </div>
            )}

            {/* TLDR and Executive Summary */}
            {hasAnalysis && (
              <div className="space-y-6">
                <TLDRBox content={analysis.tldr} />
                <ExecutiveSummary summary={analysis.executiveSummary} />
              </div>
            )}

            {/* Visualization Section */}
            {hasAnalysis && (
              <div className="space-y-6">
                <VisualizationSelector />
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <VisualizationRenderer />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            Vaisu - Powered by AI • Built with React, TypeScript, and OpenRouter
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
