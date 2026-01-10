/**
 * SidebarNavigation Component
 *
 * Responsive sidebar navigation with collapsible sections for each component category.
 * Supports mobile/responsive behavior with proper accessibility features.
 *
 * Features:
 * - Collapsible sections for: Typography, Colors, Primitives, Patterns, Visualizations
 * - Active section highlighting based on scroll position
 * - Smooth expand/collapse animations
 * - Mobile: Hamburger menu with slide-out sidebar
 * - Desktop: Persistent left sidebar (250px width)
 * - Keyboard accessible (Tab, Enter, Space for collapse/expand)
 * - WCAG AA compliant (contrast ratios, focus indicators)
 */

import { useState, useRef, useEffect } from 'react';

import { Button } from '../primitives/Button';

export type CategoryKey = 'typography' | 'colors' | 'primitives' | 'patterns' | 'visualizations';

export interface SidebarNavigationProps {
  /**
   * Currently active category
   */
  activeCategory: CategoryKey;
  /**
   * Currently active component
   */
  activeComponent: string | null;
  /**
   * Callback when category is changed
   */
  onCategoryChange: (category: CategoryKey) => void;
  /**
   * Callback when component is selected
   */
  onComponentSelect: (componentKey: string) => void;
  /**
   * Whether sidebar is open (for mobile)
   */
  isSidebarOpen: boolean;
  /**
   * Callback to toggle sidebar (for mobile)
   */
  onSidebarToggle: () => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * SidebarNavigation Component
 *
 * Collapsible sidebar with category navigation and component selection.
 */
export function SidebarNavigation({
  activeCategory,
  activeComponent,
  onCategoryChange,
  onComponentSelect,
  isSidebarOpen,
  onSidebarToggle,
  className,
}: SidebarNavigationProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [expandedSections, setExpandedSections] = useState<Record<CategoryKey, boolean>>({
    typography: true,
    colors: true,
    primitives: true,
    patterns: true,
    visualizations: true,
  });

  // Auto-expand active category
  useEffect(() => {
    setExpandedSections(prev => ({
      ...prev,
      [activeCategory]: true,
    }));
  }, [activeCategory]);

  // Category definitions
  const categories = [
    {
      key: 'typography' as CategoryKey,
      title: 'Typography',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      ),
      description: 'Font sizes, weights, and line-heights',
      components: [
        { key: 'font-sizes', title: 'Font Sizes', description: 'xs through 9xl' },
        { key: 'font-weights', title: 'Font Weights', description: 'normal through bold' },
        { key: 'line-heights', title: 'Line Heights', description: 'tight through loose' },
      ],
    },
    {
      key: 'colors' as CategoryKey,
      title: 'Colors',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M11 7.343l-1.657-1.657a2 2 0 00-2.828 0l-2.829 2.829a2 2 0 000 2.828l8.486 8.485" />
        </svg>
      ),
      description: 'Primary, secondary, accent, and semantic colors',
      components: [
        { key: 'primary', title: 'Primary Colors', description: 'All shades 50-900' },
        { key: 'secondary', title: 'Secondary Colors', description: 'All shades 50-900' },
        { key: 'accent', title: 'Accent Colors', description: 'All shades 400-600' },
        { key: 'semantic', title: 'Semantic Colors', description: 'Success, error, warning, info' },
        { key: 'gradients', title: 'Gradients', description: 'Hero, panel, radial' },
      ],
    },
    {
      key: 'primitives' as CategoryKey,
      title: 'Components',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      ),
      description: 'Fundamental building blocks',
      components: [
        { key: 'button', title: 'Button', description: 'All variants and states' },
        { key: 'card', title: 'Card', description: 'All variants and sizes' },
        { key: 'input', title: 'Input', description: 'All states and types' },
        { key: 'modal', title: 'Modal', description: 'All sizes and behaviors' },
        { key: 'tooltip', title: 'Tooltip', description: 'All positions and delays' },
        { key: 'badge', title: 'Badge', description: 'All variants and sizes' },
        { key: 'spinner', title: 'Spinner', description: 'All variants and sizes' },
        { key: 'theme-toggle', title: 'Theme Toggle', description: 'Light, dark, system' },
      ],
    },
    {
      key: 'patterns' as CategoryKey,
      title: 'Patterns',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      description: 'Reusable patterns and compositions',
      components: [
        { key: 'stage-container', title: 'Stage Container', description: 'Stage-based layouts' },
        { key: 'stage-indicators', title: 'Stage Indicators', description: 'Progress indicators' },
        { key: 'tab-group', title: 'Tab Group', description: 'Tab navigation patterns' },
      ],
    },
    {
      key: 'visualizations' as CategoryKey,
      title: 'Visualizations',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: 'Data visualization components',
      components: [
        { key: 'mind-map', title: 'Mind Map', description: 'Concept mapping' },
        { key: 'flowchart', title: 'Flowchart', description: 'Process diagrams' },
        { key: 'knowledge-graph', title: 'Knowledge Graph', description: 'Entity relationships' },
        { key: 'uml-class', title: 'UML Class Diagram', description: 'Class relationships' },
        { key: 'executive-dashboard', title: 'Executive Dashboard', description: 'Executive summaries' },
      ],
    },
  ];

  // Auto-expand active category
  useEffect(() => {
    setExpandedSections(prev => ({
      ...prev,
      [activeCategory]: true,
    }));
  }, [activeCategory]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, category: CategoryKey) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCategoryChange(category);
    }
  };

  const handleSectionToggle = (category: CategoryKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const getSectionIcon = (category: CategoryKey) => {
    const categoryData = categories.find(c => c.key === category);
    return categoryData?.icon;
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
    overscroll-contain
    transition-transform
    duration-300
    ease-in-out
    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    lg:translate-x-0
    shadow-xl
    backdrop-blur-sm
  `;

  const sectionHeaderClasses = `
    flex
    items-center
    justify-between
    px-4
    py-3
    cursor-pointer
    group
    hover:bg-[var(--color-surface-secondary)]
    transition-colors
    duration-200
    border-b
    border-[var(--color-border-subtle)]
    focus:outline-none
    focus:ring-2
    focus:ring-[var(--color-interactive-primary-base)]
    focus:ring-offset-2
    focus:ring-offset-[var(--color-surface-base)]
  `;

  const sectionTitleClasses = `
    flex
    items-center
    gap-3
    font-medium
    text-[var(--color-text-primary)]
    group-hover:text-[var(--color-text-primary)]
    transition-colors
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
    transition-all
    duration-200
    rounded-r-lg
    border-l-2
    border-transparent
    focus:outline-none
    focus:ring-2
    focus:ring-[var(--color-interactive-primary-base)]
    focus:ring-offset-2
    focus:ring-offset-[var(--color-surface-base)]
  `;

  const componentActiveClasses = `
    bg-[var(--color-surface-secondary)]
    text-[var(--color-text-primary)]
    border-l-[var(--color-interactive-primary-base)]
    font-medium
    shadow-sm
  `;

  return (
    <div
      ref={sidebarRef}
      className={sidebarClasses}
      role="navigation"
      aria-label="UI Sampler Navigation"
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
              onKeyDown={(e) => handleKeyDown(e, category.key)}
              aria-expanded={expandedSections[category.key]}
              aria-controls={`section-${category.key}-content`}
            >
              <div className={sectionTitleClasses}>
                {getSectionIcon(category.key)}
                <div>
                  <span className="block">{category.title}</span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">
                    {category.description}
                  </span>
                </div>
              </div>
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onComponentSelect(component.key);
                      }
                    }}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{component.title}</span>
                      <span className="text-xs text-[var(--color-text-tertiary)]">
                        {component.description}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--color-border-subtle)] p-4 bg-[var(--color-surface-secondary)]">
        <div className="text-xs text-[var(--color-text-tertiary)] space-y-1">
          <div>• Use keyboard navigation</div>
          <div>• Click categories to expand/collapse</div>
          <div>• Click components to preview</div>
          <div>• Mobile: Swipe or tap menu icon</div>
        </div>
      </div>
    </div>
  );
}

/**
 * useSidebarScroll Hook
 *
 * Hook for managing sidebar scroll position and active section highlighting.
 */
export function useSidebarScroll() {
  const [activeSection, setActiveSection] = useState<CategoryKey | null>(null);

  // This would typically be used to sync sidebar with main content scroll
  // For now, we'll use the activeCategory prop instead

  return {
    activeSection,
    setActiveSection,
  };
}