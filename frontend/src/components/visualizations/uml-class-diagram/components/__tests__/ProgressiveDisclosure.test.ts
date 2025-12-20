/**
 * ProgressiveDisclosure Tests
 * 
 * These tests focus on the logic for zoom-based visibility and progressive disclosure.
 */

import { describe, it, expect } from 'vitest';
import {
  getVisibilityConfig,
  getFontSize,
  getLineThickness,
  shouldUseScrollableCompartment,
  formatMethodSignature,
  formatAttributeSignature
} from '../ProgressiveDisclosure';
import type { ClassEntity } from '@shared/types';

describe('ProgressiveDisclosure Logic Tests', () => {
  const mockMethod: ClassEntity['methods'][0] = {
    id: 'method-1',
    name: 'authenticate',
    returnType: 'boolean',
    visibility: 'public' as const,
    isStatic: false,
    isAbstract: false,
    parameters: [
      { name: 'username', type: 'String' },
      { name: 'password', type: 'String' }
    ]
  };

  const mockAttribute: ClassEntity['attributes'][0] = {
    id: 'attr-1',
    name: 'userRepository',
    type: 'UserRepository',
    visibility: 'private' as const,
    isStatic: false,
    defaultValue: 'new UserRepository()'
  };

  // Property Test 24: Zoom-based attribute visibility
  it('property test: attributes visibility follows zoom thresholds (Property 24)', () => {
    // Below 0.6x zoom - no attributes
    expect(getVisibilityConfig(0.5).showAttributes).toBe(false);

    // Between 0.6x-0.9x zoom - show attributes
    expect(getVisibilityConfig(0.7).showAttributes).toBe(true);
    expect(getVisibilityConfig(0.8).showAttributes).toBe(true);

    // Above 0.9x zoom - show attributes
    expect(getVisibilityConfig(1.0).showAttributes).toBe(true);
    expect(getVisibilityConfig(1.5).showAttributes).toBe(true);
  });

  // Property Test 25: Zoom-based method visibility
  it('property test: methods visibility follows zoom thresholds (Property 25)', () => {
    // Below 0.9x zoom - no methods
    expect(getVisibilityConfig(0.5).showMethods).toBe(false);
    expect(getVisibilityConfig(0.8).showMethods).toBe(false);

    // Above 0.9x zoom - show methods
    expect(getVisibilityConfig(0.9).showMethods).toBe(true);
    expect(getVisibilityConfig(1.0).showMethods).toBe(true);
    expect(getVisibilityConfig(1.5).showMethods).toBe(true);
  });

  // Property Test 26: Zoom-based edge label visibility
  it('property test: edge labels visibility follows zoom thresholds (Property 26)', () => {
    // Below 1.5x zoom - no edge labels
    expect(getVisibilityConfig(0.5).showEdgeLabels).toBe(false);
    expect(getVisibilityConfig(1.0).showEdgeLabels).toBe(false);
    expect(getVisibilityConfig(1.4).showEdgeLabels).toBe(false);

    // Above 1.5x zoom - show edge labels
    expect(getVisibilityConfig(1.5).showEdgeLabels).toBe(true);
    expect(getVisibilityConfig(2.0).showEdgeLabels).toBe(true);
  });

  it('validates font size scaling with zoom', () => {
    expect(getFontSize(0.5, 12)).toBe(8); // Minimum font size
    expect(getFontSize(1.0, 12)).toBe(12); // Base font size
    expect(getFontSize(1.5, 12)).toBe(18); // Maximum font size
    expect(getFontSize(2.0, 12)).toBe(18); // Clamped to maximum
  });

  it('validates line thickness scaling with zoom', () => {
    expect(getLineThickness(0.5, 1)).toBe(1); // Minimum thickness
    expect(getLineThickness(1.0, 1)).toBe(1); // Base thickness
    expect(getLineThickness(2.0, 1)).toBe(2); // Scaled thickness
    expect(getLineThickness(3.0, 1)).toBe(3); // Maximum thickness
  });

  it('validates scrollable compartment logic', () => {
    // Small member count - no scrolling needed
    expect(shouldUseScrollableCompartment(5, 1.0)).toBe(false);

    // Large member count at normal zoom - needs scrolling
    expect(shouldUseScrollableCompartment(15, 1.0)).toBe(true);

    // Large member count at high zoom - higher threshold
    expect(shouldUseScrollableCompartment(12, 1.3)).toBe(false);
    expect(shouldUseScrollableCompartment(20, 1.3)).toBe(true);
  });

  it('validates method signature formatting with parameter names', () => {
    const config = { showParameterNames: true, showAttributes: true, showMethods: true, showDetails: false, showEdgeLabels: false };
    const signature = formatMethodSignature(mockMethod, config);

    expect(signature).toContain('+'); // Public visibility
    expect(signature).toContain('authenticate');
    expect(signature).toContain('username: String');
    expect(signature).toContain('password: String');
    expect(signature).toContain('boolean');
  });

  it('validates method signature formatting without parameter names', () => {

    const config = { showParameterNames: false, showAttributes: true, showMethods: true, showDetails: false, showEdgeLabels: false };
    const signature = formatMethodSignature(mockMethod, config);

    expect(signature).toContain('+'); // Public visibility
    expect(signature).toContain('authenticate');
    expect(signature).toContain('2 params'); // Parameter count instead of names
    expect(signature).toContain('boolean');
    expect(signature).not.toContain('username');
  });

  it('validates static method formatting', () => {
    const staticMethod = { ...mockMethod, isStatic: true };
    const config = { showParameterNames: true, showAttributes: true, showMethods: true, showDetails: false, showEdgeLabels: false };
    const signature = formatMethodSignature(staticMethod, config);

    expect(signature).toContain('<u>'); // Underlined for static
    expect(signature).toContain('</u>');
  });

  it('validates abstract method formatting', () => {
    const abstractMethod = { ...mockMethod, isAbstract: true };
    const config = { showParameterNames: true, showAttributes: true, showMethods: true, showDetails: false, showEdgeLabels: false };
    const signature = formatMethodSignature(abstractMethod, config);

    expect(signature).toContain('<i>'); // Italicized for abstract
    expect(signature).toContain('</i>');
  });

  it('validates attribute signature formatting with default value', () => {
    const config = { showDetails: true, showParameterNames: false, showAttributes: true, showMethods: true, showEdgeLabels: false };
    const signature = formatAttributeSignature(mockAttribute, config);

    expect(signature).toContain('-'); // Private visibility
    expect(signature).toContain('userRepository');
    expect(signature).toContain('UserRepository');
    expect(signature).toContain('new UserRepository()'); // Default value
  });

  it('validates attribute signature formatting without default value', () => {
    const config = { showDetails: false, showParameterNames: false, showAttributes: true, showMethods: true, showEdgeLabels: false };
    const signature = formatAttributeSignature(mockAttribute, config);

    expect(signature).toContain('-'); // Private visibility
    expect(signature).toContain('userRepository');
    expect(signature).toContain('UserRepository');
    expect(signature).not.toContain('new UserRepository()'); // No default value
  });

  it('validates static attribute formatting', () => {
    const staticAttribute = { ...mockAttribute, isStatic: true };
    const config = { showDetails: false, showParameterNames: false, showAttributes: true, showMethods: true, showEdgeLabels: false };
    const signature = formatAttributeSignature(staticAttribute, config);

    expect(signature).toContain('<u>'); // Underlined for static
    expect(signature).toContain('</u>');
  });

  it('validates visibility symbol mapping', () => {
    const publicMethod = { ...mockMethod, visibility: 'public' as const };
    const privateMethod = { ...mockMethod, visibility: 'private' as const };
    const protectedMethod = { ...mockMethod, visibility: 'protected' as const };
    const packageMethod = { ...mockMethod, visibility: 'package' as const };

    const config = { showParameterNames: false, showDetails: false, showAttributes: true, showMethods: true, showEdgeLabels: false };

    expect(formatMethodSignature(publicMethod, config)).toContain('+');
    expect(formatMethodSignature(privateMethod, config)).toContain('-');
    expect(formatMethodSignature(protectedMethod, config)).toContain('#');
    expect(formatMethodSignature(packageMethod, config)).toContain('~');
  });

  it('validates progressive disclosure thresholds are consistent', () => {
    // Test that thresholds are in ascending order
    const zoomLevels = [0.5, 0.6, 0.9, 1.5, 2.0];
    let previousAttributesVisible = false;
    let previousMethodsVisible = false;
    let previousDetailsVisible = false;

    zoomLevels.forEach(zoom => {
      const config = getVisibilityConfig(zoom);

      // Attributes should only become visible, never disappear
      if (previousAttributesVisible) {
        expect(config.showAttributes).toBe(true);
      }
      previousAttributesVisible = config.showAttributes;

      // Methods should only become visible, never disappear
      if (previousMethodsVisible) {
        expect(config.showMethods).toBe(true);
      }
      previousMethodsVisible = config.showMethods;

      // Details should only become visible, never disappear
      if (previousDetailsVisible) {
        expect(config.showDetails).toBe(true);
      }
      previousDetailsVisible = config.showDetails;
    });
  });

  it('validates enhanced details visibility', () => {
    const lowZoomConfig = getVisibilityConfig(1.0);
    const highZoomConfig = getVisibilityConfig(1.6);

    expect(lowZoomConfig.showDetails).toBe(false);
    expect(lowZoomConfig.showParameterNames).toBe(false);

    expect(highZoomConfig.showDetails).toBe(true);
    expect(highZoomConfig.showParameterNames).toBe(true);
  });

  it('validates zoom transition smoothness', () => {
    // Font sizes should change gradually
    const zoom1 = getFontSize(1.0, 12);
    const zoom2 = getFontSize(1.1, 12);
    const zoom3 = getFontSize(1.2, 12);

    expect(zoom2).toBeGreaterThanOrEqual(zoom1);
    expect(zoom3).toBeGreaterThanOrEqual(zoom2);

    // Line thickness should change gradually
    const thickness1 = getLineThickness(1.0, 1);
    const thickness2 = getLineThickness(1.5, 1);
    const thickness3 = getLineThickness(2.0, 1);

    expect(thickness2).toBeGreaterThanOrEqual(thickness1);
    expect(thickness3).toBeGreaterThanOrEqual(thickness2);
  });
});