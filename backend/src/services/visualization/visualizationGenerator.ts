import { visualizationService } from '../../repositories/visualizationService.js';
import { DEPTH_ANALYSIS_PROMPT } from '../../prompts/depthAnalysisPrompt.js';

import type {
  Document,
  DocumentAnalysis,
  VisualizationType,
  MindMapData,
  FlowchartData,
  KnowledgeGraphData,
  DashboardData,
  TimelineData,
  TermsDefinitionsData,
  UMLDiagramData,
  ClassEntity,
  UMLRelationship,
  Package,
  TextSpan,
  Entity,
  HierarchyInfo,
  ArgumentMapData,
  ArgumentNode,
  ArgumentEdge,
  ArgumentPolarity,
  DepthGraphData,
} from '../../../../shared/src/types.js';

// Internal types for LLM extraction
interface UMLExtractionResult {
  classes: {
    name: string;
    type?: 'class' | 'interface' | 'abstract' | 'enum';
    stereotype?: string;
    package?: string;
    description?: string;
    sourceQuote?: string;
    attributes?: {
      name: string;
      type: string;
      visibility: 'public' | 'private' | 'protected' | 'package';
      isStatic: boolean;
      defaultValue?: string;
    }[];
    methods?: {
      name: string;
      returnType: string;
      visibility: 'public' | 'private' | 'protected' | 'package';
      isStatic: boolean;
      isAbstract: boolean;
      parameters: { name: string; type: string; defaultValue?: string }[];
    }[];
  }[];
  relationships: {
    source: string;
    target: string;
    type: 'inheritance' | 'realization' | 'composition' | 'aggregation' | 'association' | 'dependency';
    sourceMultiplicity?: string;
    targetMultiplicity?: string;
    sourceRole?: string;
    targetRole?: string;
    label?: string;
    description?: string;
    evidence?: string;
  }[];
  packages?: {
    name: string;
    classes: string[];
  }[];
}

