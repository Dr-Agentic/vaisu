/**
 * AppElectron Component
 *
 * New Vaisu UI (Electron) with stage-based architecture.
 * Flow: Welcome → Input → Analysis → Visualization
 *
 * @example
 * ```tsx
 * <AppElectron />
 * ```
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
} from './design-system/components';

/**
 * AppElectron
 *
 * Main app component for Electron UI.
 * Manages stage transitions and integrates all stage components.
 */
export default function AppElectron() {
  const {
    currentStage,
    setStage,
    document,
    isAnalyzing,
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
