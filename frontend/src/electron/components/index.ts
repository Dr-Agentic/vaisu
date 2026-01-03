/**
 * Electron UI Components
 *
 * Electron-specific UI components for the desktop application.
 * These components are optimized for Electron and use the SOTA design system.
 */

export {
  StageContainer,
  Stage,
  type StageContainerProps,
  type StageProps,
  type StageName,
} from './StageContainer';
export {
  StageIndicators,
  type StageIndicatorsProps,
} from './StageIndicators';
export { StageWelcome, type StageWelcomeProps } from './StageWelcome';
export { StageInput, type StageInputProps } from './StageInput';
export { DocumentBrowserPanel, type DocumentBrowserPanelProps } from './DocumentBrowserPanel';
export { StageAnalysis, type StageAnalysisProps } from './StageAnalysis';
export {
  VisualizationSidebar,
  type VisualizationSidebarProps,
  type VisualizationType,
  type VisualizationOption,
  type DocumentSummary,
} from './VisualizationSidebar';
export { StageVisualization, type StageVisualizationProps } from './StageVisualization';
export { ComponentSampler, type ComponentSamplerProps } from './ComponentSampler';