/**
 * SimpleUISamplerPage Component
 *
 * Simplified UI Sampler main page with minimal scope.
 * Focuses purely on component variants without extensive documentation.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { SimpleSidebar } from '../components/UISampler/SimpleSidebar';
import { SimplePreviewContainer } from '../components/UISampler/SimplePreviewContainer';
import { SimpleButtonSampler } from '../components/UISampler/SimpleButtonSampler';
import { SimpleCardSampler } from '../components/UISampler/SimpleCardSampler';

export type CategoryKey = 'typography' | 'colors' | 'primitives' | 'patterns' | 'visualizations';

export default function SimpleUISamplerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Parse current path to get active category and component
  const pathParts = location.hash.replace('#', '').split('/');
  const activeCategory = (pathParts[0] || 'primitives') as CategoryKey;
  const activeComponent = pathParts[1] || 'button';

  const handleComponentSelect = (componentKey: string) => {
    navigate(`#${activeCategory}/${componentKey}`);
    setIsSidebarOpen(false);
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  // Get component content
  const getComponentContent = () => {
    if (activeCategory === 'primitives') {
      switch (activeComponent) {
        case 'button':
          return <SimpleButtonSampler />;
        case 'card':
          return <SimpleCardSampler />;
        default:
          return (
            <div className="flex items-center justify-center h-48 text-[var(--color-text-secondary)]">
              Component not implemented yet
            </div>
          );
      }
    }

    return (
      <div className="flex items-center justify-center h-48 text-[var(--color-text-secondary)]">
        Category not implemented yet
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface-base)]">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-[var(--color-surface-base)] border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
            Theme Sampler
          </h1>
          <button
            onClick={handleSidebarToggle}
            className="p-2 rounded-lg hover:bg-[var(--color-surface-secondary)] transition-colors"
            aria-label="Toggle navigation"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <SimpleSidebar
          activeCategory={activeCategory}
          activeComponent={activeComponent}
          onComponentSelect={handleComponentSelect}
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={handleSidebarToggle}
        />

        {/* Main Content */}
        <main className="flex-1 lg:ml-80 min-h-screen">
          <div className="container mx-auto py-8 px-4 lg:px-8">
            <SimplePreviewContainer
              title={`${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} - ${activeComponent}`}
            >
              {getComponentContent()}
            </SimplePreviewContainer>
          </div>
        </main>
      </div>
    </div>
  );
}
