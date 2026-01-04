/**
 * ComponentSampler Demo Page
 *
 * Standalone demo page for testing the ComponentSampler component.
 * This can be used to showcase all Electron UI components and test readability.
 */

import { useEffect } from 'react';

/**
 * ComponentSamplerDemo
 *
 * Demo page that renders the ComponentSampler in isolation.
 * Useful for design system testing and component validation.
 */
export function ComponentSamplerDemo() {
  // Set document title
  useEffect(() => {
    document.title = 'Vaisu - Component Sampler';
  }, []);

  return (
    <div className="component-sampler-demo">
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Component Sampler Demo</h1>
        <p className="text-gray-600">ComponentSampler has been removed from the application.</p>
      </div>
    </div>
  );
}

export default ComponentSamplerDemo;