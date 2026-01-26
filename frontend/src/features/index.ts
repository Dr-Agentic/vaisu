/**
 * Features
 *
 * App-specific components with state management and business logic.
 * These components compose primitives and patterns to build features.
 */

// Stage Features
export { StageVisualization, type StageVisualizationProps } from './stages/StageVisualization';

// Document Features
export { DocumentBrowserPanel, type DocumentBrowserPanelProps } from './document/DocumentBrowserPanel';
export { FileUploader } from './document/FileUploader';
export { TextInputArea } from './document/TextInputArea';

// Visualization Features
export { VisualizationRenderer } from './visualization/VisualizationRenderer';
export { VisualizationSidebar, type VisualizationSidebarProps, type VisualizationType, type DocumentSummary } from './visualization/VisualizationSidebar';

// Feedback Features
export { ToastContainer } from './feedback/ToastContainer';
export { Toast, type ToastProps, type ToastType } from './feedback/Toast';
export { SkeletonCard, SkeletonText, SkeletonGrid } from './feedback/SkeletonCard';
