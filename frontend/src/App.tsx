/**
 * App Component
 *
 * Main application entry point using Stage-based architecture.
 * Integrates the new Electron UI Design System with core application logic.
 *
 * Flow: Welcome → Input → Analysis → Visualization
 * Plus: UI Sampler route for design system exploration
 */

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { StageContainer, Stage } from './components/patterns';
import { ThemeProvider } from './design-system/ThemeProvider';
import { ThemeSwitcher } from './components/UISampler/ThemeSwitcher';
import {
  StageWelcome,
  StageInput,
  StageAnalysis,
  StageVisualization,
  ToastContainer,
} from './features';
import UISamplerPage from './pages/UISamplerPage';
import { useDocumentStore } from './stores/documentStore';

/**
 * App
 *
 * Main app component that manages stage transitions and integrates all stage components.
 */
export default function App() {
  const {
    currentStage,
    setStage,
    document,
    isAnalyzing,
    toasts,
    removeToast,
  } = useDocumentStore();

  // Auto-transition to analysis stage when document is uploaded and analysis starts
  useEffect(() => {
    if (document && isAnalyzing && currentStage === 'input') {
      setStage('analysis');
    }
  }, [document, isAnalyzing, currentStage, setStage]);

  // Auto-transition to visualization stage when analysis completes
  useEffect(() => {
    if (document && !isAnalyzing && currentStage === 'analysis') {
      setStage('visualization');
    }
  }, [document, isAnalyzing, currentStage, setStage]);

  // Stage transition handlers
  const handleGetStarted = () => {
    setStage('input');
  };

  const handleBackFromVisualization = () => {
    // Clear document and return to welcome
    useDocumentStore.getState().clearDocument();
    setStage('welcome');
  };

  return (
    <Router>
      <ThemeProvider>
        <div className="relative min-h-screen">
          {/* Floating Theme Switcher for Main App */}
          <div className="hidden lg:block fixed top-6 right-6 z-50">
            <ThemeSwitcher />
          </div>

          <Routes>
            {/* Main application routes */}
            <Route path="/" element={
              <StageContainer currentStage={currentStage}>
                {/* Toast Notifications */}
                <ToastContainer toasts={toasts} onClose={removeToast} />

                {/* Welcome Stage */}
                <Stage active={currentStage === 'welcome'}>
                  <StageWelcome onGetStarted={handleGetStarted} />
                </Stage>

                {/* Input Stage */}
                <Stage active={currentStage === 'input'}>
                  <StageInput />
                </Stage>

                {/* Analysis Stage */}
                <Stage active={currentStage === 'analysis'}>
                  <StageAnalysis />
                </Stage>

                {/* Visualization Stage */}
                <Stage active={currentStage === 'visualization'}>
                  <StageVisualization onBack={handleBackFromVisualization} />
                </Stage>
              </StageContainer>
            } />

            {/* UI Sampler route */}
            <Route path="/ui-sampler" element={<UISamplerPage />} />

            {/* Redirect unknown routes to main app */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </ThemeProvider>
    </Router>
  );
}
