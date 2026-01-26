/**
 * Component Library - Main Exports
 *
 * Central export for all reusable components.
 * Import from this file to access the component library.
 *
 * @example
 * ```tsx
 * import { Button, Card, TabGroup, StageContainer } from '@/components';
 * ```
 */

// Primitives (Atoms)
export * from './primitives';

// Patterns (Molecules)
export * from './patterns';

// Visualizations (Composite visualization components)
export * from './visualizations';

// Type re-exports for convenience

export type { TabItem } from './patterns/TabGroup';
