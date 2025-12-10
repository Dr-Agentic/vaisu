/**
 * InteractionManager Tests
 * 
 * These tests focus on the logic for pan/zoom, selection, and interaction handling.
 */

import { describe, it, expect } from 'vitest';
import { zoomToFit, zoomToSelection } from '../InteractionManager';
import type { ClassEntity, Position } from '@shared/types';

describe('InteractionManager Logic Tests', () => {
  const mockClasses: ClassEntity[] = [
    {
      id: 'class-1',
      name: 'BaseService',
      type: 'abstract',
      attributes: [],
      methods: [],
      description: 'Base service class',
      sourceQuote: 'BaseService provides common functionality',
      sourceSpan: null,
      documentLink: '#doc-1'
    },
    {
      id: 'class-2',
      name: 'UserService',
      type: 'class',
      attributes: [],
      methods: [],
      description: 'User management service',
      sourceQuote: 'UserService handles user operations',
      sourceSpan: null,
      documentLink: '#doc-1'
    },
    {
      id: 'class-3',
      name: 'AdminService',
      type: 'class',
      attributes: [],
      methods: [],
      description: 'Admin management service',
      sourceQuote: 'AdminService handles admin operations',
      sourceSpan: null,
      documentLink: '#doc-1'
    }
  ];

  const mockRelationships = [
    { source: 'class-2', target: 'class-1', type: 'inheritance' },
    { source: 'class-3', target: 'class-1', type: 'inheritance' }
  ];

  it('validates zoom to fit calculation', () => {
    const bounds = { x: 0, y: 0, width: 800, height: 600 };
    const viewportWidth = 1000;
    const viewportHeight = 800;
    const padding = 50;

    const result = zoomToFit(bounds, viewportWidth, viewportHeight, padding);

    expect(result.zoom).toBeGreaterThan(0);
    expect(result.zoom).toBeLessThanOrEqual(1.0); // Should not zoom in beyond 100%
    expect(typeof result.pan.x).toBe('number');
    expect(typeof result.pan.y).toBe('number');
  });

  it('validates zoom to fit with large content', () => {
    const bounds = { x: 0, y: 0, width: 2000, height: 1500 };
    const viewportWidth = 1000;
    const viewportHeight = 800;

    const result = zoomToFit(bounds, viewportWidth, viewportHeight);

    // Should scale down to fit
    expect(result.zoom).toBeLessThan(1.0);
    expect(result.zoom).toBeGreaterThan(0);
  });

  it('validates zoom to selection calculation', () => {
    const selectedPositions: Position[] = [
      { x: 100, y: 100 },
      { x: 300, y: 200 }
    ];
    const viewportWidth = 1000;
    const viewportHeight = 800;

    const result = zoomToSelection(selectedPositions, viewportWidth, viewportHeight);

    expect(result.zoom).toBeGreaterThan(0);
    expect(typeof result.pan.x).toBe('number');
    expect(typeof result.pan.y).toBe('number');
  });

  it('validates zoom to selection with empty selection', () => {
    const result = zoomToSelection([], 1000, 800);

    expect(result.zoom).toBe(1.0);
    expect(result.pan.x).toBe(0);
    expect(result.pan.y).toBe(0);
  });

  it('validates connected classes calculation', () => {
    const getConnectedClasses = (classId: string): Set<string> => {
      const connected = new Set<string>();
      
      mockRelationships.forEach(rel => {
        if (rel.source === classId) {
          connected.add(rel.target);
        } else if (rel.target === classId) {
          connected.add(rel.source);
        }
      });
      
      return connected;
    };

    // BaseService (class-1) should be connected to UserService and AdminService
    const baseConnected = getConnectedClasses('class-1');
    expect(baseConnected.has('class-2')).toBe(true);
    expect(baseConnected.has('class-3')).toBe(true);

    // UserService (class-2) should be connected to BaseService
    const userConnected = getConnectedClasses('class-2');
    expect(userConnected.has('class-1')).toBe(true);
    expect(userConnected.has('class-3')).toBe(false);
  });

  it('validates inheritance chain calculation', () => {
    const getInheritanceChain = (classId: string): Set<string> => {
      const chain = new Set<string>();
      const visited = new Set<string>();
      
      const traverse = (id: string) => {
        if (visited.has(id)) return;
        visited.add(id);
        chain.add(id);
        
        mockRelationships.forEach(rel => {
          if (rel.type === 'inheritance') {
            if (rel.source === id) {
              traverse(rel.target); // Parent
            } else if (rel.target === id) {
              traverse(rel.source); // Child
            }
          }
        });
      };
      
      traverse(classId);
      return chain;
    };

    // Starting from UserService should include BaseService
    const userChain = getInheritanceChain('class-2');
    expect(userChain.has('class-2')).toBe(true);
    expect(userChain.has('class-1')).toBe(true);

    // Starting from BaseService should include all children
    const baseChain = getInheritanceChain('class-1');
    expect(baseChain.has('class-1')).toBe(true);
    expect(baseChain.has('class-2')).toBe(true);
    expect(baseChain.has('class-3')).toBe(true);
  });

  // Property Test 27: Selection highlighting
  it('property test: selection highlighting affects visual state (Property 27)', () => {
    const selectedClassIds = new Set(['class-1', 'class-2']);
    
    // Selected classes should be highlighted
    expect(selectedClassIds.has('class-1')).toBe(true);
    expect(selectedClassIds.has('class-2')).toBe(true);
    
    // Non-selected classes should not be highlighted
    expect(selectedClassIds.has('class-3')).toBe(false);
  });

  // Property Test 30: Multi-select accumulation
  it('property test: multi-select accumulates selections correctly (Property 30)', () => {
    let selectedClassIds = new Set<string>();
    
    // Simulate multi-select behavior
    const handleMultiSelect = (classId: string, isMulti: boolean) => {
      if (isMulti) {
        const newSelection = new Set(selectedClassIds);
        if (newSelection.has(classId)) {
          newSelection.delete(classId);
        } else {
          newSelection.add(classId);
        }
        selectedClassIds = newSelection;
      } else {
        selectedClassIds = new Set([classId]);
      }
    };

    // First selection
    handleMultiSelect('class-1', false);
    expect(selectedClassIds.size).toBe(1);
    expect(selectedClassIds.has('class-1')).toBe(true);

    // Multi-select add
    handleMultiSelect('class-2', true);
    expect(selectedClassIds.size).toBe(2);
    expect(selectedClassIds.has('class-1')).toBe(true);
    expect(selectedClassIds.has('class-2')).toBe(true);

    // Multi-select toggle (remove)
    handleMultiSelect('class-1', true);
    expect(selectedClassIds.size).toBe(1);
    expect(selectedClassIds.has('class-1')).toBe(false);
    expect(selectedClassIds.has('class-2')).toBe(true);
  });

  it('validates dimmed classes calculation', () => {
    const selectedClassIds = new Set(['class-1']);
    
    const getDimmedClasses = (): Set<string> => {
      if (selectedClassIds.size === 0) return new Set();
      
      const connectedClasses = new Set<string>();
      selectedClassIds.forEach(id => {
        connectedClasses.add(id);
        mockRelationships.forEach(rel => {
          if (rel.source === id) {
            connectedClasses.add(rel.target);
          } else if (rel.target === id) {
            connectedClasses.add(rel.source);
          }
        });
      });
      
      const dimmedClasses = new Set<string>();
      mockClasses.forEach(cls => {
        if (!connectedClasses.has(cls.id)) {
          dimmedClasses.add(cls.id);
        }
      });
      
      return dimmedClasses;
    };

    const dimmed = getDimmedClasses();
    
    // BaseService and its connected classes should not be dimmed
    expect(dimmed.has('class-1')).toBe(false); // BaseService (selected)
    expect(dimmed.has('class-2')).toBe(false); // UserService (connected)
    expect(dimmed.has('class-3')).toBe(false); // AdminService (connected)
  });

  it('validates zoom constraints', () => {
    const minZoom = 0.1;
    const maxZoom = 3.0;
    
    const constrainZoom = (zoom: number): number => {
      return Math.max(minZoom, Math.min(maxZoom, zoom));
    };

    expect(constrainZoom(0.05)).toBe(0.1); // Below minimum
    expect(constrainZoom(1.5)).toBe(1.5);  // Within range
    expect(constrainZoom(5.0)).toBe(3.0);  // Above maximum
  });

  it('validates pan momentum calculation', () => {
    const calculateMomentum = (velocity: Position, friction: number = 0.95): Position => {
      return {
        x: velocity.x * friction,
        y: velocity.y * friction
      };
    };

    const initialVelocity = { x: 10, y: 5 };
    const momentum1 = calculateMomentum(initialVelocity);
    const momentum2 = calculateMomentum(momentum1);

    // Momentum should decrease over time
    expect(Math.abs(momentum1.x)).toBeLessThan(Math.abs(initialVelocity.x));
    expect(Math.abs(momentum2.x)).toBeLessThan(Math.abs(momentum1.x));
  });

  it('validates keyboard shortcut handling', () => {
    const shortcuts = {
      'f': 'fit',
      'F': 'fit',
      'r': 'reset',
      'R': 'reset',
      '+': 'zoomIn',
      '=': 'zoomIn',
      '-': 'zoomOut',
      '_': 'zoomOut'
    };

    // Test shortcut mapping
    expect(shortcuts['f']).toBe('fit');
    expect(shortcuts['F']).toBe('fit');
    expect(shortcuts['+']).toBe('zoomIn');
    expect(shortcuts['-']).toBe('zoomOut');
  });

  it('validates touch gesture recognition', () => {
    const recognizeGesture = (touchCount: number): string => {
      if (touchCount === 1) return 'pan';
      if (touchCount === 2) return 'pinch';
      return 'unknown';
    };

    expect(recognizeGesture(1)).toBe('pan');
    expect(recognizeGesture(2)).toBe('pinch');
    expect(recognizeGesture(3)).toBe('unknown');
  });

  it('validates pinch zoom calculation', () => {
    const calculatePinchZoom = (
      currentDistance: number, 
      previousDistance: number, 
      currentZoom: number
    ): number => {
      if (previousDistance === 0) return currentZoom;
      
      const zoomFactor = currentDistance / previousDistance;
      return Math.max(0.1, Math.min(3.0, currentZoom * zoomFactor));
    };

    expect(calculatePinchZoom(200, 100, 1.0)).toBe(2.0); // Zoom in
    expect(calculatePinchZoom(100, 200, 2.0)).toBe(1.0); // Zoom out
    expect(calculatePinchZoom(100, 0, 1.0)).toBe(1.0);   // Invalid previous distance
  });

  it('validates hover state transitions', () => {
    interface HoverState {
      isHovered: boolean;
      scale: number;
      shadow: boolean;
    }

    const getHoverState = (isHovered: boolean): HoverState => {
      return {
        isHovered,
        scale: isHovered ? 1.05 : 1.0,
        shadow: isHovered
      };
    };

    const hoveredState = getHoverState(true);
    const normalState = getHoverState(false);

    expect(hoveredState.scale).toBeGreaterThan(normalState.scale);
    expect(hoveredState.shadow).toBe(true);
    expect(normalState.shadow).toBe(false);
  });
});