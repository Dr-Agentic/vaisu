import { describe, it, expect, beforeEach, vi } from 'vitest';

import { visualizationService } from '../visualizationService.js';

import type { VisualizationRecord } from '../types.js';

// Mock all repository modules
vi.mock('../argumentMapRepository.js', () => ({
  create: vi.fn(),
  findByDocumentId: vi.fn(),
  update: vi.fn(),
  deleteArgumentMap: vi.fn(),
}));

vi.mock('../depthGraphRepository.js', () => ({
  create: vi.fn(),
  findByDocumentId: vi.fn(),
  update: vi.fn(),
  deleteDepthGraph: vi.fn(),
}));

vi.mock('../umlClassRepository.js', () => ({
  create: vi.fn(),
  findByDocumentId: vi.fn(),
  update: vi.fn(),
  deleteUmlClass: vi.fn(),
}));

vi.mock('../mindMapRepository.js', () => ({
  create: vi.fn(),
  findByDocumentId: vi.fn(),
  update: vi.fn(),
  deleteMindMap: vi.fn(),
}));

vi.mock('../flowchartRepository.js', () => ({
  create: vi.fn(),
  findByDocumentId: vi.fn(),
  update: vi.fn(),
  deleteFlowchart: vi.fn(),
}));

vi.mock('../executiveDashboardRepository.js', () => ({
  create: vi.fn(),
  findByDocumentId: vi.fn(),
  update: vi.fn(),
  deleteExecutiveDashboard: vi.fn(),
}));

vi.mock('../timelineRepository.js', () => ({
  create: vi.fn(),
  findByDocumentId: vi.fn(),
  update: vi.fn(),
  deleteTimeline: vi.fn(),
}));

