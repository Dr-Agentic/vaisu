/**
 * Electron UI Components
 *
 * Electron-specific UI components for the desktop application.
 * These components are optimized for Electron and use the SOTA design system.
 */

// Stage System
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
export { StageAnalysis, type StageAnalysisProps } from './StageAnalysis';
export { StageVisualization, type StageVisualizationProps } from './StageVisualization';

// Upload Components
export { FileUploader } from './upload/FileUploader';
export { TextInputArea } from './upload/TextInputArea';

// Visualization Components
export {
  VisualizationSidebar,
  type VisualizationSidebarProps,
  type VisualizationType,
  type VisualizationOption,
} from './VisualizationSidebar';
export { VisualizationRenderer } from './VisualizationRenderer';

// Feedback Components
export { ToastContainer } from './feedback/ToastContainer';
export { Toast } from './feedback/Toast';
export { SkeletonCard } from './feedback/SkeletonCard';

// Document Components
export { DocumentBrowserPanel, type DocumentBrowserPanelProps } from './DocumentBrowserPanel';

// Re-export design system components for convenience
export { Button } from '../../design-system/components/Button';
export { ThemeToggle } from '../../design-system/components/ThemeToggle';
export type { ButtonProps, ButtonVariant, ButtonSize } from '../../design-system/components/Button';
