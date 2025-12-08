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
  Entity,
  HierarchyInfo
} from '../../../../shared/src/types.js';

export class VisualizationGenerator {
  async generateVisualization(
    type: VisualizationType,
    document: Document,
    analysis: DocumentAnalysis
  ): Promise<any> {
    switch (type) {
      case 'structured-view':
        return this.generateStructuredView(document);
      
      case 'mind-map':
        return await this.generateMindMap(document, analysis);
      
      case 'flowchart':
        return this.generateFlowchart(document, analysis);
      
      case 'knowledge-graph':
        return this.generateKnowledgeGraph(analysis, document);
      
      case 'executive-dashboard':
        return this.generateDashboard(analysis);
      
      case 'timeline':
        return this.generateTimeline(document, analysis);
      
      case 'terms-definitions':
        return await this.generateTermsDefinitions(document, analysis);
      
      default:
        throw new Error(`Visualization type ${type} not yet implemented`);
    }
  }

  private generateStructuredView(document: Document) {
    // Return the document structure with sections
    return {
      type: 'structured-view',
      sections: document.structure.sections,
      hierarchy: document.structure.hierarchy
    };
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
            text: '#1F2937'
          }
        };
      }
    } catch (error) {
      console.error('LLM mind map generation failed, falling back to structure-based:', error);
    }
    
    // Fallback to structure-based generation
    return this.generateMindMapFromStructure(document, analysis);
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
        this.convertLLMNodeToMindMapNode(child, level + 1)
      ),
      level: level,
      color: colors[colorIndex],
      sourceRef: { start: 0, end: 0, text: '' },
      metadata: {
        importance: node.importance || Math.max(0.3, 0.9 - (level * 0.15)),
        confidence: 0.85
      }
    };
  }

  private generateMindMapFromStructure(document: Document, analysis: DocumentAnalysis): MindMapData {
    // Fallback: Build mind map from document structure
    const tldrText = typeof analysis.tldr === 'string' ? analysis.tldr : analysis.tldr.text;
    const root = {
      id: 'root',
      label: document.title,
      subtitle: tldrText.substring(0, 40),
      icon: '📄',
      summary: tldrText,
      detailedExplanation: tldrText,
      sourceTextExcerpt: document.content.substring(0, 200),
      children: this.convertSectionsToMindMapNodes(document.structure.sections, 1),
      level: 0,
      color: '#4F46E5',
      sourceRef: { start: 0, end: 0, text: '' },
      metadata: {
        importance: 1.0,
        confidence: 1.0
      }
    };

    return {
      root,
      layout: 'radial',
      theme: {
        primary: '#4F46E5',
        secondary: '#7C3AED',
        accent: '#10B981',
        background: '#FFFFFF',
        text: '#1F2937'
      }
    };
  }

  private convertSectionsToMindMapNodes(sections: any[], level: number): any[] {
    const colors = ['#4F46E5', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];
    const fallbackEmojis = ['📊', '🔧', '💡', '🌐', '📈', '⚙️', '🏗️'];
    
    return sections.map((section, index) => {
      const colorIndex = level % colors.length;
      const summary = section.summary || section.content.substring(0, 100) + '...';
      
      return {
        id: section.id,
        label: section.title,
        subtitle: summary.substring(0, 40),
        icon: fallbackEmojis[index % fallbackEmojis.length],
        summary: summary,
        detailedExplanation: section.summary || section.content.substring(0, 300),
        sourceTextExcerpt: section.content.substring(0, 200),
        children: section.children ? this.convertSectionsToMindMapNodes(section.children, level + 1) : [],
        level: level,
        color: colors[colorIndex],
        sourceRef: {
          start: section.startIndex || 0,
          end: section.endIndex || 0,
          text: section.content.substring(0, 50)
        },
        metadata: {
          importance: Math.max(0.3, 0.9 - (level * 0.15)),
          confidence: 0.85
        }
      };
    });
  }

  private generateFlowchart(document: Document, analysis: DocumentAnalysis): FlowchartData {
    // Simple flowchart from sections
    const nodes = document.structure.sections.map((section, index) => ({
      id: section.id,
      type: index === 0 ? 'start' : 
            index === document.structure.sections.length - 1 ? 'end' : 
            'process' as any,
      label: section.title,
      description: section.summary || '',
      position: { x: 100, y: 100 + (index * 150) }
    }));

    const edges = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      edges.push({
        id: `edge-${i}`,
        source: nodes[i].id,
        target: nodes[i + 1].id,
        type: 'solid' as any
      });
    }

    return {
      nodes,
      edges,
      layout: 'topToBottom'
    };
  }

  private generateKnowledgeGraph(analysis: DocumentAnalysis, document?: Document): KnowledgeGraphData {
    const entitiesCount = analysis.entities?.length || 0;
    const relationshipsCount = analysis.relationships?.length || 0;
    console.log(`🔍 Generating knowledge graph from ${entitiesCount} entities and ${relationshipsCount} relationships`);
    
    // If no entities, return empty graph
    if (entitiesCount === 0) {
      console.warn('⚠️  No entities found in analysis - returning empty knowledge graph');
      return {
        nodes: [],
        edges: [],
        clusters: []
      };
    }
    
    // Log raw entities for debugging
    console.log('📊 Raw entities from LLM:', JSON.stringify(analysis.entities.slice(0, 5), null, 2));
    console.log('🔗 Raw relationships from LLM:', JSON.stringify(analysis.relationships.slice(0, 5), null, 2));
    
    // Enhanced entity processing with descriptions and source quotes
    const nodes = analysis.entities.map(entity => ({
      id: entity.id,
      label: entity.text,
      type: entity.type,
      size: entity.importance * 50 + 20,
      color: this.getEntityColor(entity.type),
      metadata: {
        centrality: entity.importance,
        connections: 0,
        description: entity.context || '',
        sourceQuote: this.extractSourceQuote(entity, document),
        sourceSpan: entity.mentions[0] || undefined
      }
    }));

    // Enhanced relationship processing with evidence
    const edges = analysis.relationships.map((rel, index) => ({
      id: `rel-${index}`,
      source: rel.source,
      target: rel.target,
      type: rel.type,
      strength: rel.strength,
      label: rel.type,
      evidence: rel.evidence
    }));
    
    // Validate edges and log issues
    const nodeIds = new Set(nodes.map(n => n.id));
    const invalidEdges = edges.filter(edge => !nodeIds.has(edge.source) || !nodeIds.has(edge.target));
    
    if (invalidEdges.length > 0) {
      console.error('❌ Found invalid edges in knowledge graph:');
      invalidEdges.forEach(edge => {
        const sourceExists = nodeIds.has(edge.source);
        const targetExists = nodeIds.has(edge.target);
        console.error(`  - Edge ${edge.id}: ${edge.source} -> ${edge.target}`);
        console.error(`    Source exists: ${sourceExists}, Target exists: ${targetExists}`);
      });
      console.error(`\n📋 Available node IDs (first 10):`, Array.from(nodeIds).slice(0, 10));
    }

    // Update connection counts
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      if (sourceNode) sourceNode.metadata.connections++;
      if (targetNode) targetNode.metadata.connections++;
    });

    // Detect hierarchical relationships for recursive exploration
    const hierarchicalEdges = edges.filter(e => 
      ['part-of', 'contains', 'implements'].includes(e.type)
    );

    // Build parent-child relationships
    const hierarchy = this.buildHierarchy(nodes, hierarchicalEdges);

    return {
      nodes,
      edges,
      clusters: [], // Computed on frontend
      hierarchy
    };
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
    hierarchicalEdges: any[]
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
      nodeDepths
    };
  }

  private generateDashboard(analysis: DocumentAnalysis): DashboardData {
    return {
      executiveCard: analysis.executiveSummary,
      kpiTiles: analysis.executiveSummary.kpis,
      charts: [
        {
          type: 'bar',
          title: 'Key Metrics',
          data: analysis.executiveSummary.kpis.map(kpi => ({
            name: kpi.label,
            value: kpi.value
          }))
        }
      ]
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
      color: '#4F46E5'
    }));

    return {
      events,
      scale: 'month'
    };
  }

  private async generateTermsDefinitions(
    document: Document,
    analysis: DocumentAnalysis
  ): Promise<TermsDefinitionsData> {
    const { getOpenRouterClient } = await import('../llm/openRouterClient.js');
    const llmClient = getOpenRouterClient();
    
    try {
      // Prepare document content (limit to 10000 chars for context)
      const contentSample = document.content.substring(0, 10000);
      const prompt = `Document Title: ${document.title}\n\nTLDR: ${analysis.tldr}\n\nContent:\n${contentSample}\n\nExtract 10-50 key terms, technical jargon, and acronyms. Provide context-aware definitions based on the document's domain. Return as JSON array with format: { "terms": [{ "term": "...", "definition": "...", "type": "acronym|technical|jargon|concept", "confidence": 0.0-1.0, "mentions": number, "context": "..." }], "domain": "..." }`;
      
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
            context: t.context
          }))
          .sort((a, b) => a.term.localeCompare(b.term));
        
        return {
          terms: sortedTerms,
          metadata: {
            totalTerms: sortedTerms.length,
            extractionConfidence: 0.85,
            documentDomain: parsed.domain || 'general'
          }
        };
      }
    } catch (error) {
      console.error('LLM glossary extraction failed, falling back to entity extraction:', error);
    }
    
    // Fallback: extract from existing entities
    return this.generateTermsFromEntities(analysis);
  }

  private generateTermsFromEntities(analysis: DocumentAnalysis): TermsDefinitionsData {
    // Fallback implementation using existing entity extraction
    const terms = analysis.entities
      .filter(e => e.type === 'technical' || e.type === 'concept')
      .slice(0, 30)
      .map((entity, index) => ({
        id: `term-${index}`,
        term: entity.text,
        definition: entity.context || 'Technical term from document',
        type: (entity.type === 'technical' ? 'technical' : 'concept') as 'technical' | 'concept',
        confidence: entity.importance,
        mentions: entity.mentions.length,
        context: entity.context
      }))
      .sort((a, b) => a.term.localeCompare(b.term));
    
    return {
      terms,
      metadata: {
        totalTerms: terms.length,
        extractionConfidence: 0.7,
        documentDomain: 'general'
      }
    };
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
      technical: '#6366F1'
    };
    return colors[type] || '#6B7280';
  }
}

export const visualizationGenerator = new VisualizationGenerator();
