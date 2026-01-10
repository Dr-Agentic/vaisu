/**
 * UISamplerPage Component
 *
 * Main UI Sampler page that displays all design system components and patterns.
 * Provides interactive examples with live preview functionality.
 *
 * Features:
 * - Sidebar navigation with collapsible sections
 * - Live component previews
 * - Copy-to-clipboard functionality for code examples
 * - WCAG AA compliance verification
 * - Responsive design for all screen sizes
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ThemeProvider } from '../design-system/ThemeProvider';
import { SidebarNavigation, type CategoryKey } from '../components/UISampler/SidebarNavigation';
import { PreviewContainer } from '../components/UISampler/PreviewContainer';
import { TypographySampler } from '../components/UISampler/TypographySampler';
import { ColorPaletteSampler } from '../components/UISampler/ColorPaletteSampler';
import { ButtonSampler } from '../components/UISampler/ButtonSampler';
import { CardSampler } from '../components/UISampler/CardSampler';
import { InputSampler } from '../components/UISampler/InputSampler';
import { ModalSampler } from '../components/UISampler/ModalSampler';
import { TooltipSampler } from '../components/UISampler/TooltipSampler';
import { BadgeSpinnerThemeSampler } from '../components/UISampler/BadgeSpinnerThemeSampler';
import { PatternSampler } from '../components/UISampler/PatternSampler';
import { VisualizationSampler } from '../components/UISampler/VisualizationOverview';
import { ToastContainer } from '../features/feedback/ToastContainer';
import { useDocumentStore } from '../stores/documentStore';

/**
 * UISamplerPage Component
 *
 * Main container for the UI Sampler with sidebar navigation and content area.
 */
export default function UISamplerPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('typography');
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toasts, removeToast } = useDocumentStore();

  // Close sidebar on mobile when component is selected
  useEffect(() => {
    if (activeComponent && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [activeComponent]);

  // Reset component when category changes
  useEffect(() => {
    setActiveComponent(null);
  }, [activeCategory]);

  // Parse URL search parameters to set active category/component
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const category = urlParams.get('category');
    const component = urlParams.get('component');

    if (category && isValidCategory(category as CategoryKey)) {
      setActiveCategory(category as CategoryKey);
      if (component) {
        setActiveComponent(component);
      }
    }
  }, [location.search]);

  const isValidCategory = (category: string): category is CategoryKey => {
    return ['typography', 'colors', 'primitives', 'patterns', 'visualizations'].includes(category);
  };

  const handleCategoryChange = (category: CategoryKey) => {
    setActiveCategory(category);
    setActiveComponent(null);
    // Use URL parameters instead of hash for cleaner navigation
    navigate(`/ui-sampler?category=${category}`, { replace: true });
  };

  const handleComponentSelect = (componentKey: string) => {
    setActiveComponent(componentKey);
    // Use URL parameters instead of hash for cleaner navigation
    navigate(`/ui-sampler?category=${activeCategory}&component=${componentKey}`, { replace: true });
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const getActiveComponent = () => {
    if (!activeComponent) return null;

    switch (activeCategory) {
      case 'typography':
        return TypographySampler;
      case 'colors':
        return ColorPaletteSampler;
      case 'primitives':
        // For primitives, we'll show a component picker
        return null;
      case 'patterns':
        return PatternSampler;
      case 'visualizations':
        return VisualizationSampler;
      default:
        return null;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[var(--color-surface-base)]">
        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onClose={removeToast} />

        {/* Layout Container */}
        <div className="flex min-h-screen">
          {/* Sidebar Navigation */}
          <SidebarNavigation
            activeCategory={activeCategory}
            activeComponent={activeComponent}
            onCategoryChange={handleCategoryChange}
            onComponentSelect={handleComponentSelect}
            isSidebarOpen={isSidebarOpen}
            onSidebarToggle={handleSidebarToggle}
            className="hidden lg:block"
          />

          {/* Mobile Sidebar Overlay */}
          {isSidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm">
              <SidebarNavigation
                activeCategory={activeCategory}
                activeComponent={activeComponent}
                onCategoryChange={handleCategoryChange}
                onComponentSelect={handleComponentSelect}
                isSidebarOpen={isSidebarOpen}
                onSidebarToggle={handleSidebarToggle}
                className="w-80 bg-[var(--color-surface-base)] h-full shadow-xl"
              />
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1 lg:ml-0 transition-all duration-300 ease-in-out">
            {/* Mobile Header */}
            <div className="lg:hidden sticky top-0 z-40 bg-[var(--color-surface-base)] border-b border-[var(--color-border-subtle)]">
              <div className="flex items-center justify-between p-4">
                <button
                  onClick={handleSidebarToggle}
                  className="p-2 rounded-lg hover:bg-[var(--color-surface-secondary)] transition-colors"
                  aria-label="Toggle navigation"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  UI Sampler
                </h1>
                <div className="w-6" />
              </div>
            </div>

            {/* Content */}
            <div className="p-6 lg:p-8">
              {/* Category Header */}
              <div className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold text-[var(--color-text-primary)] mb-2">
                  UI Sampler
                </h1>
                <p className="text-[var(--color-text-secondary)] text-lg">
                  Interactive design system components and patterns
                </p>
              </div>

              {/* Component Content */}
              <PreviewContainer>
                {activeComponent ? (
                  // Individual component view
                  <div className="space-y-6">
                    <div className="border-b border-[var(--color-border-subtle)] pb-4">
                      <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        {activeComponent}
                      </h2>
                      <p className="text-[var(--color-text-secondary)] mt-2">
                        Interactive preview and code examples
                      </p>
                    </div>
                    {getActiveComponent() && React.createElement(getActiveComponent()!)}
                  </div>
                ) : (
                  // Category overview
                  <div className="space-y-6">
                    {activeCategory === 'typography' && <TypographySampler />}
                    {activeCategory === 'colors' && <ColorPaletteSampler />}
                    {activeCategory === 'primitives' && (
                      <div className="space-y-6">
                        <div className="border-b border-[var(--color-border-subtle)] pb-4">
                          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                            Primitive Components
                          </h2>
                          <p className="text-[var(--color-text-secondary)] mt-2">
                            Fundamental building blocks for your interface
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <ButtonSampler />
                          <CardSampler />
                          <InputSampler />
                          <ModalSampler />
                          <TooltipSampler />
                          <BadgeSpinnerThemeSampler />
                        </div>
                      </div>
                    )}
                    {activeCategory === 'patterns' && <PatternSampler />}
                    {activeCategory === 'visualizations' && <VisualizationSampler />}
                  </div>
                )}
              </PreviewContainer>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}