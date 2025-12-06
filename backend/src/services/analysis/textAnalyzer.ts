import type {
  Document,
  DocumentAnalysis,
  ExecutiveSummary,
  Entity,
  Relationship,
  SignalAnalysis,
  VisualizationRecommendation,
  KPI,
  Metric
} from '../../../../shared/src/types.js';
import { getOpenRouterClient } from '../llm/openRouterClient.js';

export class TextAnalyzer {
  private get llmClient() {
    return getOpenRouterClient();
  }
  async analyzeDocument(document: Document): Promise<DocumentAnalysis> {
    console.log(`Analyzing document: ${document.id}`);

    // Run analyses in parallel where possible
    const [
      tldr,
      executiveSummary,
      entities,
      signals
    ] = await Promise.all([
      this.generateTLDR(document.content),
      this.generateExecutiveSummary(document.content),
      this.extractEntities(document.content),
      this.analyzeSignals(document.content)
    ]);

    // Relationships depend on entities
    const relationships = await this.detectRelationships(document.content, entities);

    // Generate section summaries
    await this.generateSectionSummaries(document);

    // Recommendations based on all analysis
    const recommendations = await this.recommendVisualizations(
      document,
      signals,
      entities.length,
      relationships.length
    );

    return {
      tldr,
      executiveSummary,
      entities,
      relationships,
      metrics: executiveSummary.kpis,
      signals,
      recommendations
    };
  }

  async generateTLDR(text: string): Promise<string> {
    const sample = text.substring(0, 4000); // Limit for speed
    const response = await this.llmClient.callWithFallback('tldr', sample);
    return response.content.trim();
  }

  async generateExecutiveSummary(text: string): Promise<ExecutiveSummary> {
    const sample = text.substring(0, 6000);
    const response = await this.llmClient.callWithFallback('executiveSummary', sample);
    
    try {
      const parsed = await this.llmClient.parseJSONResponse<ExecutiveSummary>(response);
      
      // Ensure all required fields exist
      return {
        headline: parsed.headline || 'Document Summary',
        keyIdeas: parsed.keyIdeas || [],
        kpis: parsed.kpis || [],
        risks: parsed.risks || [],
        opportunities: parsed.opportunities || [],
        callToAction: parsed.callToAction || 'Review the document for details'
      };
    } catch (error) {
      console.error('Failed to parse executive summary, using fallback');
      return {
        headline: 'Document Summary',
        keyIdeas: [response.content.substring(0, 200)],
        kpis: [],
        risks: [],
        opportunities: [],
        callToAction: 'Review the document for details'
      };
    }
  }

  async extractEntities(text: string): Promise<Entity[]> {
    const sample = text.substring(0, 5000);
    const response = await this.llmClient.callWithFallback('entityExtraction', sample);
    
    try {
      const parsed = await this.llmClient.parseJSONResponse<{ entities: Entity[] }>(response);
      return parsed.entities || [];
    } catch (error) {
      console.error('Failed to parse entities');
      return [];
    }
  }

  async detectRelationships(text: string, entities: Entity[]): Promise<Relationship[]> {
    if (entities.length === 0) {
      return [];
    }

    const entityList = entities.map(e => e.text).join(', ');
    const prompt = `Text: ${text.substring(0, 4000)}\n\nEntities: ${entityList}`;
    
    const response = await this.llmClient.callWithFallback('relationshipDetection', prompt);
    
    try {
      const parsed = await this.llmClient.parseJSONResponse<{ relationships: Relationship[] }>(response);
      return parsed.relationships || [];
    } catch (error) {
      console.error('Failed to parse relationships');
      return [];
    }
  }

  async analyzeSignals(text: string): Promise<SignalAnalysis> {
    const sample = text.substring(0, 3000);
    const response = await this.llmClient.callWithFallback('signalAnalysis', sample);
    
    try {
      const parsed = await this.llmClient.parseJSONResponse<SignalAnalysis>(response);
      return parsed;
    } catch (error) {
      console.error('Failed to parse signals, using defaults');
      return {
        structural: 0.5,
        process: 0.3,
        quantitative: 0.3,
        technical: 0.2,
        argumentative: 0.3,
        temporal: 0.2
      };
    }
  }

  async generateSectionSummaries(document: Document): Promise<void> {
    // Generate summaries for each section
    const summaryPromises = document.structure.sections.map(async (section) => {
      if (section.content.length > 100) {
        try {
          const response = await this.llmClient.callWithFallback(
            'sectionSummary',
            section.content.substring(0, 2000)
          );
          section.summary = response.content.trim();
        } catch (error) {
          console.error(`Failed to summarize section ${section.id}`);
          section.summary = section.content.substring(0, 200) + '...';
        }
      } else {
        section.summary = section.content;
      }
    });

    await Promise.all(summaryPromises);
  }

  async recommendVisualizations(
    document: Document,
    signals: SignalAnalysis,
    entityCount: number,
    relationshipCount: number
  ): Promise<VisualizationRecommendation[]> {
    const context = {
      wordCount: document.metadata.wordCount,
      sectionCount: document.structure.sections.length,
      entityCount,
      relationshipCount,
      signals
    };

    const prompt = `Document analysis:
- Word count: ${context.wordCount}
- Sections: ${context.sectionCount}
- Entities: ${context.entityCount}
- Relationships: ${context.relationshipCount}
- Signals: ${JSON.stringify(signals)}

Sample text:
${document.content.substring(0, 1000)}`;

    const response = await this.llmClient.callWithFallback('vizRecommendation', prompt);
    
    try {
      const parsed = await this.llmClient.parseJSONResponse<{ recommendations: VisualizationRecommendation[] }>(response);
      
      // Always include structured-view as default
      const recommendations = parsed.recommendations || [];
      if (!recommendations.find(r => r.type === 'structured-view')) {
        recommendations.unshift({
          type: 'structured-view',
          score: 1.0,
          rationale: 'Default view showing document structure with summaries'
        });
      }

      return recommendations.slice(0, 5);
    } catch (error) {
      console.error('Failed to parse recommendations, using defaults');
      return [
        {
          type: 'structured-view',
          score: 1.0,
          rationale: 'Default view showing document structure'
        },
        {
          type: 'mind-map',
          score: 0.8,
          rationale: 'Good for hierarchical content'
        }
      ];
    }
  }
}

export const textAnalyzer = new TextAnalyzer();