describe('visualizationService', () => {
  beforeEach(() => {
    // Reset all mocked functions
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create argument map visualization', async () => {
      const mockCreate = vi.fn();
      const { create } = await import('../argumentMapRepository.js');
      vi.mocked(create).mockImplementation(mockCreate);

      const visualization: VisualizationRecord = {
        documentId: 'test-doc-id',
        visualizationType: 'argument-map',
        visualizationData: { nodes: [], edges: [] },
        llmMetadata: {
          model: 'gpt-4',
          tokensUsed: 1000,
          processingTime: 5000,
          timestamp: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await visualizationService.create(visualization);

      expect(mockCreate).toHaveBeenCalledWith(visualization);
    });

    it('should create mind map visualization', async () => {
      const mockCreate = vi.fn();
      const { create } = await import('../mindMapRepository.js');
      vi.mocked(create).mockImplementation(mockCreate);

      const visualization: VisualizationRecord = {
        documentId: 'test-doc-id',
        visualizationType: 'mind-map',
        visualizationData: { root: { id: 'root', label: 'Main Topic' } },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        llmMetadata: {
          model: 'gpt-4',
          tokensUsed: 800,
          processingTime: 4000,
          timestamp: new Date().toISOString(),
        },
      };

      await visualizationService.create(visualization);

      expect(mockCreate).toHaveBeenCalledWith(visualization);
    });

    it('should create UML class diagram visualization', async () => {
      const mockCreate = vi.fn();
      const { create } = await import('../umlClassRepository.js');
      vi.mocked(create).mockImplementation(mockCreate);

      const visualization: VisualizationRecord = {
        documentId: 'test-doc-id',
        visualizationType: 'uml-class',
        visualizationData: { classes: [], relationships: [] },
        llmMetadata: {
          model: 'gpt-4',
          tokensUsed: 1200,
          processingTime: 6000,
          timestamp: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await visualizationService.create(visualization);

      expect(mockCreate).toHaveBeenCalledWith(visualization);
    });
  });

  describe('findByDocumentIdAndType', () => {
    it('should find argument map visualization', async () => {
      const mockVisualization: VisualizationRecord = {
        documentId: 'test-doc-id',
        visualizationType: 'argument-map',
        visualizationData: { nodes: [], edges: [] },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        llmMetadata: {
          model: 'gpt-4',
          tokensUsed: 1000,
          processingTime: 5000,
          timestamp: new Date().toISOString(),
        },
      };

      const mockFindByDocumentId = vi.fn().mockResolvedValue(mockVisualization);
      const { findByDocumentId } = await import('../argumentMapRepository.js');
      vi.mocked(findByDocumentId).mockImplementation(mockFindByDocumentId);

      const result = await visualizationService.findByDocumentIdAndType(
        'test-doc-id',
        'argument-map',
      );

      expect(result).toEqual(mockVisualization);
      expect(mockFindByDocumentId).toHaveBeenCalledWith('test-doc-id');
    });

    it('should return null when visualization not found', async () => {
      const mockFindByDocumentId = vi.fn().mockResolvedValue(null);
      const { findByDocumentId } = await import('../argumentMapRepository.js');
      vi.mocked(findByDocumentId).mockImplementation(mockFindByDocumentId);

      const result = await visualizationService.findByDocumentIdAndType(
        'test-doc-id',
        'argument-map',
      );

      expect(result).toBeNull();
      expect(mockFindByDocumentId).toHaveBeenCalledWith('test-doc-id');
    });
  });

  describe('findByDocumentId', () => {
    it('should find all visualizations for a document', async () => {
      const mockArgumentMap: VisualizationRecord = {
        documentId: 'test-doc-id',
        visualizationType: 'argument-map',
        visualizationData: { nodes: [], edges: [] },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        llmMetadata: {
          model: 'gpt-4',
          tokensUsed: 1000,
          processingTime: 5000,
          timestamp: new Date().toISOString(),
        },
      };

      const mockMindMap: VisualizationRecord = {
        documentId: 'test-doc-id',
        visualizationType: 'mind-map',
        visualizationData: { root: { id: 'root', label: 'Main Topic' } },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        llmMetadata: {
          model: 'gpt-4',
          tokensUsed: 800,
          processingTime: 4000,
          timestamp: new Date().toISOString(),
        },
      };

      const { findByDocumentId: findByDocumentIdArgMap } = await import('../argumentMapRepository.js');
      const { findByDocumentId: findByDocumentIdMindMap } = await import('../mindMapRepository.js');
      const { findByDocumentId: findByDocumentIdDepthGraph } = await import('../depthGraphRepository.js');
      const { findByDocumentId: findByDocumentIdUmlClass } = await import('../umlClassRepository.js');
      const { findByDocumentId: findByDocumentIdFlowchart } = await import('../flowchartRepository.js');
      const { findByDocumentId: findByDocumentIdExecutiveDashboard } = await import('../executiveDashboardRepository.js');
      const { findByDocumentId: findByDocumentIdTimeline } = await import('../timelineRepository.js');

      vi.mocked(findByDocumentIdArgMap).mockResolvedValue(mockArgumentMap);
      vi.mocked(findByDocumentIdMindMap).mockResolvedValue(mockMindMap);
      vi.mocked(findByDocumentIdDepthGraph).mockResolvedValue(null);
      vi.mocked(findByDocumentIdUmlClass).mockResolvedValue(null);
      vi.mocked(findByDocumentIdFlowchart).mockResolvedValue(null);
      vi.mocked(findByDocumentIdExecutiveDashboard).mockResolvedValue(null);
      vi.mocked(findByDocumentIdTimeline).mockResolvedValue(null);

      const result = await visualizationService.findByDocumentId('test-doc-id');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockArgumentMap);
      expect(result[1]).toEqual(mockMindMap);
    });

    it('should handle errors for individual tables gracefully', async () => {
      const mockArgumentMap: VisualizationRecord = {
        documentId: 'test-doc-id',
        visualizationType: 'argument-map',
        visualizationData: { nodes: [], edges: [] },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        llmMetadata: {
          model: 'gpt-4',
          tokensUsed: 1000,
          processingTime: 5000,
          timestamp: new Date().toISOString(),
        },
      };

      const { findByDocumentId: findByDocumentIdArgMap } = await import('../argumentMapRepository.js');
      const { findByDocumentId: findByDocumentIdDepthGraph } = await import('../depthGraphRepository.js');
      const { findByDocumentId: findByDocumentIdUmlClass } = await import('../umlClassRepository.js');
      const { findByDocumentId: findByDocumentIdMindMap } = await import('../mindMapRepository.js');
      const { findByDocumentId: findByDocumentIdFlowchart } = await import('../flowchartRepository.js');
      const { findByDocumentId: findByDocumentIdExecutiveDashboard } = await import('../executiveDashboardRepository.js');
      const { findByDocumentId: findByDocumentIdTimeline } = await import('../timelineRepository.js');

      vi.mocked(findByDocumentIdArgMap).mockResolvedValue(mockArgumentMap);
      vi.mocked(findByDocumentIdDepthGraph).mockRejectedValue(new Error('Table not found'));
      vi.mocked(findByDocumentIdUmlClass).mockResolvedValue(null);
      vi.mocked(findByDocumentIdMindMap).mockResolvedValue(null);
      vi.mocked(findByDocumentIdFlowchart).mockResolvedValue(null);
      vi.mocked(findByDocumentIdExecutiveDashboard).mockResolvedValue(null);
      vi.mocked(findByDocumentIdTimeline).mockResolvedValue(null);

      const result = await visualizationService.findByDocumentId('test-doc-id');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockArgumentMap);
    });
  });

  describe('update', () => {
    it('should update argument map visualization', async () => {
      const mockUpdate = vi.fn();
      const { update } = await import('../argumentMapRepository.js');
      vi.mocked(update).mockImplementation(mockUpdate);

      const updates = {
        visualizationData: { nodes: [{ id: '1', label: 'Updated' }] },
      };

      await visualizationService.update('test-doc-id', 'argument-map', updates);

      expect(mockUpdate).toHaveBeenCalledWith('test-doc-id', updates);
    });
  });

  describe('deleteVisualization', () => {
    it('should delete argument map visualization', async () => {
      const mockDelete = vi.fn();
      const { deleteArgumentMap } = await import('../argumentMapRepository.js');
      vi.mocked(deleteArgumentMap).mockImplementation(mockDelete);

      await visualizationService.deleteVisualization('test-doc-id', 'argument-map');

      expect(mockDelete).toHaveBeenCalledWith('test-doc-id');
    });
  });
});
