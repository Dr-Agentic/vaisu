import axios from 'axios';
import type {
  Document,
  DocumentAnalysis,
  VisualizationType
} from '../../../shared/src/types';

const API_BASE_URL = '/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const apiClient = {
  async uploadDocument(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await client.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  },

  async analyzeText(text: string): Promise<{ document: Document; analysis: DocumentAnalysis; processingTime: number }> {
    const response = await client.post('/documents/analyze', { text });
    return response.data;
  },

  async analyzeDocument(documentId: string): Promise<{ document: Document; analysis: DocumentAnalysis; processingTime: number }> {
    const response = await client.post('/documents/analyze', { documentId });
    return response.data;
  },

  async getDocument(documentId: string): Promise<{ document: Document; analysis?: DocumentAnalysis }> {
    const response = await client.get(`/documents/${documentId}`);
    return response.data;
  },

  async getProgress(documentId: string): Promise<{ step: string; progress: number; message: string }> {
    const response = await client.get(`/documents/${documentId}/progress`);
    return response.data;
  },

  async generateVisualization(documentId: string, type: VisualizationType): Promise<any> {
    const response = await client.post(`/documents/${documentId}/visualizations/${type}`);
    return response.data.data;
  }
};