export class VisualizationGenerator {
  async generateVisualization(
    type: VisualizationType,
    document: Document,
    analysis: DocumentAnalysis,
    force: boolean = false,
  ): Promise<any> {
    try {
      // First, check if visualization already exists in DynamoDB (skip for structured-view as it's stored in analyses table)
      // If force is true, skip this check to regenerate
      let existingVisualization = null;
      if (!force && type !== 'structured-view') {
        existingVisualization = await visualizationService.findByDocumentIdAndType(
          document.id,
          type,
        );
      }

      if (existingVisualization) {
        console.log(`✅ Found existing ${type} visualization for document ${document.id}`);
        return existingVisualization.visualizationData;
      }

      console.log(`🔄 Generating new ${type} visualization for document ${document.id}`);
      console.log(`📊 Document content length: ${document.content.length} characters`);
      console.log(`📊 Document sections count: ${document.structure.sections.length}`);
      console.log(`📊 Document hierarchy type: ${typeof document.structure.hierarchy}`);

      // Generate visualization based on type
      let visualizationData: any;
      const llmMetadata = {
        model: 'unknown',
        tokensUsed: 0,
        processingTime: 0,
        timestamp: new Date().toISOString(),
      };

      const startTime = Date.now();

      switch (type) {
        case 'structured-view':
          console.log(`🎯 Generating structured-view visualization for document ${document.id}`);
          visualizationData = this.generateStructuredView(document);
          console.log('✅ Structured-view generation completed');
          break;

        case 'mind-map':
          visualizationData = await this.generateMindMap(document, analysis);
          llmMetadata.model = 'mind-map-generation';
          break;

        case 'flowchart':
          visualizationData = this.generateFlowchart(document, analysis);
          break;

        case 'knowledge-graph':
          visualizationData = await this.generateKnowledgeGraph(document, analysis);
          llmMetadata.model = 'knowledge-graph-generation';
          break;

        case 'executive-dashboard':
          visualizationData = this.generateDashboard(analysis);
          break;

        case 'timeline':
          visualizationData = this.generateTimeline(document, analysis);
          break;

        case 'terms-definitions':
          visualizationData = await this.generateTermsDefinitions(document, analysis);
          llmMetadata.model = 'glossary-generation';
          break;

        case 'uml-class-diagram':
          visualizationData = await this.generateUMLClassDiagram(document, analysis);
          llmMetadata.model = 'uml-extraction';
          break;

        case 'argument-map':
          visualizationData = await this.generateArgumentMap(document, analysis);
          llmMetadata.model = 'argument-map-generation';
          break;

        case 'depth-graph':
          visualizationData = await this.generateDepthGraph(document, analysis);
          llmMetadata.model = 'depth-analysis';
          break;

        default:
          throw new Error(`Visualization type ${type} not yet implemented`);
      }

      // Calculate processing time
      llmMetadata.processingTime = Date.now() - startTime;

      // Store the generated visualization in DynamoDB (skip for structured-view as it's stored in analyses table)
      if (type !== 'structured-view') {
        const visualizationRecord = {
          documentId: document.id,
          visualizationType: type,
          visualizationData,
          llmMetadata,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await visualizationService.create(visualizationRecord);
        console.log(`✅ Stored ${type} visualization in DynamoDB for document ${document.id}`);
      }

      return visualizationData;
    } catch (error) {
      console.error(`❌ Failed to generate ${type} visualization for document ${document.id}:`, error);
      throw new Error(`Failed to generate ${type} visualization: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generateStructuredView(document: Document) {
    console.log(`🏗️ generateStructuredView called for document: ${document.title}`);
    console.log('📊 Document structure:', {
      sectionsCount: document.structure.sections.length,
      hierarchyLength: document.structure.hierarchy.length,
      totalLines: document.content.split('\\n').length,
    });

    // Debug document structure content
    console.log('📋 First 3 sections:', document.structure.sections.slice(0, 3).map(s => ({
      id: s.id,
      title: s.title,
      childrenCount: s.children?.length || 0,
      contentLength: s.content.length,
    })));

    // Return the document structure with sections
    const result = {
      type: 'structured-view',
      sections: document.structure.sections,
      hierarchy: document.structure.hierarchy,
    };

    console.log('✅ generateStructuredView returning:', {
      type: result.type,
      sectionsCount: result.sections.length,
      hierarchyLength: result.hierarchy.length,
    });

    return result;
  }

  private async generateMindMap(document: Document, analysis: DocumentAnalysis): Promise<MindMapData> {
    // Use LLM to generate a meaningful mind map structure
    const { getOpenRouterClient } = await import('../llm/openRouterClient.js');
    const llmClient = getOpenRouterClient();

    try {
      // Prepare document content for LLM (limit size)
      const contentSample = document.content.substring(0, 8000);
      const prompt = `Document Title: ${document.title}\n\nTLDR: ${analysis.tldr}\n\nContent:\n${contentSample}`;

      const response = await llmClient.callWithFallback('mindMapGeneration', prompt);

      // Parse LLM response
      const parsed = llmClient.parseJSONResponse<{ nodes: any[] }>(response);

      if (parsed.nodes && parsed.nodes.length > 0) {
        // Convert LLM nodes to mind map structure
        const root = this.convertLLMNodeToMindMapNode(parsed.nodes[0], 0);

        return {
          root,
          layout: 'radial',
          theme: {
            primary: '#4F46E5',
            secondary: '#7C3AED',
            accent: '#10B981',
            background: '#FFFFFF',
            text: '#1F2937',
          },
        };
      }
    } catch (error) {
      console.error('LLM mind map generation failed:', error);
      throw error; // Fail fast - no fallback
    }

    // If we reach here, generation failed - throw error
    throw new Error('Unable to generate mind map visualization. Please check your document content and try again. If the issue persists, the document may not contain sufficient structure for visualization.');
  }

  private convertLLMNodeToMindMapNode(node: any, level: number): any {
    const colors = ['#4F46E5', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];
    const colorIndex = level % colors.length;

    // Fallback emojis if LLM doesn't provide one
    const fallbackEmojis = ['📄', '📊', '🔧', '💡', '🌐', '📈', '⚙️'];

    return {
      id: node.id || `node-${Math.random().toString(36).substr(2, 9)}`,
      label: node.label || 'Untitled',
      subtitle: node.subtitle || (node.summary || '').substring(0, 40),
      icon: node.icon || fallbackEmojis[level % fallbackEmojis.length],
      summary: node.summary || '',
      detailedExplanation: node.detailedExplanation || node.summary || 'No additional details available.',
      sourceTextExcerpt: node.sourceTextExcerpt,
      children: (node.children || []).map((child: any) =>
        this.convertLLMNodeToMindMapNode(child, level + 1),
      ),
      level,
      color: colors[colorIndex],
      sourceRef: { start: 0, end: 0, text: '' },
      metadata: {
        importance: node.importance || Math.max(0.3, 0.9 - (level * 0.15)),
        confidence: 0.85,
      },
    };
  }


  private convertSectionsToMindMapNodes(sections: any[], level: number): any[] {
    const colors = ['#4F46E5', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];
    const fallbackEmojis = ['📊', '🔧', '💡', '🌐', '📈', '⚙️', '🏗️'];

    return sections.map((section, index) => {
      const colorIndex = level % colors.length;
      const summary = section.summary || `${section.content.substring(0, 100)}...`;

      return {
        id: section.id,
        label: section.title,
        subtitle: summary.substring(0, 40),
        icon: fallbackEmojis[index % fallbackEmojis.length],
        summary,
        detailedExplanation: section.summary || section.content.substring(0, 300),
        sourceTextExcerpt: section.content.substring(0, 200),
        children: section.children ? this.convertSectionsToMindMapNodes(section.children, level + 1) : [],
        level,
        color: colors[colorIndex],
        sourceRef: {
          start: section.startIndex || 0,
          end: section.endIndex || 0,
          text: section.content.substring(0, 50),
        },
        metadata: {
          importance: Math.max(0.3, 0.9 - (level * 0.15)),
          confidence: 0.85,
        },
      };
    });
  }

  private generateFlowchart(document: Document, analysis: DocumentAnalysis): FlowchartData {
    // Simple flowchart from sections
    const nodes = document.structure.sections.map((section, index) => ({
      id: section.id,
      type: index === 0 ? 'start'
        : index === document.structure.sections.length - 1 ? 'end'
          : 'process' as any,
      label: section.title,
      description: section.summary || '',
      position: { x: 100, y: 100 + (index * 150) },
    }));

    const edges = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      edges.push({
        id: `edge-${i}`,
        source: nodes[i].id,
        target: nodes[i + 1].id,
        type: 'solid' as any,
      });
    }

    return {
      nodes,
      edges,
      layout: 'topToBottom',
    };
  }

  private async generateKnowledgeGraph(document: Document, analysis: DocumentAnalysis): Promise<KnowledgeGraphData> {
    // Use LLM to generate a comprehensive knowledge graph
    const { getOpenRouterClient } = await import('../llm/openRouterClient.js');
    const llmClient = getOpenRouterClient();

    try {
      // Prepare document content for LLM (limit size)
      const contentSample = document.content.substring(0, 10000);
      const tldrText = typeof analysis.tldr === 'string' ? analysis.tldr : analysis.tldr.text;

      const prompt = `Document Title: ${document.title}\n\nTLDR: ${tldrText}\n\nContent:\n${contentSample}`;

      const response = await llmClient.callWithFallback('knowledge-graph-generation', prompt);

      // Parse LLM response
      const parsed = llmClient.parseJSONResponse<{
        nodes: any[];
        edges: any[];
        clusters: any[];
        hierarchy: any;
      }>(response);

      if (parsed.nodes && parsed.nodes.length > 0) {
        // Convert LLM nodes to knowledge graph structure
        const nodes = parsed.nodes.map((node: any, index: number) => ({
          id: node.id || `node-${index}`,
          label: node.label || 'Untitled',
          type: node.type || 'concept',
          size: node.size || Math.max(20, node.importance * 50 + 20) || 70,
          color: node.color || this.getEntityColor(node.type),
          metadata: {
            centrality: node.importance || 0.5,
            connections: 0,
            description: node.description || '',
            sourceQuote: node.sourceQuote || '',
            sourceSpan: node.sourceSpan || undefined,
          },
        }));

        // Convert LLM edges to knowledge graph structure
        const edges = parsed.edges
          .map((rel: any, index: number) => ({
            id: rel.id || `rel-${index}`,
            source: rel.source,
            target: rel.target,
            type: rel.type || 'relates-to',
            strength: rel.strength || 0.5,
            label: rel.label || rel.type || 'relates-to',
            evidence: rel.evidence || [],
          }))
          .filter((edge: any) => edge.source && edge.target);

        // Validate and fix edge connections
        const nodeIds = new Set(nodes.map(n => n.id));
        const validEdges = edges.filter(edge => nodeIds.has(edge.source) && nodeIds.has(edge.target));

        if (validEdges.length !== edges.length) {
          console.warn(`🔧 Fixed ${edges.length - validEdges.length} invalid edges in knowledge graph`);
        }

        // Update connection counts
        validEdges.forEach(edge => {
          const sourceNode = nodes.find(n => n.id === edge.source);
          const targetNode = nodes.find(n => n.id === edge.target);
          if (sourceNode) sourceNode.metadata.connections++;
          if (targetNode) targetNode.metadata.connections++;
        });

        // Extract hierarchy info
        const hierarchy = parsed.hierarchy || {
          rootNodes: nodes.filter(n => !validEdges.some(e => e.target === n.id)).map(n => n.id),
          maxDepth: 0,
          nodeDepths: nodes.reduce((acc, node) => ({ ...acc, [node.id]: 0 }), {}),
        };

        console.log(`✅ Knowledge graph generated: ${nodes.length} nodes, ${validEdges.length} edges`);

        return {
          nodes,
          edges: validEdges,
          clusters: parsed.clusters || [], // Computed on frontend if not provided
          hierarchy,
        };
      }
    } catch (error) {
      console.error('LLM knowledge graph generation failed:', error);
      throw error; // Fail fast - no fallback
    }

    // If we reach here, generation failed - throw error
    throw new Error('Unable to generate knowledge graph visualization. Please check your document content and try again. The document may not contain sufficient structure for knowledge graph generation.');
  }

  private extractSourceQuote(entity: Entity, document?: Document): string {
    if (!document || entity.mentions.length === 0) return '';

    const mention = entity.mentions[0];
    // Extract surrounding context (50 chars before/after)
    const start = Math.max(0, mention.start - 50);
    const end = Math.min(document.content.length, mention.end + 50);
    return document.content.substring(start, end);
  }

  private buildHierarchy(
    nodes: any[],
    hierarchicalEdges: any[],
  ): HierarchyInfo {
    const nodeDepths = new Map<string, number>();
    const parentMap = new Map<string, string>();
    const childrenMap = new Map<string, string[]>();

    // Initialize maps
    nodes.forEach(node => {
      nodeDepths.set(node.id, 0);
      childrenMap.set(node.id, []);
    });

    // Build parent-child relationships
    hierarchicalEdges.forEach(edge => {
      const parentId = edge.source;
      const childId = edge.target;

      parentMap.set(childId, parentId);
      const children = childrenMap.get(parentId) || [];
      children.push(childId);
      childrenMap.set(parentId, children);
    });

    // Calculate depths using BFS
    const rootNodes = nodes
      .filter(node => !parentMap.has(node.id))
      .map(node => node.id);

    const queue = rootNodes.map(id => ({ id, depth: 0 }));
    let maxDepth = 0;

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      nodeDepths.set(id, depth);
      maxDepth = Math.max(maxDepth, depth);

      const children = childrenMap.get(id) || [];
      children.forEach(childId => {
        queue.push({ id: childId, depth: depth + 1 });
      });
    }

    return {
      rootNodes,
      maxDepth,
      nodeDepths,
    };
  }

  private generateDashboard(analysis: DocumentAnalysis): DashboardData {
    const charts: any[] = [
      {
        type: 'bar',
        title: 'Key Metrics',
        data: analysis.executiveSummary.kpis.map(kpi => ({
          name: kpi.label,
          value: kpi.value,
        })),
      },
    ];

    // Add Signals Chart if available
    if (analysis.signals) {
      charts.push({
        type: 'radar',
        title: 'Document DNA',
        data: Object.entries(analysis.signals).map(([key, value]) => ({
          subject: key.charAt(0).toUpperCase() + key.slice(1),
          A: value,
          fullMark: 1,
        })),
      });
    }

    return {
      executiveCard: analysis.executiveSummary,
      kpiTiles: analysis.executiveSummary.kpis,
      charts,
    };
  }

  private generateTimeline(document: Document, analysis: DocumentAnalysis): TimelineData {
    // Extract dates from entities
    const dateEntities = analysis.entities.filter(e => e.type === 'date');

    const events = dateEntities.map((entity, index) => ({
      id: `event-${index}`,
      title: entity.text,
      description: entity.context || '',
      date: new Date(), // TODO: parse actual date
      category: 'general',
      color: '#4F46E5',
    }));

    return {
      events,
      scale: 'month',
    };
  }

  private async generateTermsDefinitions(
    document: Document,
    analysis: DocumentAnalysis,
  ): Promise<TermsDefinitionsData> {
    const { getOpenRouterClient } = await import('../llm/openRouterClient.js');
    const llmClient = getOpenRouterClient();

    try {
      // Prepare document content (limit to 10000 chars for context)
      const contentSample = document.content.substring(0, 10000);
      const prompt = `Document Title: ${document.title}\n\nTLDR: ${analysis.tldr}\n\nContent:\n${contentSample}\n\nExtract 10-50 key terms, technical jargon, and acronyms. Provide context-aware definitions based on the document's domain. Return as raw JSON array with format (no markdown): { "terms": [{ "term": "...", "definition": "...", "type": "acronym|technical|jargon|concept", "confidence": 0.0-1.0, "mentions": number, "context": "..." }], "domain": "..." }`;

      const response = await llmClient.callWithFallback('glossary', prompt);
      const parsed = llmClient.parseJSONResponse<{ terms: any[], domain?: string }>(response);

      if (parsed.terms && parsed.terms.length > 0) {
        // Sort terms alphabetically
        const sortedTerms = parsed.terms
          .map((t, index) => ({
            id: `term-${index}`,
            term: t.term || t.text || 'Unknown',
            definition: t.definition || 'No definition provided',
            type: t.type || 'concept',
            confidence: t.confidence || 0.8,
            mentions: t.mentions || 1,
            context: t.context,
          }))
          .sort((a, b) => a.term.localeCompare(b.term));

        return {
          terms: sortedTerms,
          metadata: {
            totalTerms: sortedTerms.length,
            extractionConfidence: 0.85,
            documentDomain: parsed.domain || 'general',
          },
        };
      }
    } catch (error) {
      console.error('LLM glossary extraction failed:', error);
      throw error; // Fail fast - no fallback
    }

    // If we reach here, generation failed - throw error
    throw new Error('Unable to generate terms and definitions visualization. Please check your document content and try again. The document may not contain enough technical terms for extraction.');
  }


  private async generateUMLClassDiagram(
    document: Document,
    analysis: DocumentAnalysis,
  ): Promise<UMLDiagramData> {
    const { getOpenRouterClient } = await import('../llm/openRouterClient.js');
    const llmClient = getOpenRouterClient();

    // Prepare context
    const contentSample = document.content.substring(0, 15000);
    const tldrText = typeof analysis.tldr === 'string' ? analysis.tldr : analysis.tldr.text;
    const prompt = this.buildUMLExtractionPrompt(document, analysis, contentSample);

    try {
      const response = await llmClient.callWithFallback('uml-extraction', prompt);
      const parsed = llmClient.parseJSONResponse<UMLExtractionResult>(response);

      if (parsed.classes && parsed.classes.length > 0) {
        return this.processUMLExtraction(parsed, document);
      }
    } catch (error) {
      console.error('LLM UML extraction failed:', error);
      throw error; // Fail fast - no fallback
    }

    // If we reach here, generation failed - throw error
    throw new Error('Unable to generate UML class diagram visualization. Please check your document content and try again. The document may not contain sufficient software architecture information for UML extraction.');
  }

  private buildUMLExtractionPrompt(
    document: Document,
    analysis: DocumentAnalysis,
    content: string,
  ): string {
    const tldrText = typeof analysis.tldr === 'string' ? analysis.tldr : analysis.tldr.text;

    return `Document Title: ${document.title}
TLDR: ${tldrText}

Content:
${content}

You are an expert software architect. Your task is to extract a comprehensive UML Class Diagram from the above document.

CRITICAL INSTRUCTIONS:
1. Extract ALL classes, interfaces, and enums mentioned or implied in the text. Do not limit yourself to a small number.
2. If the text describes a system with many components, ensure you capture at least 5-10 classes if possible.
3. For each class, infer attributes and methods from the context.
4. Identify relationships (inheritance, dependency, composition, etc.) between these classes.
5. Be exhaustive. It is better to include a speculative class than to miss a core component.

Output the result as a raw JSON object matching the defined schema. Do not use markdown code blocks.`;
  }

  private processUMLExtraction(
    parsed: UMLExtractionResult,
    document: Document,
  ): UMLDiagramData {
    // Process classes
    const classes: ClassEntity[] = parsed.classes.map((cls, index) => ({
      id: `class-${index}`,
      name: cls.name,
      type: cls.type || 'class',
      stereotype: cls.stereotype,
      package: cls.package,
      attributes: (cls.attributes || []).map((attr, attrIndex) => ({
        ...attr,
        id: `attr-${index}-${attrIndex}`,
      })),
      methods: (cls.methods || []).map((method, methodIndex) => ({
        ...method,
        id: `method-${index}-${methodIndex}`,
      })),
      description: cls.description || '',
      sourceQuote: cls.sourceQuote || '',
      sourceSpan: this.findTextSpan(document.content, cls.sourceQuote || ''),
      documentLink: `#document-${document.id}`,
    }));

    // Create class name to ID mapping
    const nameToId = new Map(classes.map(c => [c.name, c.id]));

    // Process relationships
    const relationships: UMLRelationship[] = parsed.relationships
      .map((rel, index): UMLRelationship | null => {
        const sourceId = nameToId.get(rel.source);
        const targetId = nameToId.get(rel.target);

        if (!sourceId || !targetId) {
          console.warn(`Relationship references unknown class: ${rel.source} -> ${rel.target}`);
          return null;
        }

        return {
          id: `rel-${index}`,
          source: sourceId,
          target: targetId,
          type: rel.type,
          sourceMultiplicity: rel.sourceMultiplicity,
          targetMultiplicity: rel.targetMultiplicity,
          sourceRole: rel.sourceRole,
          targetRole: rel.targetRole,
          label: rel.label,
          description: rel.description || '',
          sourceQuote: rel.evidence || '',
          evidence: [rel.evidence || ''],
        };
      })
      .filter((rel): rel is UMLRelationship => rel !== null);

    // Process packages
    const packages: Package[] = parsed.packages?.map((pkg, index) => ({
      id: `pkg-${index}`,
      name: pkg.name,
      classes: pkg.classes.map(name => nameToId.get(name)).filter(Boolean) as string[],
      color: this.getPackageColor(index),
    })) || [];

    return {
      classes,
      relationships,
      packages,
      metadata: {
        totalClasses: classes.length,
        totalRelationships: relationships.length,
        extractionConfidence: 0.85,
        documentDomain: this.detectDomain(document.content),
        generatedAt: new Date().toISOString(),
      },
    };
  }

  private findTextSpan(content: string, quote: string): TextSpan | null {
    if (!quote) return null;

    const index = content.indexOf(quote);
    if (index === -1) return null;

    return {
      start: index,
      end: index + quote.length,
      text: quote,
    };
  }

  private getPackageColor(index: number): string {
    const colors = ['#DBEAFE', '#FEE2E2', '#D1FAE5', '#FEF3C7', '#E0E7FF', '#FCE7F3'];
    return colors[index % colors.length];
  }

  private detectDomain(content: string): string {
    const keywords = {
      'web': ['http', 'api', 'rest', 'endpoint', 'controller'],
      'database': ['table', 'query', 'repository', 'entity', 'orm'],
      'business': ['service', 'transaction', 'workflow', 'process'],
      'ui': ['component', 'view', 'render', 'template', 'widget'],
    };

    const lowerContent = content.toLowerCase();
    const scores = Object.entries(keywords).map(([domain, words]) => ({
      domain,
      score: words.filter(word => lowerContent.includes(word)).length,
    }));

    scores.sort((a, b) => b.score - a.score);
    return scores[0]?.domain || 'general';
  }


  private async generateDepthGraph(
    document: Document,
    analysis: DocumentAnalysis,
  ): Promise<DepthGraphData> {
    const { getOpenRouterClient } = await import('../llm/openRouterClient.js');
    const llmClient = getOpenRouterClient();

    // Prepare context
    const contentSample = document.content.substring(0, 15000);
    const tldrText = typeof analysis.tldr === 'string' ? analysis.tldr : analysis.tldr.text;

    const prompt = `${DEPTH_ANALYSIS_PROMPT}

Input Document:
Title: ${document.title}
TLDR: ${tldrText}

Content:
${contentSample}
`;

    try {
      const response = await llmClient.callWithFallback('depthAnalysis', prompt);
      const parsed = llmClient.parseJSONResponse<DepthGraphData>(response);

      if (parsed.logical_units && parsed.logical_units.length > 0) {
        return parsed;
      }
    } catch (error) {
      console.error('LLM depth graph generation failed:', error);
      throw error; // Fail fast - no fallback
    }

    // If we reach here, generation failed - throw error
    throw new Error('Unable to generate depth graph visualization. Please check your document content and try again.');
  }

  private mapRelationshipType(type: string): UMLRelationship['type'] {
    const mapping: Record<string, UMLRelationship['type']> = {
      'extends': 'inheritance',
      'implements': 'realization',
      'contains': 'composition',
      'has': 'aggregation',
      'uses': 'dependency',
      'relates-to': 'association',
    };

    return mapping[type] || 'association';
  }

  private async generateArgumentMap(
    _document: Document,
    _analysis: DocumentAnalysis,
  ): Promise<ArgumentMapData> {
    const { getOpenRouterClient } = await import('../llm/openRouterClient.js');
    const llmClient = getOpenRouterClient();

    // Prepare context
    const contentSample = _document.content.substring(0, 12000);
    const tldrText = typeof _analysis.tldr === 'string' ? _analysis.tldr : _analysis.tldr.text;

    const prompt = `Document Title: ${_document.title}
TLDR: ${tldrText}

Content:
${contentSample}

You are an expert in argument analysis. Generate a comprehensive Argument Map from the text.

CRITICAL INSTRUCTIONS:
1. Identify the Main Claim and all supporting/attacking arguments and evidence.
2. For EACH node, you MUST calculate "Depth Metrics" (0.0 - 1.0):
   - Cohesion: Structural integrity and logical consistency.
   - Nuance: Perspective diversity and complexity.
   - Grounding: Quality of evidence and factual support.
   - Tension: Degree of argumentative conflict or debate.
   - Confidence: Your confidence in EACH of the above scores.
3. Return a raw JSON object with "nodes" and "edges". Do not use markdown code blocks.

Node Schema:
{
  "id": "string",
  "type": "claim" | "argument" | "evidence" | "counterargument" | "rebuttal",
  "label": "string (short title)",
  "summary": "string (1-2 sentences)",
  "polarity": "support" | "attack" | "neutral",
  "confidence": number (0-1),
  "impact": "low" | "medium" | "high",
  "depthMetrics": {
    "cohesion": number,
    "nuance": number,
    "grounding": number,
    "tension": number,
    "confidence": {
      "cohesion": number,
      "nuance": number,
      "grounding": number,
      "tension": number,
      "composite": number
    }
  }
}
`;

    try {
      const response = await llmClient.callWithFallback('argumentMapGeneration', prompt);
      const parsed = llmClient.parseJSONResponse<{
        nodes: ArgumentNode[];
        edges: ArgumentEdge[];
        metadata?: { mainClaimId: string; totalClaims: number; totalEvidence: number };
      }>(response);

      if (parsed.nodes && parsed.nodes.length > 0) {
        // Ensure all nodes have required fields
        const nodes: ArgumentNode[] = parsed.nodes.map((node, index) => ({
          id: node.id || `node-${index}`,
          type: node.type || 'claim',
          label: node.label || 'Untitled',
          summary: node.summary || '',
          polarity: node.polarity || 'neutral',
          confidence: node.confidence ?? 0.8,
          impact: node.impact || 'medium',
          depthMetrics: node.depthMetrics,
          source: node.source,
          parentId: node.parentId,
          isCollapsed: node.isCollapsed ?? false,
        }));

        // Ensure all edges have required fields
        const edges: ArgumentEdge[] = (parsed.edges || []).map((edge, index) => ({
          id: edge.id || `edge-${index}`,
          source: edge.source,
          target: edge.target,
          type: edge.type || 'supports',
          strength: edge.strength ?? 0.8,
          rationale: edge.rationale,
        }));

        return {
          nodes,
          edges,
          metadata: parsed.metadata || {
            mainClaimId: nodes.length > 0 ? nodes[0].id : '',
            totalClaims: nodes.filter(n => n.type === 'claim').length,
            totalEvidence: nodes.filter(n => n.type === 'evidence').length,
          },
        };
      }
    } catch (error) {
      console.error('LLM argument map generation failed:', error);
      throw error; // Fail fast - no fallback
    }

    // If we reach here, generation failed - throw error
    throw new Error('Unable to generate argument map visualization. Please check your document content and try again. The document may not contain sufficient argumentative structure for analysis.');
  }


  private getEntityColor(type: string): string {
    const colors: Record<string, string> = {
      person: '#3B82F6',
      organization: '#8B5CF6',
      location: '#10B981',
      concept: '#F59E0B',
      product: '#EF4444',
      metric: '#06B6D4',
      date: '#EC4899',
      technical: '#6366F1',
    };
    return colors[type] || '#6B7280';
  }
}

export const visualizationGenerator = new VisualizationGenerator();
