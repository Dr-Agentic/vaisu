/**
 * ComponentSampler Demo Page
 *
 * Standalone demo page for testing the ComponentSampler component.
 * This can be used to showcase all Electron UI components and test readability.
 */

import { useEffect } from 'react';
import { ComponentSampler } from './components/ComponentSampler';

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
      <ComponentSampler />
    </div>
  );
}

export default ComponentSamplerDemo;