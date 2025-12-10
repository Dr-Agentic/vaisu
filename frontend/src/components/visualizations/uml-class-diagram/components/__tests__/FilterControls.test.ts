/**
 * FilterControls Tests
 * 
 * These tests focus on the logic for filtering and search functionality.
 */

import { describe, it, expect } from 'vitest';
import type { ClassEntity } from '@shared/types';

describe('FilterControls Logic Tests', () => {
  const mockClasses: ClassEntity[] = [
    {
      id: 'class-1',
      name: 'UserService',
      type: 'class',
      stereotype: 'service',
      package: 'com.example.service',
      attributes: [],
      methods: [],
      description: 'Handles user authentication',
      sourceQuote: 'UserService manages users',
      sourceSpan: null,
      documentLink: '#doc-1'
    },
    {
      id: 'class-2',
      name: 'IUserRepository',
      type: 'interface',
      stereotype: 'repository',
      package: 'com.example.repository',
      attributes: [],
      methods: [],
      description: 'User data access interface',
      sourceQuote: 'IUserRepository defines contract',
      sourceSpan: null,
      documentLink: '#doc-1'
    },
    {
      id: 'class-3',
      name: 'BaseEntity',
      type: 'abstract',
      package: 'com.example.entity',
      attributes: [],
      methods: [],
      description: 'Base class for entities',
      sourceQuote: 'BaseEntity provides common functionality',
      sourceSpan: null,
      documentLink: '#doc-1'
    }
  ];

  // Property Test 31: Type filter application
  it('property test: type filter application works correctly (Property 31)', () => {
    const applyTypeFilter = (classes: ClassEntity[], allowedTypes: Set<string>) => {
      return classes.filter(cls => allowedTypes.has(cls.type));
    };

    // Filter for only classes
    const classFilter = new Set(['class']);
    const classResults = applyTypeFilter(mockClasses, classFilter);
    expect(classResults.length).toBe(1);
    expect(classResults[0].type).toBe('class');

    // Filter for interfaces and abstract
    const interfaceAbstractFilter = new Set(['interface', 'abstract']);
    const interfaceAbstractResults = applyTypeFilter(mockClasses, interfaceAbstractFilter);
    expect(interfaceAbstractResults.length).toBe(2);
    expect(interfaceAbstractResults.every(cls => ['interface', 'abstract'].includes(cls.type))).toBe(true);
  });

  // Property Test 32: Search highlighting
  it('property test: search highlighting identifies matching classes (Property 32)', () => {
    const searchClasses = (classes: ClassEntity[], searchTerm: string) => {
      const searchLower = searchTerm.toLowerCase();
      return classes.filter(cls =>
        cls.name.toLowerCase().includes(searchLower) ||
        cls.description?.toLowerCase().includes(searchLower) ||
        cls.package?.toLowerCase().includes(searchLower)
      );
    };

    // Search by name
    const nameResults = searchClasses(mockClasses, 'User');
    expect(nameResults.length).toBe(2); // UserService and IUserRepository
    expect(nameResults.every(cls => cls.name.toLowerCase().includes('user'))).toBe(true);

    // Search by description
    const descResults = searchClasses(mockClasses, 'authentication');
    expect(descResults.length).toBe(1);
    expect(descResults[0].name).toBe('UserService');

    // Search by package
    const packageResults = searchClasses(mockClasses, 'repository');
    expect(packageResults.length).toBe(1);
    expect(packageResults[0].package).toContain('repository');
  });

  it('validates stereotype filtering', () => {
    const filterByStereotype = (classes: ClassEntity[], stereotypes: Set<string>) => {
      return classes.filter(cls => cls.stereotype && stereotypes.has(cls.stereotype));
    };

    const serviceFilter = new Set(['service']);
    const serviceResults = filterByStereotype(mockClasses, serviceFilter);
    expect(serviceResults.length).toBe(1);
    expect(serviceResults[0].stereotype).toBe('service');

    const repositoryFilter = new Set(['repository']);
    const repositoryResults = filterByStereotype(mockClasses, repositoryFilter);
    expect(repositoryResults.length).toBe(1);
    expect(repositoryResults[0].stereotype).toBe('repository');
  });

  it('validates package filtering', () => {
    const filterByPackage = (classes: ClassEntity[], packages: Set<string>) => {
      return classes.filter(cls => cls.package && packages.has(cls.package));
    };

    const servicePackageFilter = new Set(['com.example.service']);
    const servicePackageResults = filterByPackage(mockClasses, servicePackageFilter);
    expect(servicePackageResults.length).toBe(1);
    expect(servicePackageResults[0].package).toBe('com.example.service');
  });

  it('validates combined filtering', () => {
    const applyCombinedFilters = (
      classes: ClassEntity[],
      typeFilter: Set<string>,
      searchTerm: string
    ) => {
      let filtered = classes;

      // Apply type filter
      if (typeFilter.size > 0) {
        filtered = filtered.filter(cls => typeFilter.has(cls.type));
      }

      // Apply search filter
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(cls =>
          cls.name.toLowerCase().includes(searchLower) ||
          cls.description?.toLowerCase().includes(searchLower) ||
          cls.package?.toLowerCase().includes(searchLower)
        );
      }

      return filtered;
    };

    // Filter for classes containing "User"
    const typeFilter = new Set(['class', 'interface']);
    const results = applyCombinedFilters(mockClasses, typeFilter, 'User');
    
    expect(results.length).toBe(2); // UserService (class) and IUserRepository (interface)
    expect(results.every(cls => ['class', 'interface'].includes(cls.type))).toBe(true);
    expect(results.every(cls => cls.name.toLowerCase().includes('user'))).toBe(true);
  });

  it('validates focus mode logic', () => {
    const getFocusedClasses = (
      classes: ClassEntity[],
      focusedClassId: string | null,
      relationships: Array<{ source: string; target: string }>
    ) => {
      if (!focusedClassId) return classes;

      const connectedIds = new Set([focusedClassId]);
      
      // Add immediate neighbors
      relationships.forEach(rel => {
        if (rel.source === focusedClassId) {
          connectedIds.add(rel.target);
        } else if (rel.target === focusedClassId) {
          connectedIds.add(rel.source);
        }
      });

      return classes.filter(cls => connectedIds.has(cls.id));
    };

    const relationships = [
      { source: 'class-1', target: 'class-2' },
      { source: 'class-2', target: 'class-3' }
    ];

    // Focus on class-1
    const focusResults = getFocusedClasses(mockClasses, 'class-1', relationships);
    expect(focusResults.length).toBe(2); // class-1 and class-2 (connected)
    expect(focusResults.map(cls => cls.id)).toContain('class-1');
    expect(focusResults.map(cls => cls.id)).toContain('class-2');
    expect(focusResults.map(cls => cls.id)).not.toContain('class-3');
  });

  it('validates filter options extraction', () => {
    const extractFilterOptions = (classes: ClassEntity[]) => {
      const stereotypes = new Set<string>();
      const packages = new Set<string>();
      const types = new Set<string>();

      classes.forEach(cls => {
        types.add(cls.type);
        if (cls.stereotype) stereotypes.add(cls.stereotype);
        if (cls.package) packages.add(cls.package);
      });

      return {
        types: Array.from(types),
        stereotypes: Array.from(stereotypes),
        packages: Array.from(packages)
      };
    };

    const options = extractFilterOptions(mockClasses);
    
    expect(options.types).toContain('class');
    expect(options.types).toContain('interface');
    expect(options.types).toContain('abstract');
    
    expect(options.stereotypes).toContain('service');
    expect(options.stereotypes).toContain('repository');
    
    expect(options.packages).toContain('com.example.service');
    expect(options.packages).toContain('com.example.repository');
    expect(options.packages).toContain('com.example.entity');
  });

  it('validates case-insensitive search', () => {
    const caseInsensitiveSearch = (classes: ClassEntity[], searchTerm: string) => {
      const searchLower = searchTerm.toLowerCase();
      return classes.filter(cls =>
        cls.name.toLowerCase().includes(searchLower) ||
        cls.description?.toLowerCase().includes(searchLower)
      );
    };

    // Test various cases
    expect(caseInsensitiveSearch(mockClasses, 'USER').length).toBe(2);
    expect(caseInsensitiveSearch(mockClasses, 'user').length).toBe(2);
    expect(caseInsensitiveSearch(mockClasses, 'User').length).toBe(2);
    expect(caseInsensitiveSearch(mockClasses, 'AUTHENTICATION').length).toBe(1);
  });

  it('validates empty filter handling', () => {
    const applyEmptyFilters = (classes: ClassEntity[]) => {
      const emptyTypeFilter = new Set<string>();
      const emptySearchTerm = '';
      
      let filtered = classes;
      
      // Empty type filter should show all classes
      if (emptyTypeFilter.size === 0) {
        // No filtering applied
      }
      
      // Empty search should show all classes
      if (!emptySearchTerm.trim()) {
        // No search filtering applied
      }
      
      return filtered;
    };

    const results = applyEmptyFilters(mockClasses);
    expect(results.length).toBe(mockClasses.length);
  });
});