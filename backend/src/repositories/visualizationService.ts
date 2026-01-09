import * as analysisRepository from './analysisRepository.js';
import * as argumentMapRepository from './argumentMapRepository.js';
import * as depthGraphRepository from './depthGraphRepository.js';
import * as executiveDashboardRepository from './executiveDashboardRepository.js';
import * as flowchartRepository from './flowchartRepository.js';
import * as knowledgeGraphRepository from './knowledgeGraphRepository.js';
import * as mindMapRepository from './mindMapRepository.js';
import * as termsDefinitionsRepository from './termsDefinitionsRepository.js';
import * as timelineRepository from './timelineRepository.js';
import * as umlClassRepository from './umlClassRepository.js';

import type { VisualizationRecord } from './types.js';

/**
 * Visualization service that coordinates between individual repository types
 */
export class VisualizationService {
  /**
   * Create visualization based on type
   */
  async create(visualization: VisualizationRecord): Promise<void> {
    const repository = this.getRepositoryForType(visualization.visualizationType);
    await repository.create(visualization);
  }

  /**
   * Find visualization by document ID and type
   */
  async findByDocumentIdAndType(
    documentId: string,
    visualizationType: string,
  ): Promise<VisualizationRecord | null> {
    const repository = this.getRepositoryForType(visualizationType);
    return await repository.findByDocumentId(documentId);
  }

  /**
   * Find all visualizations for a document (aggregates from all tables)
   */
  async findByDocumentId(documentId: string): Promise<VisualizationRecord[]> {
    const types = [
      'structured-view',
      'argument-map',
      'depth-graph',
      'uml-class',
      'uml-class-diagram',
      'uml-sequence',
      'uml-activity',
      'mind-map',
      'flowchart',
      'knowledge-graph',
      'executive-dashboard',
      'timeline',
      'terms-definitions',
      'gantt',
      'comparison-matrix',
      'priority-matrix',
      'raci-matrix',
    ];

    const results: VisualizationRecord[] = [];

    for (const type of types) {
      try {
        const repository = this.getRepositoryForType(type);
        const visualization = await repository.findByDocumentId(documentId);
        if (visualization) {
          results.push(visualization);
        }
      } catch (error) {
        // Continue with other types if one fails
        console.warn(`Failed to fetch ${type} visualization:`, error);
      }
    }

    return results;
  }

  /**
   * Update visualization by type
   */
  async update(
    documentId: string,
    visualizationType: string,
    updates: Partial<VisualizationRecord>,
  ): Promise<void> {
    const repository = this.getRepositoryForType(visualizationType);
    await repository.update(documentId, updates);
  }

  /**
   * Delete visualization by type
   */
  async deleteVisualization(documentId: string, visualizationType: string): Promise<void> {
    const repository = this.getRepositoryForType(visualizationType);
    switch (visualizationType) {
      case 'structured-view':
        await repository.deleteStructuredView(documentId);
        break;
      case 'argument-map':
        await repository.deleteArgumentMap(documentId);
        break;
      case 'depth-graph':
        await repository.deleteDepthGraph(documentId);
        break;
      case 'uml-class':
        await repository.deleteUmlClass(documentId);
        break;
      case 'uml-class-diagram':
        await repository.deleteUmlClass(documentId);
        break;
      case 'uml-sequence':
        await repository.deleteUmlClass(documentId);
        break;
      case 'uml-activity':
        await repository.deleteUmlClass(documentId);
        break;
      case 'mind-map':
        await repository.deleteMindMap(documentId);
        break;
      case 'flowchart':
        await repository.deleteFlowchart(documentId);
        break;
      case 'executive-dashboard':
        await repository.deleteExecutiveDashboard(documentId);
        break;
      case 'timeline':
        await repository.deleteTimeline(documentId);
        break;
      case 'knowledge-graph':
        await repository.deleteKnowledgeGraph(documentId);
        break;
      case 'terms-definitions':
        await repository.deleteTermsDefinitions(documentId);
        break;
      case 'gantt':
        await repository.deleteGantt(documentId);
        break;
      case 'comparison-matrix':
        await repository.deleteComparisonMatrix(documentId);
        break;
      case 'priority-matrix':
        await repository.deletePriorityMatrix(documentId);
        break;
      case 'raci-matrix':
        await repository.deleteRaciMatrix(documentId);
        break;
      default:
        throw new Error(`Unknown visualization type: ${visualizationType}`);
    }
  }

  /**
   * Get the appropriate repository for a visualization type
   */
  private getRepositoryForType(type: string): any {
    switch (type) {
      case 'structured-view':
        return analysisRepository; // Use analysis repository for structured-view
      case 'argument-map':
        return argumentMapRepository;
      case 'depth-graph':
        return depthGraphRepository;
      case 'uml-class':
        return umlClassRepository;
      case 'uml-class-diagram':
        return umlClassRepository; // Maps to same repository as uml-class
      case 'uml-sequence':
        return umlClassRepository; // Maps to same repository as uml-class
      case 'uml-activity':
        return umlClassRepository; // Maps to same repository as uml-class
      case 'mind-map':
        return mindMapRepository;
      case 'flowchart':
        return flowchartRepository;
      case 'knowledge-graph':
        return knowledgeGraphRepository; // Use knowledge graph repository for knowledge-graph
      case 'executive-dashboard':
        return executiveDashboardRepository;
      case 'timeline':
        return timelineRepository;
      case 'terms-definitions':
        return termsDefinitionsRepository;
      case 'gantt':
        return analysisRepository; // Use analysis repository for gantt
      case 'comparison-matrix':
        return analysisRepository; // Use analysis repository for comparison-matrix
      case 'priority-matrix':
        return analysisRepository; // Use analysis repository for priority-matrix
      case 'raci-matrix':
        return analysisRepository; // Use analysis repository for raci-matrix
      default:
        throw new Error(`Unknown visualization type: ${type}`);
    }
  }
}

// Export singleton instance
export const visualizationService = new VisualizationService();
