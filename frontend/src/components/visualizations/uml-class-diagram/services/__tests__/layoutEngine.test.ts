/**
 * LayoutEngine Tests
 * 
 * These tests focus on the logic and algorithms for UML diagram layout computation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { layoutEngine } from '../layoutEngine';
import type { ClassEntity, UMLRelationship } from '@shared/types';

describe('LayoutEngine Logic Tests', () => {
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

  const mockRelationships: UMLRelationship[] = [
    {
      id: 'rel-1',
      source: 'class-2',
      target: 'class-1',
      type: 'inheritance',
      description: 'UserService extends BaseService'
    },
    {
      id: 'rel-2',
      source: 'class-3',
      target: 'class-1',
      type: 'inheritance',
      description: 'AdminService extends BaseService'
    }
  ];

  beforeEach(() => {
    layoutEngine.clearCache();
  });

  it('validates layout computation with hierarchical algorithm', async () => {
    const result = await layoutEngine.compute(mockClasses, mockRelationships, {
      algorithm: 'hierarchical',
      direction: 'TB'
    });

    expect(result.positions.size).toBe(3);
    expect(result.bounds.width).toBeGreaterThan(0);
    expect(result.bounds.height).toBeGreaterThan(0);
    expect(typeof result.computationTime).toBe('number');
  });

  it('validates grid layout fallback', async () => {
    const result = await layoutEngine.compute(mockClasses, [], {
      algorithm: 'force-directed' // Will fallback to grid
    });

    expect(result.positions.size).toBe(3);
    expect(result.bounds.width).toBeGreaterThan(0);
    expect(result.bounds.height).toBeGreaterThan(0);
  });

  // Property Test 19: Top-to-bottom hierarchical ordering
  it('property test: hierarchical layout maintains top-to-bottom ordering (Property 19)', async () => {
    const result = await layoutEngine.compute(mockClasses, mockRelationships, {
      algorithm: 'hierarchical',
      direction: 'TB'
    });

    const baseServicePos = result.positions.get('class-1');
    const userServicePos = result.positions.get('class-2');
    const adminServicePos = result.positions.get('class-3');

    expect(baseServicePos).toBeDefined();
    expect(userServicePos).toBeDefined();
    expect(adminServicePos).toBeDefined();

    // Parent (BaseService) should be above children in TB layout
    expect(baseServicePos!.y).toBeLessThan(userServicePos!.y);
    expect(baseServicePos!.y).toBeLessThan(adminServicePos!.y);
  });

  // Property Test 20: Vertical tier spacing
  it('property test: vertical tier spacing meets minimum requirements (Property 20)', async () => {
    const minTierSpacing = 120;
    const result = await layoutEngine.compute(mockClasses, mockRelationships, {
      algorithm: 'hierarchical',
      direction: 'TB',
      rankSeparation: minTierSpacing
    });

    const baseServicePos = result.positions.get('class-1');
    const userServicePos = result.positions.get('class-2');

    expect(baseServicePos).toBeDefined();
    expect(userServicePos).toBeDefined();

    const verticalDistance = Math.abs(userServicePos!.y - baseServicePos!.y);
    expect(verticalDistance).toBeGreaterThanOrEqual(minTierSpacing);
  });

  // Property Test 21: Horizontal sibling spacing
  it('property test: horizontal sibling spacing meets minimum requirements (Property 21)', async () => {
    const minSiblingSpacing = 80;
    const result = await layoutEngine.compute(mockClasses, mockRelationships, {
      algorithm: 'hierarchical',
      direction: 'TB',
      nodeSeparation: minSiblingSpacing
    });

    const userServicePos = result.positions.get('class-2');
    const adminServicePos = result.positions.get('class-3');

    expect(userServicePos).toBeDefined();
    expect(adminServicePos).toBeDefined();

    // Siblings should be separated horizontally
    const horizontalDistance = Math.abs(adminServicePos!.x - userServicePos!.x);
    expect(horizontalDistance).toBeGreaterThanOrEqual(minSiblingSpacing);
  });

  // Property Test 22: No box overlap
  it('property test: no class boxes overlap after layout (Property 22)', async () => {
    const result = await layoutEngine.compute(mockClasses, mockRelationships, {
      algorithm: 'hierarchical',
      nodeWidth: 200,
      nodeHeight: 120
    });

    const positions = Array.from(result.positions.values());
    const nodeWidth = 200;
    const nodeHeight = 120;

    // Check all pairs for overlap
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const pos1 = positions[i];
        const pos2 = positions[j];

        // Check if boxes overlap
        const noOverlapX = pos1.x + nodeWidth <= pos2.x || pos2.x + nodeWidth <= pos1.x;
        const noOverlapY = pos1.y + nodeHeight <= pos2.y || pos2.y + nodeHeight <= pos1.y;

        expect(noOverlapX || noOverlapY).toBe(true);
      }
    }
  });

  it('validates cycle detection in inheritance relationships', async () => {
    const cyclicRelationships: UMLRelationship[] = [
      {
        id: 'rel-1',
        source: 'class-1',
        target: 'class-2',
        type: 'inheritance',
        description: 'Class1 extends Class2'
      },
      {
        id: 'rel-2',
        source: 'class-2',
        target: 'class-1',
        type: 'inheritance',
        description: 'Class2 extends Class1' // Creates cycle
      }
    ];

    // Should not throw error and should handle cycle gracefully
    const result = await layoutEngine.compute(mockClasses, cyclicRelationships, {
      algorithm: 'hierarchical'
    });

    expect(result.positions.size).toBe(3);
    expect(result.bounds.width).toBeGreaterThan(0);
  });

  it('validates layout caching mechanism', async () => {
    const options = { algorithm: 'hierarchical' as const, direction: 'TB' as const };
    
    // First computation
    const result1 = await layoutEngine.compute(mockClasses, mockRelationships, options);
    
    // Second computation with same inputs should use cache
    const result2 = await layoutEngine.compute(mockClasses, mockRelationships, options);
    
    // Results should be identical (cached)
    expect(result1.positions.size).toBe(result2.positions.size);
    expect(result1.bounds).toEqual(result2.bounds);
  });

  it('validates performance monitoring', async () => {
    const result = await layoutEngine.compute(mockClasses, mockRelationships, {
      algorithm: 'hierarchical'
    });

    expect(typeof result.computationTime).toBe('number');
    expect(result.computationTime).toBeGreaterThanOrEqual(0);
  });

  it('validates bounds calculation', async () => {
    const result = await layoutEngine.compute(mockClasses, mockRelationships, {
      algorithm: 'hierarchical'
    });

    // Bounds should encompass all positions
    const positions = Array.from(result.positions.values());
    const minX = Math.min(...positions.map(p => p.x));
    const maxX = Math.max(...positions.map(p => p.x));
    const minY = Math.min(...positions.map(p => p.y));
    const maxY = Math.max(...positions.map(p => p.y));

    expect(result.bounds.x).toBeLessThanOrEqual(minX);
    expect(result.bounds.y).toBeLessThanOrEqual(minY);
    expect(result.bounds.x + result.bounds.width).toBeGreaterThanOrEqual(maxX);
    expect(result.bounds.y + result.bounds.height).toBeGreaterThanOrEqual(maxY);
  });

  it('validates center diagram calculation', async () => {
    const result = await layoutEngine.compute(mockClasses, mockRelationships);
    const viewportWidth = 1000;
    const viewportHeight = 800;

    const centerPos = layoutEngine.centerDiagram(result, viewportWidth, viewportHeight);

    expect(typeof centerPos.x).toBe('number');
    expect(typeof centerPos.y).toBe('number');
    expect(centerPos.x).toBeGreaterThanOrEqual(0);
    expect(centerPos.y).toBeGreaterThanOrEqual(0);
  });

  it('validates edge routing with orthogonal connectors', async () => {
    const result = await layoutEngine.compute(mockClasses, mockRelationships, {
      algorithm: 'hierarchical'
    });

    // Should have edges for relationships
    expect(result.edges.size).toBeGreaterThan(0);

    // Each edge should have multiple points for orthogonal routing
    result.edges.forEach(edge => {
      expect(edge.points.length).toBeGreaterThanOrEqual(2);
      edge.points.forEach(point => {
        expect(typeof point.x).toBe('number');
        expect(typeof point.y).toBe('number');
      });
    });
  });

  it('validates layout options defaults', async () => {
    const result = await layoutEngine.compute(mockClasses, mockRelationships);

    // Should work with default options
    expect(result.positions.size).toBe(3);
    expect(result.bounds.width).toBeGreaterThan(0);
    expect(result.bounds.height).toBeGreaterThan(0);
  });
});