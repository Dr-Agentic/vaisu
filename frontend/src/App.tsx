/**
 * App Component
 *
 * Main application entry point using Stage-based architecture.
 * Integrates the new Electron UI Design System with core application logic.
 *
 * Flow: Welcome → Input → Analysis → Visualization
 */

import { useEffect } from 'react';
import { useDocumentStore } from './stores/documentStore';
import {
  StageContainer,
  Stage,
  StageWelcome,
  StageInput,
  StageAnalysis,
  StageVisualization,
} from './electron/components';
import { ToastContainer } from './electron/components/feedback/ToastContainer';
import { ThemeToggle } from './design-system/components/ThemeToggle';

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
    removeToast
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

  const handleBackFromInput = () => {
    setStage('welcome');
  };

  const handleBackFromVisualization = () => {
    // Clear document and return to welcome
    useDocumentStore.getState().clearDocument();
    setStage('welcome');
  };

  return (
    <StageContainer currentStage={currentStage}>
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Theme Toggle Overlay (Top Right) */}
      <div className="absolute top-6 right-24 z-50">
        <ThemeToggle />
      </div>

      {/* Welcome Stage */}
      <Stage active={currentStage === 'welcome'}>
        <StageWelcome onGetStarted={handleGetStarted} />
      </Stage>

      {/* Input Stage */}
      <Stage active={currentStage === 'input'}>
        <StageInput onBack={handleBackFromInput} />
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
  );
}