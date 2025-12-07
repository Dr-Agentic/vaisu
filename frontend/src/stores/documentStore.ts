import { create } from 'zustand';
import type { Document, DocumentAnalysis, VisualizationType } from '../../../shared/src/types';
import { apiClient } from '../services/apiClient';
import type { ToastType } from '../components/feedback/Toast';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface DocumentStore {
  document: Document | null;
  analysis: DocumentAnalysis | null;
  isLoading: boolean;
  isAnalyzing: boolean;
  error: string | null;
  currentVisualization: VisualizationType;
  visualizationData: Map<VisualizationType, any>;
  progressStep: string;
  progressPercent: number;
  progressMessage: string;
  toasts: ToastMessage[];
  
  uploadDocument: (file: File) => Promise<void>;
  uploadText: (text: string) => Promise<void>;
  analyzeDocument: () => Promise<void>;
  loadVisualization: (type: VisualizationType) => Promise<void>;
  setCurrentVisualization: (type: VisualizationType) => void;
  clearDocument: () => void;
  clearError: () => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  document: null,
  analysis: null,
  isLoading: false,
  isAnalyzing: false,
  error: null,
  currentVisualization: 'structured-view',
  visualizationData: new Map(),
  progressStep: '',
  progressPercent: 0,
  progressMessage: '',
  toasts: [],

  uploadDocument: async (file: File) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.uploadDocument(file);
      set({ document: response.document });
      
      get().addToast({
        type: 'success',
        title: 'Document uploaded successfully',
        message: 'Starting analysis...',
        duration: 3000
      });
      
      // Load structured view immediately (doesn't need analysis)
      get().loadVisualization('structured-view');
      
      // Then analyze in background
      await get().analyzeDocument();
    } catch (error: any) {
      set({ error: error.message || 'Failed to upload document', isLoading: false });
      get().addToast({
        type: 'error',
        title: 'Upload failed',
        message: error.message || 'Failed to upload document',
        duration: 0
      });
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
      
      get().addToast({
        type: 'success',
        title: 'Text analyzed successfully',
        message: 'Visualizations are ready',
        duration: 3000
      });
      
      // Load default visualization
      await get().loadVisualization('structured-view');
    } catch (error: any) {
      set({ error: error.message || 'Failed to analyze text', isLoading: false });
      get().addToast({
        type: 'error',
        title: 'Analysis failed',
        message: error.message || 'Failed to analyze text',
        duration: 0
      });
    }
  },

  analyzeDocument: async () => {
    const { document } = get();
    if (!document) return;

    set({ isAnalyzing: true, error: null, progressStep: 'starting', progressPercent: 0, progressMessage: 'Starting analysis...' });
    
    // Start polling for progress and partial results
    const pollInterval = setInterval(async () => {
      try {
        const progress = await apiClient.getProgress(document.id);
        const updates: any = {
          progressStep: progress.step,
          progressPercent: progress.progress,
          progressMessage: progress.message
        };
        
        // If we have partial analysis results, update them immediately
        if ('partialAnalysis' in progress && progress.partialAnalysis) {
          updates.analysis = {
            ...get().analysis,
            ...(progress as any).partialAnalysis
          };
        }
        
        set(updates);
      } catch (err) {
        // Ignore polling errors
      }
    }, 500); // Poll every 500ms
    
    try {
      const response = await apiClient.analyzeDocument(document.id);
      clearInterval(pollInterval);
      set({
        document: response.document,
        analysis: response.analysis,
        isAnalyzing: false,
        isLoading: false,
        progressStep: 'complete',
        progressPercent: 100,
        progressMessage: 'Analysis complete!'
      });
      
      get().addToast({
        type: 'success',
        title: 'Analysis complete',
        message: 'All visualizations are ready to explore',
        duration: 5000
      });
      
      // Load structured-view visualization immediately (priority visualization)
      // This shows the document structure which is always available
      get().loadVisualization('structured-view');
    } catch (error: any) {
      clearInterval(pollInterval);
      set({ 
        error: error.message || 'Failed to analyze document', 
        isAnalyzing: false, 
        isLoading: false,
        progressStep: 'error',
        progressPercent: 0,
        progressMessage: 'Analysis failed'
      });
      get().addToast({
        type: 'error',
        title: 'Analysis failed',
        message: error.message || 'Failed to analyze document',
        duration: 0
      });
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
      visualizationData: new Map(),
      progressStep: '',
      progressPercent: 0,
      progressMessage: ''
    });
  },

  clearError: () => {
    set({ error: null });
  },

  addToast: (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }]
    }));
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  }
}));
