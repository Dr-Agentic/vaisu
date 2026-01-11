/**
 * SimpleSidebar Component
 *
 * Simplified sidebar navigation with minimal scope focused on component variants.
 * Just category names and component names, no descriptions or extensive documentation.
 */

import { useState } from 'react';

import { Button } from '../primitives/Button';

export type CategoryKey = 'typography' | 'colors' | 'primitives' | 'patterns' | 'visualizations';

export interface SimpleSidebarProps {
  activeCategory: CategoryKey;
  activeComponent: string | null;
  onComponentSelect: (componentKey: string) => void;
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
  className?: string;
}

export function SimpleSidebar({
  activeCategory,
  activeComponent,
  onComponentSelect,
  isSidebarOpen,
  onSidebarToggle,
  className,
}: SimpleSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<CategoryKey, boolean>>({
    typography: true,
    colors: true,
    primitives: true,
    patterns: true,
    visualizations: true,
  });

  const categories = [
    {
      key: 'typography' as CategoryKey,
      title: 'Typography',
      components: [
        { key: 'font-sizes', title: 'Font Sizes' },
        { key: 'font-weights', title: 'Font Weights' },
        { key: 'line-heights', title: 'Line Heights' },
      ],
    },
    {
      key: 'colors' as CategoryKey,
      title: 'Colors',
      components: [
        { key: 'primary', title: 'Primary Colors' },
        { key: 'secondary', title: 'Secondary Colors' },
        { key: 'accent', title: 'Accent Colors' },
        { key: 'semantic', title: 'Semantic Colors' },
        { key: 'gradients', title: 'Gradients' },
      ],
    },
    {
      key: 'primitives' as CategoryKey,
      title: 'Components',
      components: [
        { key: 'button', title: 'Button' },
        { key: 'card', title: 'Card' },
        { key: 'input', title: 'Input' },
        { key: 'modal', title: 'Modal' },
        { key: 'tooltip', title: 'Tooltip' },
        { key: 'badge', title: 'Badge' },
        { key: 'spinner', title: 'Spinner' },
        { key: 'theme-toggle', title: 'Theme Toggle' },
      ],
    },
    {
      key: 'patterns' as CategoryKey,
      title: 'Patterns',
      components: [
        { key: 'stage-container', title: 'Stage Container' },
        { key: 'stage-indicators', title: 'Stage Indicators' },
        { key: 'tab-group', title: 'Tab Group' },
      ],
    },
    {
      key: 'visualizations' as CategoryKey,
      title: 'Visualizations',
      components: [
        { key: 'mind-map', title: 'Mind Map' },
        { key: 'flowchart', title: 'Flowchart' },
        { key: 'knowledge-graph', title: 'Knowledge Graph' },
        { key: 'uml-class', title: 'UML Class Diagram' },
        { key: 'executive-dashboard', title: 'Executive Dashboard' },
      ],
    },
  ];

  const handleSectionToggle = (_category: CategoryKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [_category]: !prev[_category],
    }));
  };

  const sidebarClasses = `
    ${className || ''}
    lg:w-80
    w-80
    bg-[var(--color-surface-base)]
    border-r
    border-[var(--color-border-subtle)]
    flex
    flex-col
    h-full
    sticky
    top-0
    overflow-y-auto
    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    lg:translate-x-0
  `;

  const sectionHeaderClasses = `
    flex
    items-center
    justify-between
    px-4
    py-3
    cursor-pointer
    hover:bg-[var(--color-surface-secondary)]
    transition-colors
    duration-200
    border-b
    border-[var(--color-border-subtle)]
  `;

  const sectionTitleClasses = `
    font-medium
    text-[var(--color-text-primary)]
  `;

  const sectionActiveClasses = `
    bg-[var(--color-surface-secondary)]
    border-l-4
    border-[var(--color-interactive-primary-base)]
  `;

  const componentItemClasses = `
    px-6
    py-2
    text-sm
    text-[var(--color-text-secondary)]
    hover:text-[var(--color-text-primary)]
    hover:bg-[var(--color-surface-tertiary)]
    cursor-pointer
    transition-colors
    duration-200
    rounded-r-lg
    border-l-2
    border-transparent
  `;

  const componentActiveClasses = `
    bg-[var(--color-surface-secondary)]
    text-[var(--color-text-primary)]
    border-l-[var(--color-interactive-primary-base)]
    font-medium
  `;

  return (
    <div
      className={sidebarClasses}
      role="navigation"
      aria-label="Simple UI Navigation"
    >
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-secondary)]">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Navigation
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSidebarToggle}
          aria-label="Close navigation"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>

      {/* Categories */}
      <nav className="flex-1 py-4 space-y-1">
        {categories.map((category) => (
          <div key={category.key} className="border-b border-[var(--color-border-subtle)] last:border-b-0">
            {/* Section Header */}
            <button
              type="button"
              className={`
                ${sectionHeaderClasses}
                ${activeCategory === category.key ? sectionActiveClasses : ''}
              `}
              onClick={() => handleSectionToggle(category.key)}
              aria-expanded={expandedSections[category.key]}
              aria-controls={`section-${category.key}-content`}
            >
              <span className={sectionTitleClasses}>
                {category.title}
              </span>
              <svg
                className={`
                  w-5 h-5
                  text-[var(--color-text-tertiary)]
                  transition-transform
                  duration-200
                  ${expandedSections[category.key] ? 'rotate-180' : 'rotate-0'}
                `}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Section Content */}
            <div
              id={`section-${category.key}-content`}
              className={`
                overflow-hidden
                transition-all
                duration-300
                ease-in-out
                ${expandedSections[category.key]
                  ? 'max-h-[1000px] opacity-100'
                  : 'max-h-0 opacity-0'
                }
              `}
            >
              <div className="py-2 space-y-1">
                {category.components.map((component) => (
                  <button
                    key={component.key}
                    type="button"
                    className={`
                      ${componentItemClasses}
                      ${activeComponent === component.key ? componentActiveClasses : ''}
                    `}
                    onClick={() => onComponentSelect(component.key)}
                  >
                    {component.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}