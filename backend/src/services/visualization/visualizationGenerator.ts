import type {
  Document,
  DocumentAnalysis,
  VisualizationType,
  MindMapData,
  FlowchartData,
  KnowledgeGraphData,
  DashboardData,
  TimelineData
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
        return this.generateMindMap(document, analysis);
      
      case 'flowchart':
        return this.generateFlowchart(document, analysis);
      
      case 'knowledge-graph':
        return this.generateKnowledgeGraph(analysis);
      
      case 'executive-dashboard':
        return this.generateDashboard(analysis);
      
      case 'timeline':
        return this.generateTimeline(document, analysis);
      
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

  private generateMindMap(document: Document, analysis: DocumentAnalysis): MindMapData {
    // Build mind map from document structure using the hierarchical sections
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
