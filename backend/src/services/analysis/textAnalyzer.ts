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
import { getOpenRouterClient, OpenRouterClient } from '../llm/openRouterClient.js';

export type ProgressCallback = (
  step: string,
  progress: number,
  message: string,
  partialAnalysis?: Partial<DocumentAnalysis>
) => void;

export class TextAnalyzer {
  private _llmClient: OpenRouterClient | null;

  constructor(llmClient?: OpenRouterClient) {
    this._llmClient = llmClient || null;
  }

  private get llmClient(): OpenRouterClient {
    return this._llmClient || getOpenRouterClient();
  }

  async analyzeDocument(
    document: Document,
    onProgress?: ProgressCallback
  ): Promise<DocumentAnalysis> {
    console.log(`Analyzing document: ${document.id}`);

    onProgress?.('initialization', 5, 'Starting analysis...');

    // Priority 1: Get TLDR and Executive Summary first (most important for user)
    onProgress?.('priority-analysis', 10, 'Generating TLDR and executive summary...');

    const [tldr, executiveSummary] = await Promise.all([
      this.generateTLDR(document.content),
      this.generateExecutiveSummary(document.content)
    ]);

    // Provide early results to user immediately
    onProgress?.('early-results', 30, 'TLDR and summary ready! Continuing analysis...', {
      tldr,
      executiveSummary
    });

    // Priority 2: Run remaining analyses in parallel
    onProgress?.('detailed-analysis', 35, 'Extracting entities and analyzing signals...');

    const [entities, signals] = await Promise.all([
      this.extractEntities(document.content),
      this.analyzeSignals(document.content)
    ]);

    onProgress?.('relationships', 50, 'Detecting relationships between entities...');

    // Relationships depend on entities
    const relationships = await this.detectRelationships(document.content, entities);

    onProgress?.('sections', 65, 'Generating section summaries...');

    // Generate section summaries
    await this.generateSectionSummaries(document);

    onProgress?.('recommendations', 85, 'Generating visualization recommendations...');

    // Recommendations based on all analysis
    const recommendations = await this.recommendVisualizations(
      document,
      signals,
      entities.length,
      relationships.length
    );

    onProgress?.('complete', 100, 'Analysis complete!');

    return {
      tldr,
      executiveSummary,
      entities,
      relationships,
      metrics: [], // KPIs are in executiveSummary, metrics would need separate extraction
      signals,
      recommendations
    };
  }

  async generateTLDR(text: string, retries = 2): Promise<{ text: string; confidence?: number; generatedAt?: string; model?: string }> {
    const sample = text.substring(0, 4000); // Limit for speed

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.llmClient.callWithFallback('tldr', sample);
        return {
          text: response.content.trim(),
          confidence: 0.85,
          generatedAt: new Date().toISOString(),
          model: response.model
        };
      } catch (error: any) {
        if (attempt === retries) {
          throw error;
        }
        console.warn(`TLDR generation failed (attempt ${attempt + 1}/${retries + 1}), retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }

    throw new Error('Failed to generate TLDR after retries');
  }

  async generateExecutiveSummary(text: string): Promise<ExecutiveSummary> {
    const sample = text.substring(0, 6000);
    const response = await this.llmClient.callWithFallback('executiveSummary', sample);

    try {
      const parsed = JSON.parse(response.content) as ExecutiveSummary;

      // Validate and filter KPIs to ensure they have valid numeric values
      const validKpis = (parsed.kpis || []).filter(kpi =>
        kpi &&
        typeof kpi.value === 'number' &&
        !isNaN(kpi.value) &&
        kpi.label &&
        kpi.unit
      );

      // Ensure all required fields exist
      return {
        headline: parsed.headline || 'Document Summary',
        keyIdeas: parsed.keyIdeas || [],
        kpis: validKpis,
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
      const parsed = this.llmClient.parseJSONResponse<{ entities: Entity[] }>(response);
      const entities = parsed.entities || [];
      console.log(`✅ Extracted ${entities.length} entities`);

      // Log first 5 entities for debugging
      console.log('📊 Sample entities:', JSON.stringify(entities.slice(0, 5).map((e: Entity) => ({
        id: e.id,
        text: e.text,
        type: e.type
      })), null, 2));

      return entities;
    } catch (error) {
      console.error('Failed to parse entities:', error);
      return [];
    }
  }

  async detectRelationships(text: string, entities: Entity[]): Promise<Relationship[]> {
    if (entities.length === 0) {
      console.log('⚠️  No entities found, skipping relationship detection');
      return [];
    }

    // Create entity list with IDs and text for the LLM
    const entityList = entities.map(e => `${e.id}: "${e.text}" (${e.type})`).join('\n');
    const prompt = `Text: ${text.substring(0, 4000)}\n\nEntities (use the ID in source/target fields):\n${entityList}\n\nAnalyze the text and find relationships between these entities. Use the entity IDs (e.g., "entity-1") in your response, not the entity names.`;

    const response = await this.llmClient.callWithFallback('relationshipDetection', prompt);

    try {
      const parsed = this.llmClient.parseJSONResponse<{ relationships: Relationship[] }>(response);
      const relationships = parsed.relationships || [];
      console.log(`✅ Detected ${relationships.length} relationships`);


      // Check for mismatches between relationship IDs and entity IDs
      const entityIds = new Set(entities.map((e: Entity) => e.id));
      const entityTexts = new Set(entities.map((e: Entity) => e.text));
      const mismatches = relationships.filter((r: Relationship) =>
        !entityIds.has(r.source) || !entityIds.has(r.target)
      );

      if (mismatches.length > 0) {
        console.warn(`⚠️  Found ${mismatches.length} relationships with non-matching IDs`);
        console.warn('Sample mismatch:', JSON.stringify(mismatches.slice(0, 2), null, 2));
        console.warn('Checking if using text instead of ID...');

        const usingText = mismatches.filter((r: Relationship) =>
          entityTexts.has(r.source) || entityTexts.has(r.target)
        );

        if (usingText.length > 0) {
          console.error('❌ LLM is using entity TEXT instead of entity ID in relationships!');
          console.error('Example:', JSON.stringify(usingText[0], null, 2));
          console.error('This will be auto-fixed in the visualization generator.');
        }
      }

      return relationships;
    } catch (error) {
      console.error('Failed to parse relationships:', error);
      return [];
    }
  }

  async analyzeSignals(text: string): Promise<SignalAnalysis> {
    const sample = text.substring(0, 3000);
    const response = await this.llmClient.callWithFallback('signalAnalysis', sample);

    try {
      const parsed = JSON.parse(response.content) as SignalAnalysis;
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
      const parsed = JSON.parse(response.content) as { recommendations: VisualizationRecommendation[] };

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
