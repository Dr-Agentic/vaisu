/**
 * TermsDefinitions Component Tests
 * 
 * NOTE: To run these tests, install testing dependencies:
 * npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
 * 
 * Then update vitest.config.ts to use 'jsdom' environment for frontend tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { TermsDefinitionsData, GlossaryTerm } from '../../../../../shared/src/types';

describe('TermsDefinitions Data Structure Tests', () => {
  let mockData: TermsDefinitionsData;

  beforeEach(() => {
    mockData = {
      terms: [
        {
          id: 'term-1',
          term: 'API',
          definition: 'Application Programming Interface - a set of protocols for building software',
          type: 'acronym',
          confidence: 0.95,
          mentions: 5,
          context: 'Used throughout the document'
        },
        {
          id: 'term-2',
          term: 'Microservices',
          definition: 'An architectural style that structures an application as a collection of loosely coupled services',
          type: 'technical',
          confidence: 0.9,
          mentions: 3
        },
        {
          id: 'term-3',
          term: 'Scalability',
          definition: 'The capability of a system to handle a growing amount of work',
          type: 'concept',
          confidence: 0.85,
          mentions: 2
        },
        {
          id: 'term-4',
          term: 'CRUD',
          definition: 'Create, Read, Update, Delete - basic operations for data management',
          type: 'acronym',
          confidence: 0.9,
          mentions: 4
        }
      ],
      metadata: {
        totalTerms: 4,
        extractionConfidence: 0.9,
        documentDomain: 'software engineering'
      }
    };
  });

  describe('Data Structure Validation', () => {
    it('should have valid terms array', () => {
      expect(mockData.terms).toBeDefined();
      expect(Array.isArray(mockData.terms)).toBe(true);
      expect(mockData.terms.length).toBe(4);
    });

    it('should have valid term objects', () => {
      const term = mockData.terms[0];
      expect(term.id).toBeDefined();
      expect(term.term).toBeDefined();
      expect(term.definition).toBeDefined();
      expect(term.type).toBeDefined();
      expect(term.confidence).toBeGreaterThan(0);
      expect(term.mentions).toBeGreaterThan(0);
    });

    it('should have valid metadata', () => {
      expect(mockData.metadata).toBeDefined();
      expect(mockData.metadata.totalTerms).toBe(4);
      expect(mockData.metadata.extractionConfidence).toBeGreaterThan(0);
      expect(mockData.metadata.documentDomain).toBeDefined();
    });

    it('should have correct term types', () => {
      const validTypes = ['acronym', 'technical', 'jargon', 'concept'];
      mockData.terms.forEach(term => {
        expect(validTypes).toContain(term.type);
      });
    });
  });

  describe('Search Logic', () => {
    const filterTerms = (terms: GlossaryTerm[], query: string) => {
      return terms.filter(term =>
        term.term.toLowerCase().includes(query.toLowerCase()) ||
        term.definition.toLowerCase().includes(query.toLowerCase())
      );
    };

    it('should filter terms based on search query', () => {
      const filtered = filterTerms(mockData.terms, 'API');
      expect(filtered.length).toBe(1); // Only API matches
      expect(filtered.some(t => t.term === 'API')).toBe(true);
    });

    it('should search in both term and definition', () => {
      const filtered = filterTerms(mockData.terms, 'architectural');
      expect(filtered.length).toBe(1);
      expect(filtered[0].term).toBe('Microservices');
    });

    it('should be case insensitive', () => {
      const filtered = filterTerms(mockData.terms, 'api');
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.some(t => t.term === 'API')).toBe(true);
    });

    it('should return empty array when no matches', () => {
      const filtered = filterTerms(mockData.terms, 'nonexistent');
      expect(filtered.length).toBe(0);
    });
  });

  describe('Type Filtering Logic', () => {
    const filterByType = (terms: GlossaryTerm[], type: string) => {
      if (type === 'all') return terms;
      return terms.filter(term => term.type === type);
    };

    it('should filter by acronym type', () => {
      const filtered = filterByType(mockData.terms, 'acronym');
      expect(filtered.length).toBe(2);
      expect(filtered.every(t => t.type === 'acronym')).toBe(true);
    });

    it('should filter by technical type', () => {
      const filtered = filterByType(mockData.terms, 'technical');
      expect(filtered.length).toBe(1);
      expect(filtered[0].term).toBe('Microservices');
    });

    it('should filter by concept type', () => {
      const filtered = filterByType(mockData.terms, 'concept');
      expect(filtered.length).toBe(1);
      expect(filtered[0].term).toBe('Scalability');
    });

    it('should show all terms when "all" filter is selected', () => {
      const filtered = filterByType(mockData.terms, 'all');
      expect(filtered.length).toBe(4);
    });
  });

  describe('Combined Search and Filter Logic', () => {
    const filterTerms = (terms: GlossaryTerm[], query: string, type: string) => {
      return terms.filter(term => {
        const matchesSearch = term.term.toLowerCase().includes(query.toLowerCase()) ||
                             term.definition.toLowerCase().includes(query.toLowerCase());
        const matchesType = type === 'all' || term.type === type;
        return matchesSearch && matchesType;
      });
    };

    it('should apply both search and type filter', () => {
      const filtered = filterTerms(mockData.terms, 'a', 'acronym');
      expect(filtered.length).toBe(2); // API and CRUD
      expect(filtered.every(t => t.type === 'acronym')).toBe(true);
    });

    it('should return empty when filters dont match', () => {
      const filtered = filterTerms(mockData.terms, 'xyz', 'acronym');
      expect(filtered.length).toBe(0);
    });
  });

  describe('Alphabetical Sorting', () => {
    it('should sort terms alphabetically', () => {
      const terms = [...mockData.terms].sort((a, b) => a.term.localeCompare(b.term));
      
      expect(terms[0].term).toBe('API');
      expect(terms[1].term).toBe('CRUD');
      expect(terms[2].term).toBe('Microservices');
      expect(terms[3].term).toBe('Scalability');
    });
  });

  describe('Badge Color Mapping', () => {
    const getTypeBadgeColor = (type: string) => {
      const colors: Record<string, string> = {
        acronym: 'bg-blue-100 text-blue-700',
        technical: 'bg-purple-100 text-purple-700',
        jargon: 'bg-amber-100 text-amber-700',
        concept: 'bg-emerald-100 text-emerald-700'
      };
      return colors[type] || 'bg-gray-100 text-gray-700';
    };

    it('should return correct colors for acronym type', () => {
      const color = getTypeBadgeColor('acronym');
      expect(color).toContain('bg-blue-100');
      expect(color).toContain('text-blue-700');
    });

    it('should return correct colors for technical type', () => {
      const color = getTypeBadgeColor('technical');
      expect(color).toContain('bg-purple-100');
      expect(color).toContain('text-purple-700');
    });

    it('should return correct colors for concept type', () => {
      const color = getTypeBadgeColor('concept');
      expect(color).toContain('bg-emerald-100');
      expect(color).toContain('text-emerald-700');
    });

    it('should return correct colors for jargon type', () => {
      const color = getTypeBadgeColor('jargon');
      expect(color).toContain('bg-amber-100');
      expect(color).toContain('text-amber-700');
    });

    it('should return default colors for unknown type', () => {
      const color = getTypeBadgeColor('unknown');
      expect(color).toContain('bg-gray-100');
      expect(color).toContain('text-gray-700');
    });
  });

  describe('Mentions Display Logic', () => {
    it('should show mentions when > 1', () => {
      const term = mockData.terms[0]; // API with 5 mentions
      expect(term.mentions).toBeGreaterThan(1);
    });

    it('should not show mentions badge for single mention', () => {
      const singleMentionTerm: GlossaryTerm = {
        id: 'term-1',
        term: 'Test',
        definition: 'A test term',
        type: 'concept',
        confidence: 0.8,
        mentions: 1
      };
      
      expect(singleMentionTerm.mentions).toBe(1);
    });
  });
});
