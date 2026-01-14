import { describe, it, expect, beforeEach, vi } from 'vitest';

import { VisualizationGenerator } from '../visualizationGenerator';

import type { Document, DocumentAnalysis, MindMapData, UMLDiagramData } from '../../../../../shared/src/types';

// Use vi.hoisted to ensure mock variables are initialized before vi.mock()
const mocks = vi.hoisted(() => ({
  // LLM mocks
  callWithFallback: vi.fn(),
  parseJSONResponse: vi.fn(),

  // Service mocks
  findByDocumentIdAndType: vi.fn(),
  create: vi.fn(),
  findByDocumentId: vi.fn(),
  update: vi.fn(),
  deleteVisualization: vi.fn(),
}));

// Mock the OpenRouter client
vi.mock('../../llm/openRouterClient', () => ({
  getOpenRouterClient: () => ({
    callWithFallback: mocks.callWithFallback,
    parseJSONResponse: mocks.parseJSONResponse,
  }),
}));

// Mock visualizationService to prevent DynamoDB access
vi.mock('../../../repositories/visualizationService', () => ({
  visualizationService: {
    create: mocks.create,
    findByDocumentIdAndType: mocks.findByDocumentIdAndType,
    findByDocumentId: mocks.findByDocumentId,
    update: mocks.update,
    deleteVisualization: mocks.deleteVisualization,
  },
}));

