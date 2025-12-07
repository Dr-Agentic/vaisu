import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VisualizationGenerator } from '../visualizationGenerator';
import type { Document, DocumentAnalysis, MindMapData } from '../../../../../shared/src/types';

// Mock the OpenRouter client
vi.mock('../../llm/openRouterClient', () => ({
  getOpenRouterClient: () => ({
    callWithFallback: vi.fn().mockResolvedValue({
      content: JSON.stringify({
        nodes: [
          {
            id: 'root',
            label: 'Test Document',
            summary: 'A test document for mind map generation',
            importance: 1.0,
            children: [
              {
                id: 'node-1',
                label: 'Section 1',
                summary: 'First section',
                importance: 0.8,
                children: [
                  {
                    id: 'node-1-1',
                    label: 'Subsection 1.1',
                    summary: 'First subsection',
                    importance: 0.6,
                    children: []
                  }
                ]
              },
              {
                id: 'node-2',
                label: 'Section 2',
                summary: 'Second section',
                importance: 0.7,
                children: []
              }
            ]
          }
        ]
      })
    }),
    parseJSONResponse: vi.fn((response) => JSON.parse(response.content))
  })
}));

describe('VisualizationGenerator', () => {
  let generator: VisualizationGenerator;
  let mockDocument: Document;
  let mockAnalysis: DocumentAnalysis;

  beforeEach(() => {
    generator = new VisualizationGenerator();

    mockDocument = {
      id: 'test-doc-1',
      title: 'Test Document',
      content: 'This is a test document with some content.',
      metadata: {
        wordCount: 8,
        uploadDate: new Date(),
        fileType: 'txt',
        language: 'en'
      },
      structure: {
        sections: [
          {
            id: 'section-1',
            level: 1,
            title: 'Introduction',
            content: 'Introduction content',
            startIndex: 0,
            endIndex: 100,
            summary: 'Intro summary',
            keywords: ['intro'],
            children: [
              {
                id: 'section-1-1',
                level: 2,
                title: 'Background',
                content: 'Background content',
                startIndex: 100,
                endIndex: 200,
                summary: 'Background summary',
                keywords: ['background'],
                children: []
              }
            ]
          },
          {
            id: 'section-2',
            level: 1,
            title: 'Conclusion',
            content: 'Conclusion content',
            startIndex: 200,
            endIndex: 300,
            summary: 'Conclusion summary',
            keywords: ['conclusion'],
            children: []
          }
        ],
        hierarchy: []
      }
    };

    mockAnalysis = {
      tldr: 'This is a test document summary',
      executiveSummary: {
        headline: 'Test Document',
        keyIdeas: ['Idea 1', 'Idea 2'],
        kpis: [],
        risks: [],
        opportunities: [],
        callToAction: 'Review the document'
      },
      entities: [],
      relationships: [],
      metrics: [],
      signals: {
        structural: 0.8,
        process: 0.3,
        quantitative: 0.2,
        technical: 0.1,
        argumentative: 0.4,
        temporal: 0.2
      },
      recommendations: []
    };
  });

  describe('generateVisualization', () => {
    it('should generate structured view', async () => {
      const result = await generator.generateVisualization(
        'structured-view',
        mockDocument,
        mockAnalysis
      );

      expect(result).toBeDefined();
      expect(result.type).toBe('structured-view');
      expect(result.sections).toBeDefined();
      expect(result.sections).toHaveLength(2);
    });

    it('should generate mind map with LLM', async () => {
      const result = await generator.generateVisualization(
        'mind-map',
        mockDocument,
        mockAnalysis
      );

      expect(result).toBeDefined();
      expect(result.root).toBeDefined();
      expect(result.root.label).toBeDefined();
      expect(result.root.children).toBeDefined();
      expect(result.layout).toBe('radial');
      expect(result.theme).toBeDefined();
    });

    it('should generate flowchart', async () => {
      const result = await generator.generateVisualization(
        'flowchart',
        mockDocument,
        mockAnalysis
      );

      expect(result).toBeDefined();
      expect(result.nodes).toBeDefined();
      expect(result.edges).toBeDefined();
      expect(result.layout).toBe('topToBottom');
    });

    it('should generate knowledge graph', async () => {
      mockAnalysis.entities = [
        {
          id: 'entity-1',
          text: 'Test Entity',
          type: 'concept',
          mentions: [],
          importance: 0.8
        }
      ];
      mockAnalysis.relationships = [
        {
          id: 'rel-1',
          source: 'entity-1',
          target: 'entity-2',
          type: 'relates-to',
          strength: 0.7,
          evidence: []
        }
      ];

      const result = await generator.generateVisualization(
        'knowledge-graph',
        mockDocument,
        mockAnalysis
      );

      expect(result).toBeDefined();
      expect(result.nodes).toBeDefined();
      expect(result.edges).toBeDefined();
      expect(result.clusters).toBeDefined();
    });

    it('should throw error for unsupported visualization type', async () => {
      await expect(
        generator.generateVisualization(
          'unsupported-type' as any,
          mockDocument,
          mockAnalysis
        )
      ).rejects.toThrow('not yet implemented');
    });
  });

  describe('Mind Map Generation', () => {
    it('should create hierarchical structure from LLM response', async () => {
      const result = (await generator.generateVisualization(
        'mind-map',
        mockDocument,
        mockAnalysis
      )) as MindMapData;

      expect(result.root).toBeDefined();
      expect(result.root.children).toHaveLength(2);
      expect(result.root.children[0].label).toBe('Section 1');
      expect(result.root.children[0].children).toHaveLength(1);
      expect(result.root.children[0].children[0].label).toBe('Subsection 1.1');
    });

    it('should assign colors based on hierarchy level', async () => {
      const result = (await generator.generateVisualization(
        'mind-map',
        mockDocument,
        mockAnalysis
      )) as MindMapData;

      expect(result.root.color).toBeDefined();
      expect(result.root.children[0].color).toBeDefined();
      expect(result.root.children[0].children[0].color).toBeDefined();
      
      // Different levels should have different colors
      expect(result.root.color).not.toBe(result.root.children[0].color);
    });

    it('should include metadata with importance scores', async () => {
      const result = (await generator.generateVisualization(
        'mind-map',
        mockDocument,
        mockAnalysis
      )) as MindMapData;

      expect(result.root.metadata).toBeDefined();
      expect(result.root.metadata.importance).toBeGreaterThan(0);
      expect(result.root.metadata.confidence).toBeGreaterThan(0);
    });

    it('should fallback to structure-based generation on LLM failure', async () => {
      // Create a new generator instance to test fallback
      const testGenerator = new VisualizationGenerator();
      
      // Mock the import to return a failing client
      vi.doMock('../../llm/openRouterClient', () => ({
        getOpenRouterClient: () => ({
          callWithFallback: vi.fn().mockRejectedValue(new Error('LLM failed')),
          parseJSONResponse: vi.fn()
        })
      }));

      const result = (await testGenerator.generateVisualization(
        'mind-map',
        mockDocument,
        mockAnalysis
      )) as MindMapData;

      // Should still return valid mind map from document structure
      expect(result).toBeDefined();
      expect(result.root).toBeDefined();
      expect(result.root.label).toBe('Test Document');
      
      vi.doUnmock('../../llm/openRouterClient');
    });
  });

  describe('Flowchart Generation', () => {
    it('should create nodes from sections', async () => {
      const result = await generator.generateVisualization(
        'flowchart',
        mockDocument,
        mockAnalysis
      );

      expect(result.nodes).toHaveLength(2);
      expect(result.nodes[0].type).toBe('start');
      expect(result.nodes[1].type).toBe('end');
    });

    it('should create edges connecting nodes', async () => {
      const result = await generator.generateVisualization(
        'flowchart',
        mockDocument,
        mockAnalysis
      );

      expect(result.edges).toHaveLength(1);
      expect(result.edges[0].source).toBe(result.nodes[0].id);
      expect(result.edges[0].target).toBe(result.nodes[1].id);
    });
  });

  describe('Knowledge Graph Generation', () => {
    it('should create nodes from entities', async () => {
      mockAnalysis.entities = [
        {
          id: 'entity-1',
          text: 'Entity 1',
          type: 'person',
          mentions: [],
          importance: 0.9
        },
        {
          id: 'entity-2',
          text: 'Entity 2',
          type: 'organization',
          mentions: [],
          importance: 0.7
        }
      ];

      const result = await generator.generateVisualization(
        'knowledge-graph',
        mockDocument,
        mockAnalysis
      );

      expect(result.nodes).toHaveLength(2);
      expect(result.nodes[0].type).toBe('person');
      expect(result.nodes[1].type).toBe('organization');
    });

    it('should create edges from relationships', async () => {
      mockAnalysis.entities = [
        { id: 'e1', text: 'E1', type: 'concept', mentions: [], importance: 0.8 },
        { id: 'e2', text: 'E2', type: 'concept', mentions: [], importance: 0.7 }
      ];
      mockAnalysis.relationships = [
        {
          id: 'rel-1',
          source: 'e1',
          target: 'e2',
          type: 'causes',
          strength: 0.8,
          evidence: []
        }
      ];

      const result = await generator.generateVisualization(
        'knowledge-graph',
        mockDocument,
        mockAnalysis
      );

      expect(result.edges).toHaveLength(1);
      expect(result.edges[0].source).toBe('e1');
      expect(result.edges[0].target).toBe('e2');
      expect(result.edges[0].type).toBe('causes');
    });

    it('should update node connection counts', async () => {
      mockAnalysis.entities = [
        { id: 'e1', text: 'E1', type: 'concept', mentions: [], importance: 0.8 },
        { id: 'e2', text: 'E2', type: 'concept', mentions: [], importance: 0.7 }
      ];
      mockAnalysis.relationships = [
        {
          id: 'rel-1',
          source: 'e1',
          target: 'e2',
          type: 'relates-to',
          strength: 0.8,
          evidence: []
        }
      ];

      const result = await generator.generateVisualization(
        'knowledge-graph',
        mockDocument,
        mockAnalysis
      );

      const node1 = result.nodes.find((n: any) => n.id === 'e1');
      const node2 = result.nodes.find((n: any) => n.id === 'e2');

      expect(node1.metadata.connections).toBe(1);
      expect(node2.metadata.connections).toBe(1);
    });
  });

  describe('Dashboard Generation', () => {
    it('should include executive summary', async () => {
      const result = await generator.generateVisualization(
        'executive-dashboard',
        mockDocument,
        mockAnalysis
      );

      expect(result.executiveCard).toBeDefined();
      expect(result.executiveCard.headline).toBe('Test Document');
    });

    it('should include KPI tiles', async () => {
      mockAnalysis.executiveSummary.kpis = [
        {
          id: 'kpi-1',
          label: 'Revenue',
          value: 1000000,
          unit: 'USD',
          confidence: 0.9
        }
      ];

      const result = await generator.generateVisualization(
        'executive-dashboard',
        mockDocument,
        mockAnalysis
      );

      expect(result.kpiTiles).toHaveLength(1);
      expect(result.kpiTiles[0].label).toBe('Revenue');
    });
  });

  describe('Terms & Definitions Generation', () => {
    beforeEach(() => {
      // Mock LLM response for glossary extraction
      vi.doMock('../../llm/openRouterClient', () => ({
        getOpenRouterClient: () => ({
          callWithFallback: vi.fn().mockResolvedValue({
            content: JSON.stringify({
              terms: [
                {
                  term: 'API',
                  definition: 'Application Programming Interface - a set of protocols for building software',
                  type: 'acronym',
                  confidence: 0.95,
                  mentions: 5,
                  context: 'Used throughout the document to describe system integration'
                },
                {
                  term: 'Microservices',
                  definition: 'An architectural style that structures an application as a collection of loosely coupled services',
                  type: 'technical',
                  confidence: 0.9,
                  mentions: 3
                },
                {
                  term: 'Scalability',
                  definition: 'The capability of a system to handle a growing amount of work',
                  type: 'concept',
                  confidence: 0.85,
                  mentions: 2
                }
              ],
              domain: 'software engineering'
            })
          }),
          parseJSONResponse: vi.fn((response) => JSON.parse(response.content))
        })
      }));
    });

    it('should generate terms definitions with LLM', async () => {
      const result = await generator.generateVisualization(
        'terms-definitions',
        mockDocument,
        mockAnalysis
      );

      expect(result).toBeDefined();
      expect(result.terms).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.metadata.totalTerms).toBeGreaterThan(0);
    });

    it('should sort terms alphabetically', async () => {
      const result = await generator.generateVisualization(
        'terms-definitions',
        mockDocument,
        mockAnalysis
      );

      expect(result.terms).toBeDefined();
      expect(result.terms.length).toBeGreaterThan(1);
      
      // Check alphabetical order
      for (let i = 0; i < result.terms.length - 1; i++) {
        expect(result.terms[i].term.localeCompare(result.terms[i + 1].term)).toBeLessThanOrEqual(0);
      }
    });

    it('should include term metadata', async () => {
      const result = await generator.generateVisualization(
        'terms-definitions',
        mockDocument,
        mockAnalysis
      );

      const term = result.terms[0];
      expect(term.id).toBeDefined();
      expect(term.term).toBeDefined();
      expect(term.definition).toBeDefined();
      expect(term.type).toBeDefined();
      expect(term.confidence).toBeGreaterThan(0);
      expect(term.mentions).toBeGreaterThan(0);
    });

    it('should include document domain in metadata', async () => {
      const result = await generator.generateVisualization(
        'terms-definitions',
        mockDocument,
        mockAnalysis
      );

      expect(result.metadata.documentDomain).toBeDefined();
      expect(result.metadata.extractionConfidence).toBeGreaterThan(0);
    });

    it('should handle malformed LLM responses', async () => {
      // Mock malformed response
      vi.doMock('../../llm/openRouterClient', () => ({
        getOpenRouterClient: () => ({
          callWithFallback: vi.fn().mockResolvedValue({
            content: 'invalid json'
          }),
          parseJSONResponse: vi.fn().mockImplementation(() => {
            throw new Error('Invalid JSON');
          })
        })
      }));

      const testGenerator = new VisualizationGenerator();
      const result = await testGenerator.generateVisualization(
        'terms-definitions',
        mockDocument,
        mockAnalysis
      );

      // Should fallback to entity extraction
      expect(result).toBeDefined();
      expect(result.terms).toBeDefined();
      
      vi.doUnmock('../../llm/openRouterClient');
    });

    it('should fallback to entity extraction on LLM failure', async () => {
      mockAnalysis.entities = [
        {
          id: 'entity-1',
          text: 'Technical Term',
          type: 'technical',
          mentions: [{ start: 0, end: 10, text: 'Technical Term' }],
          importance: 0.8,
          context: 'A technical term used in the document'
        },
        {
          id: 'entity-2',
          text: 'Concept',
          type: 'concept',
          mentions: [{ start: 20, end: 30, text: 'Concept' }],
          importance: 0.7,
          context: 'An important concept'
        }
      ];

      // Mock LLM failure
      vi.doMock('../../llm/openRouterClient', () => ({
        getOpenRouterClient: () => ({
          callWithFallback: vi.fn().mockRejectedValue(new Error('LLM failed')),
          parseJSONResponse: vi.fn()
        })
      }));

      const testGenerator = new VisualizationGenerator();
      const result = await testGenerator.generateVisualization(
        'terms-definitions',
        mockDocument,
        mockAnalysis
      );

      expect(result).toBeDefined();
      expect(result.terms).toBeDefined();
      expect(result.terms.length).toBeGreaterThan(0);
      expect(result.metadata.extractionConfidence).toBe(0.7);
      
      vi.doUnmock('../../llm/openRouterClient');
    });

    it('should filter only technical and concept entities in fallback', async () => {
      mockAnalysis.entities = [
        {
          id: 'entity-1',
          text: 'Technical Term',
          type: 'technical',
          mentions: [{ start: 0, end: 10, text: 'Technical Term' }],
          importance: 0.8,
          context: 'Technical context'
        },
        {
          id: 'entity-2',
          text: 'John Doe',
          type: 'person',
          mentions: [{ start: 20, end: 30, text: 'John Doe' }],
          importance: 0.9,
          context: 'A person'
        },
        {
          id: 'entity-3',
          text: 'Concept',
          type: 'concept',
          mentions: [{ start: 40, end: 50, text: 'Concept' }],
          importance: 0.7,
          context: 'Concept context'
        }
      ];

      // Mock LLM failure
      vi.doMock('../../llm/openRouterClient', () => ({
        getOpenRouterClient: () => ({
          callWithFallback: vi.fn().mockRejectedValue(new Error('LLM failed')),
          parseJSONResponse: vi.fn()
        })
      }));

      const testGenerator = new VisualizationGenerator();
      const result = await testGenerator.generateVisualization(
        'terms-definitions',
        mockDocument,
        mockAnalysis
      );

      // Should only include technical and concept entities
      expect(result.terms.length).toBe(2);
      expect(result.terms.every((t: any) => t.type === 'technical' || t.type === 'concept')).toBe(true);
      
      vi.doUnmock('../../llm/openRouterClient');
    });

    it('should sort fallback terms alphabetically', async () => {
      mockAnalysis.entities = [
        {
          id: 'entity-1',
          text: 'Zebra',
          type: 'technical',
          mentions: [{ start: 0, end: 5, text: 'Zebra' }],
          importance: 0.8,
          context: 'Z term'
        },
        {
          id: 'entity-2',
          text: 'Apple',
          type: 'concept',
          mentions: [{ start: 10, end: 15, text: 'Apple' }],
          importance: 0.7,
          context: 'A term'
        }
      ];

      // Mock LLM failure
      vi.doMock('../../llm/openRouterClient', () => ({
        getOpenRouterClient: () => ({
          callWithFallback: vi.fn().mockRejectedValue(new Error('LLM failed')),
          parseJSONResponse: vi.fn()
        })
      }));

      const testGenerator = new VisualizationGenerator();
      const result = await testGenerator.generateVisualization(
        'terms-definitions',
        mockDocument,
        mockAnalysis
      );

      expect(result.terms[0].term).toBe('Apple');
      expect(result.terms[1].term).toBe('Zebra');
      
      vi.doUnmock('../../llm/openRouterClient');
    });
  });
});
