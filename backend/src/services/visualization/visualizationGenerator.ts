import type {
  Document,
  DocumentAnalysis,
  VisualizationType,
  MindMapData,
  FlowchartData,
  KnowledgeGraphData,
  DashboardData,
  TimelineData,
  TermsDefinitionsData
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
        return this.generateKnowledgeGraph(analysis);
      
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
    
    return {
      id: node.id || `node-${Math.random().toString(36).substr(2, 9)}`,
      label: node.label || 'Untitled',
      summary: node.summary || '',
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
    const root = {
      id: 'root',
      label: document.title,
      summary: analysis.tldr,
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
    
    return sections.map((section) => {
      const colorIndex = level % colors.length;
      
      return {
        id: section.id,
        label: section.title,
        summary: section.summary || section.content.substring(0, 100) + '...',
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

  private generateKnowledgeGraph(analysis: DocumentAnalysis): KnowledgeGraphData {
    const nodes = analysis.entities.map(entity => ({
      id: entity.id,
      label: entity.text,
      type: entity.type,
      size: entity.importance * 50 + 20,
      color: this.getEntityColor(entity.type),
      metadata: {
        centrality: entity.importance,
        connections: 0
      }
    }));

    const edges = analysis.relationships.map((rel, index) => ({
      id: `rel-${index}`,
      source: rel.source,
      target: rel.target,
      type: rel.type,
      strength: rel.strength,
      label: rel.type
    }));

    // Update connection counts
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      if (sourceNode) sourceNode.metadata.connections++;
      if (targetNode) targetNode.metadata.connections++;
    });

    return {
      nodes,
      edges,
      clusters: []
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