describe('VisualizationGenerator', () => {
  let generator: VisualizationGenerator;
  let mockDocument: Document;
  let mockAnalysis: DocumentAnalysis;

  // Default Mind Map Response
  const defaultMindMapResponse = {
    nodes: [
      {
        id: 'root',
        label: 'Test Document',
        subtitle: 'A test document for mind map',
        icon: '📄',
        summary: 'A test document for mind map generation',
        detailedExplanation: 'Details...',
        sourceTextExcerpt: 'Excerpt...',
        importance: 1.0,
        children: [
          {
            id: 'node-1',
            label: 'Section 1',
            icon: '📊',
            summary: 'First section',
            detailedExplanation: 'Details 1...',
            sourceTextExcerpt: 'Excerpt 1...',
            importance: 0.8,
            children: [
              {
                id: 'node-1-1',
                label: 'Subsection 1.1',
                icon: '🔧',
                summary: 'First subsection',
                detailedExplanation: 'Details 1.1...',
                sourceTextExcerpt: 'Excerpt 1.1...',
                importance: 0.6,
                children: [],
              },
            ],
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    generator = new VisualizationGenerator();

    // Reset LLM mocks
    mocks.callWithFallback.mockReset();
    mocks.parseJSONResponse.mockReset();

    // Reset Visualization Service mocks
    mocks.findByDocumentIdAndType.mockReset();
    mocks.findByDocumentIdAndType.mockResolvedValue(null);
    mocks.create.mockReset();
    mocks.create.mockResolvedValue(undefined);
    mocks.findByDocumentId.mockReset();
    mocks.update.mockReset();
    mocks.deleteVisualization.mockReset();

    // Setup default behavior (Mind Map)
    mocks.callWithFallback.mockResolvedValue({
      content: JSON.stringify(defaultMindMapResponse),
    });
    mocks.parseJSONResponse.mockImplementation((response) => JSON.parse(response.content));

    mockDocument = {
      id: 'test-doc-1',
      title: 'Test Document',
      content: 'This is a test document with some content.',
      metadata: {
        wordCount: 8,
        uploadDate: new Date(),
        fileType: 'txt',
        language: 'en',
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
            children: [],
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
            children: [],
          },
        ],
        hierarchy: [],
      },
    };

    mockAnalysis = {
      tldr: 'This is a test document summary',
      executiveSummary: {
        headline: 'Test Document',
        keyIdeas: ['Idea 1', 'Idea 2'],
        kpis: [],
        risks: [],
        opportunities: [],
        callToAction: 'Review the document',
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
        temporal: 0.2,
      },
      recommendations: [],
    };
  });

  describe('generateVisualization', () => {
    it('should generate structured view', async () => {
      const result = await generator.generateVisualization(
        'structured-view',
        mockDocument,
        mockAnalysis,
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
        mockAnalysis,
      );

      expect(result).toBeDefined();
      expect(result.root).toBeDefined();
      expect(result.layout).toBe('radial');
    });

    it('should generate flowchart', async () => {
      const result = await generator.generateVisualization(
        'flowchart',
        mockDocument,
        mockAnalysis,
      );

      expect(result).toBeDefined();
      expect(result.nodes).toBeDefined();
      expect(result.edges).toBeDefined();
      expect(result.layout).toBe('topToBottom');
    });

    it('should generate knowledge graph', async () => {
      // Override mock for Knowledge Graph
      const kgResponse = {
        nodes: [
          { id: 'n1', label: 'Node 1', type: 'concept', importance: 0.8 },
          { id: 'n2', label: 'Node 2', type: 'concept', importance: 0.7 },
        ],
        edges: [
          { source: 'n1', target: 'n2', type: 'relates-to', strength: 0.5 },
        ],
        clusters: [],
        hierarchy: {},
      };
      mocks.callWithFallback.mockResolvedValue({
        content: JSON.stringify(kgResponse),
      });

      const result = await generator.generateVisualization(
        'knowledge-graph',
        mockDocument,
        mockAnalysis,
      );

      expect(result).toBeDefined();
      expect(result.nodes).toHaveLength(2);
      expect(result.edges).toHaveLength(1);
    });

    it('should force regeneration when force flag is true', async () => {
      // Override cache to return something
      mocks.findByDocumentIdAndType.mockResolvedValue({
        visualizationData: { some: 'cached data' },
      } as any);

      await generator.generateVisualization(
        'mind-map',
        mockDocument,
        mockAnalysis,
        true, // force=true
      );

      // If force=true, it should NOT call findByDocumentIdAndType
      expect(mocks.findByDocumentIdAndType).not.toHaveBeenCalled();
    });

    it('should throw error for unsupported visualization type', async () => {
      await expect(
        generator.generateVisualization(
          'unsupported-type' as any,
          mockDocument,
          mockAnalysis,
        ),
      ).rejects.toThrowError('Visualization type unsupported-type not yet implemented');
    });
  });

  describe('Mind Map Generation', () => {
    it('should create hierarchical structure from LLM response', async () => {
      const result = (await generator.generateVisualization(
        'mind-map',
        mockDocument,
        mockAnalysis,
      )) as MindMapData;

      expect(result.root).toBeDefined();
      expect(result.root.children).toHaveLength(1); // Based on default mock
      expect(result.root.children[0].label).toBe('Section 1');
    });

    it('should assign colors based on hierarchy level', async () => {
      const result = (await generator.generateVisualization(
        'mind-map',
        mockDocument,
        mockAnalysis,
      )) as MindMapData;

      expect(result.root.color).toBeDefined();
      expect(result.root.children[0].color).toBeDefined();
    });

    it('should throw error on LLM failure', async () => {
      mocks.callWithFallback.mockRejectedValue(new Error('LLM failed'));

      await expect(
        generator.generateVisualization(
          'mind-map',
          mockDocument,
          mockAnalysis,
        ),
      ).rejects.toThrow('LLM failed');
    });
  });

  describe('Terms & Definitions Generation', () => {
    beforeEach(() => {
      // Override mock for Terms
      const termsResponse = {
        terms: [
          { term: 'API', definition: 'App Interface', type: 'acronym', confidence: 0.9, mentions: 5 },
          { term: 'Microservices', definition: 'Arch style', type: 'technical', confidence: 0.8, mentions: 3 },
        ],
        domain: 'software',
      };
      mocks.callWithFallback.mockResolvedValue({
        content: JSON.stringify(termsResponse),
      });
    });

    it('should generate terms definitions with LLM', async () => {
      const result = await generator.generateVisualization(
        'terms-definitions',
        mockDocument,
        mockAnalysis,
      );

      expect(result).toBeDefined();
      expect(result.terms).toHaveLength(2);
      expect(result.metadata.totalTerms).toBe(2);
    });

    it('should sort terms alphabetically', async () => {
      // Mock unsorted response
      const termsResponse = {
        terms: [
          { term: 'Zebra', definition: 'Z', type: 'concept' },
          { term: 'Alpha', definition: 'A', type: 'concept' },
        ],
      };
      mocks.callWithFallback.mockResolvedValue({
        content: JSON.stringify(termsResponse),
      });

      const result = await generator.generateVisualization(
        'terms-definitions',
        mockDocument,
        mockAnalysis,
      );

      expect(result.terms[0].term).toBe('Alpha');
      expect(result.terms[1].term).toBe('Zebra');
    });

    it('should throw error on LLM failure', async () => {
      mocks.callWithFallback.mockRejectedValue(new Error('LLM failed'));

      await expect(
        generator.generateVisualization(
          'terms-definitions',
          mockDocument,
          mockAnalysis,
        ),
      ).rejects.toThrow('LLM failed');
    });
  });

  describe('UML Class Diagram Generation', () => {
    beforeEach(() => {
      // Override mock for UML
      const umlResponse = {
        classes: [
          { name: 'User', type: 'class', attributes: [], methods: [] },
          { name: 'Order', type: 'class', attributes: [], methods: [] },
        ],
        relationships: [
          { source: 'Order', target: 'User', type: 'association' },
        ],
        packages: [],
      };
      mocks.callWithFallback.mockResolvedValue({
        content: JSON.stringify(umlResponse),
      });
    });

    it('should generate UML class diagram with LLM', async () => {
      const result = await generator.generateVisualization(
        'uml-class-diagram',
        mockDocument,
        mockAnalysis,
      ) as UMLDiagramData;

      expect(result).toBeDefined();
      expect(result.classes).toHaveLength(2);
      expect(result.relationships).toHaveLength(1);
    });

    it('should filter out invalid relationships', async () => {
      const umlResponse = {
        classes: [
          { name: 'User', type: 'class', attributes: [], methods: [] },
        ],
        relationships: [
          { source: 'User', target: 'Unknown', type: 'association' },
        ],
      };
      mocks.callWithFallback.mockResolvedValue({
        content: JSON.stringify(umlResponse),
      });

      const result = await generator.generateVisualization(
        'uml-class-diagram',
        mockDocument,
        mockAnalysis,
      ) as UMLDiagramData;

      expect(result.classes).toHaveLength(1);
      expect(result.relationships).toHaveLength(0);
    });
  });

  describe('Depth Graph Generation', () => {
    beforeEach(() => {
      const depthResponse = {
        analysis_metadata: {
          total_logical_units: 1,
          overall_text_depth_trajectory: 'Linear increase in complexity.',
        },
        logical_units: [
          {
            id: 1,
            topic: 'Thesis',
            topic_summary: 'Main thesis.',
            extended_summary: 'Detailed thesis...',
            true_depth: 7.5,
            dimensions: {
              cognitive: { score: 7, rationale: 'R', evidence: ['E'] },
              epistemic: { score: 8, rationale: 'R', evidence: ['E'] },
              causal: { score: 7, rationale: 'R', evidence: ['E'] },
              rigor: { score: 8, rationale: 'R', evidence: ['E'] },
              coherence: { score: 8, rationale: 'R', evidence: ['E'] },
            },
            clarity_signals: { grounding: ['G'], nuance: ['N'] },
            actionable_feedback: 'Feedback.',
            additional_data: { text_preview: 'Text...', coherence_analysis: 'Coh...' },
          },
        ],
      };
      mocks.callWithFallback.mockResolvedValue({
        content: JSON.stringify(depthResponse),
      });
    });

    it('should generate depth graph with LLM', async () => {
      const result = await generator.generateVisualization(
        'depth-graph',
        mockDocument,
        mockAnalysis,
      );

      expect(result).toBeDefined();
      expect(result.logical_units).toHaveLength(1);
      expect(result.analysis_metadata.total_logical_units).toBe(1);
    });

    it('should throw error on LLM failure', async () => {
      mocks.callWithFallback.mockRejectedValue(new Error('LLM failed'));

      await expect(
        generator.generateVisualization(
          'depth-graph',
          mockDocument,
          mockAnalysis,
        ),
      ).rejects.toThrow('LLM failed');
    });
  });
});
