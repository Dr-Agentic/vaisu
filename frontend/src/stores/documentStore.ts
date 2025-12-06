import { create } from 'zustand';
import type { Document, DocumentAnalysis, VisualizationType } from '../../../shared/src/types';
import { apiClient } from '../services/apiClient';

interface DocumentStore {
  document: Document | null;
  analysis: DocumentAnalysis | null;
  isLoading: boolean;
  isAnalyzing: boolean;
  error: string | null;
  currentVisualization: VisualizationType;
  visualizationData: Map<VisualizationType, any>;
  
  uploadDocument: (file: File) => Promise<void>;
  uploadText: (text: string) => Promise<void>;
  analyzeDocument: () => Promise<void>;
  loadVisualization: (type: VisualizationType) => Promise<void>;
  setCurrentVisualization: (type: VisualizationType) => void;
  clearDocument: () => void;
  clearError: () => void;
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  document: null,
  analysis: null,
  isLoading: false,
  isAnalyzing: false,
  error: null,
  currentVisualization: 'structured-view',
  visualizationData: new Map(),

  uploadDocument: async (file: File) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.uploadDocument(file);
      
      // Automatically analyze after upload
      await get().analyzeDocument();
    } catch (error: any) {
      set({ error: error.message || 'Failed to upload document', isLoading: false });
    }
  },

  uploadText: async (text: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.analyzeText(text);
      set({
        document: response.document,
        analysis: response.analysis,
        isLoading: false,
        isAnalyzing: false
      });
      
      // Load default visualization
      await get().loadVisualization('structured-view');
    } catch (error: any) {
      set({ error: error.message || 'Failed to analyze text', isLoading: false });
    }
  },

  analyzeDocument: async () => {
    const { document } = get();
    if (!document) return;

    set({ isAnalyzing: true, error: null });
    try {
      const response = await apiClient.analyzeDocument(document.id);
      set({
        document: response.document,
        analysis: response.analysis,
        isAnalyzing: false,
        isLoading: false
      });
      
      // Load default visualization
      await get().loadVisualization('structured-view');
    } catch (error: any) {
      set({ error: error.message || 'Failed to analyze document', isAnalyzing: false, isLoading: false });
    }
  },

  loadVisualization: async (type: VisualizationType) => {
    const { document, visualizationData } = get();
    if (!document) return;

    // Check cache
    if (visualizationData.has(type)) {
      set({ currentVisualization: type });
      return;
    }

    try {
      const data = await apiClient.generateVisualization(document.id, type);
      const newMap = new Map(visualizationData);
      newMap.set(type, data);
      set({ visualizationData: newMap, currentVisualization: type });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load visualization' });
    }
  },

  setCurrentVisualization: (type: VisualizationType) => {
    set({ currentVisualization: type });
    get().loadVisualization(type);
  },

  clearDocument: () => {
    set({
      document: null,
      analysis: null,
      isLoading: false,
      isAnalyzing: false,
      error: null,
      currentVisualization: 'structured-view',
      visualizationData: new Map()
    });
  },

  clearError: () => {
    set({ error: null });
  }
}));
