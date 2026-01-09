/**
 * App Component
 *
 * Main application entry point using Stage-based architecture.
 * Integrates the new Electron UI Design System with core application logic.
 *
 * Flow: Welcome → Input → Analysis → Visualization
 */

import { useEffect } from 'react';

import { StageContainer, Stage } from './components/patterns';
import { ThemeProvider } from './design-system/ThemeProvider';
import {
  StageWelcome,
  StageInput,
  StageAnalysis,
  StageVisualization,
  ToastContainer,
} from './features';
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
    <ThemeProvider>
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
    </ThemeProvider>
  );
}
