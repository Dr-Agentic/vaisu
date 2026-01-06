import { create } from 'zustand';

import { apiClient } from '../services/apiClient';

import type { Document, DocumentAnalysis, VisualizationType } from '../../../shared/src/types';
import type { ToastType } from '../electron/components/feedback/Toast';

export type AppStage = 'welcome' | 'input' | 'analysis' | 'visualization';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export interface DocumentListItem {
  id: string;
  title: string;
  fileType: string;
  uploadDate: Date;
  tldr?: { text: string; confidence?: number; generatedAt?: string; model?: string } | string; // Support both old and new format
  summaryHeadline?: string;
  wordCount: number;
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

  // Stage state (Electron UI)
  currentStage: AppStage;
  setStage: (stage: AppStage) => void;

  // Document history
  documentList: DocumentListItem[];
  isLoadingList: boolean;
  searchQuery: string;

  uploadDocument: (file: File) => Promise<void>;
  uploadText: (text: string) => Promise<void>;
  analyzeDocument: () => Promise<void>;
  loadVisualization: (type: VisualizationType) => Promise<void>;
  setCurrentVisualization: (type: VisualizationType) => void;
  clearDocument: () => void;
  clearError: () => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Document history methods
  fetchDocumentList: () => Promise<void>;
  loadDocumentById: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  searchDocuments: (query: string) => Promise<void>;
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

  // Stage state (Electron UI)
  currentStage: 'welcome',
  setStage: (stage: AppStage) => set({ currentStage: stage }),

  // Document history
  documentList: [],
  isLoadingList: false,
  searchQuery: '',

  uploadDocument: async (file: File) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.uploadDocument(file);
      set({ document: response.document });

      get().addToast({
        type: 'success',
        title: 'Document uploaded successfully',
        message: 'Starting analysis...',
        duration: 3000,
      });

      // Refresh document list
      get().fetchDocumentList();

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
        duration: 0,
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
        isAnalyzing: false,
      });

      get().addToast({
        type: 'success',
        title: 'Text analyzed successfully',
        message: 'Visualizations are ready',
        duration: 3000,
      });

      // Refresh document list
      get().fetchDocumentList();

      // Load default visualization
      await get().loadVisualization('structured-view');
    } catch (error: any) {
      set({ error: error.message || 'Failed to analyze text', isLoading: false });
      get().addToast({
        type: 'error',
        title: 'Analysis failed',
        message: error.message || 'Failed to analyze text',
        duration: 0,
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
          progressMessage: progress.message,
        };

        // If we have partial analysis results, update them immediately
        if ('partialAnalysis' in progress && progress.partialAnalysis) {
          updates.analysis = {
            ...get().analysis,
            ...(progress as any).partialAnalysis,
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
        progressMessage: 'Analysis complete!',
      });

      get().addToast({
        type: 'success',
        title: 'Analysis complete',
        message: 'All visualizations are ready to explore',
        duration: 5000,
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
        progressMessage: 'Analysis failed',
      });
      get().addToast({
        type: 'error',
        title: 'Analysis failed',
        message: error.message || 'Failed to analyze document',
        duration: 0,
      });
    }
  },

  loadVisualization: async (type: VisualizationType) => {
    const { document, visualizationData, isLoading } = get();
    if (!document) return;

    // Check cache - including error markers
    if (visualizationData.has(type)) {
      set({ currentVisualization: type });
      return;
    }

    // Prevent concurrent requests for the same visualization
    if (isLoading) return;

    // Show progress for visualization generation
    set({
      isLoading: true,
      progressStep: 'generating',
      progressPercent: 0,
      progressMessage: `Generating ${type.replace('-', ' ')} visualization...`,
    });

    try {
      // Simulate progress updates for better UX
      const progressInterval = setInterval(() => {
        const current = get().progressPercent;
        if (current < 90) {
          set({ progressPercent: current + 10 });
        }
      }, 300);

      const data = await apiClient.generateVisualization(document.id, type);

      clearInterval(progressInterval);

      console.log(`🎯 loadVisualization received data for ${type}:`, {
        type: typeof data,
        hasType: data?.type,
        hasSections: Array.isArray(data?.sections),
        sectionsCount: data?.sections?.length,
        hasHierarchy: data?.hierarchy,
        hierarchyType: typeof data?.hierarchy,
      });

      // Validate data structure for terms-definitions
      if (type === 'terms-definitions') {
        if (!data || !data.terms || !Array.isArray(data.terms)) {
          throw new Error('Invalid data structure received for terms-definitions');
        }
      }

      const newMap = new Map(visualizationData);
      newMap.set(type, data);
      set({
        visualizationData: newMap,
        currentVisualization: type,
        isLoading: false,
        progressStep: 'complete',
        progressPercent: 100,
        progressMessage: 'Visualization ready!',
      });

      // Clear progress after a short delay
      setTimeout(() => {
        set({
          progressStep: '',
          progressPercent: 0,
          progressMessage: '',
        });
      }, 1000);
    } catch (error: any) {
      // Cache an error marker to prevent infinite retry loops
      const newMap = new Map(get().visualizationData);
      newMap.set(type, { error: true, message: error.message || 'Failed to generate visualization' });

      set({
        error: error.message || 'Failed to load visualization',
        visualizationData: newMap,
        currentVisualization: type,
        isLoading: false,
        progressStep: 'error',
        progressPercent: 0,
        progressMessage: 'Failed to generate visualization',
      });
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
      progressMessage: '',
    });
  },

  clearError: () => {
    set({ error: null });
  },

  addToast: (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  // Document history methods
  fetchDocumentList: async () => {
    set({ isLoadingList: true });
    try {
      const response = await apiClient.listDocuments();
      set({ documentList: response.documents, isLoadingList: false });
    } catch (error: any) {
      console.error('Failed to fetch document list:', error);
      set({ isLoadingList: false });
      get().addToast({
        type: 'error',
        title: 'Failed to load documents',
        message: error.message,
        duration: 5000,
      });
    }
  },

  loadDocumentById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getDocumentFull(id);

      // Convert visualizations object to Map
      const vizMap = new Map<VisualizationType, any>();
      if (response.visualizations) {
        Object.entries(response.visualizations).forEach(([type, data]) => {
          vizMap.set(type as VisualizationType, data);
        });
      }

      set({
        document: response.document,
        analysis: response.analysis || null,
        visualizationData: vizMap,
        isLoading: false,
        currentVisualization: 'structured-view',
      });

      get().addToast({
        type: 'success',
        title: 'Document loaded',
        message: 'All cached data restored',
        duration: 3000,
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load document', isLoading: false });
      get().addToast({
        type: 'error',
        title: 'Failed to load document',
        message: error.message,
        duration: 0,
      });
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  searchDocuments: async (query: string) => {
    set({ isLoadingList: true, searchQuery: query });
    try {
      if (!query.trim()) {
        // If empty query, fetch all documents
        await get().fetchDocumentList();
        return;
      }

      const response = await apiClient.searchDocuments(query);
      set({ documentList: response.documents, isLoadingList: false });
    } catch (error: any) {
      console.error('Failed to search documents:', error);
      set({ isLoadingList: false });
      get().addToast({
        type: 'error',
        title: 'Search failed',
        message: error.message,
        duration: 5000,
      });
    }
  },
}));
