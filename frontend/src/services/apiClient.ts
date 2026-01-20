import axios from 'axios';

import type {
  Document,
  DocumentAnalysis,
  VisualizationType,
} from '../../../shared/src/types';

const API_BASE_URL = '/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

function isLoginPage() {
  const path = window.location.pathname.replace(/\/$/, '');
  return path === '/login';
}

// Add auth token to requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Check if the URL is for login, handling potential base URL prefix
    const isLoginRequest = originalRequest.url?.includes('auth/login');
    
    if (error.response?.status === 401 && !originalRequest._retry && !isLoginRequest) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return client(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        if (!isLoginPage()) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export const apiClient = {
  // Auth Methods
  async login(email: string, password: string) {
    const response = await client.post('/auth/login', { email, password });
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async register(email: string, password: string, firstName: string, lastName: string) {
    const response = await client.post('/auth/register', { email, password, firstName, lastName });
    return response.data;
  },

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    if (!isLoginPage()) {
      window.location.href = '/login';
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  },

  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Document Methods
  async uploadDocument(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await client.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
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

  async getDocumentFull(documentId: string): Promise<{ document: Document; analysis?: DocumentAnalysis; visualizations: Record<string, any> }> {
    const response = await client.get(`/documents/${documentId}/full`);
    return response.data;
  },

  async listDocuments(limit = 50, offset = 0): Promise<{ documents: any[]; total: number; limit: number; offset: number }> {
    const response = await client.get('/documents', {
      params: { limit, offset },
    });
    return response.data;
  },

  async searchDocuments(query: string): Promise<{ documents: any[]; total: number; query: string }> {
    const response = await client.get('/documents/search', {
      params: { q: query },
    });
    return response.data;
  },

  async getProgress(documentId: string): Promise<{ step: string; progress: number; message: string }> {
    const response = await client.get(`/documents/${documentId}/progress`);
    return response.data;
  },

  async generateVisualization(documentId: string, type: VisualizationType): Promise<any> {
    const response = await client.post(`/documents/${documentId}/visualizations/${type}`);
    return response.data;
  },

  // User Management Methods
  async getMe() {
    const response = await client.get('/auth/me');
    return response.data;
  },

  async updateProfile(data: { firstName?: string; lastName?: string }) {
    const response = await client.put('/auth/profile', data);
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await client.put('/auth/password', { currentPassword, newPassword });
    return response.data;
  },

  async requestPasswordReset(email: string) {
    const response = await client.post('/auth/request-password-reset', { email });
    return response.data;
  },

  async resetPassword(userId: string, token: string, newPassword: string) {
    const response = await client.post('/auth/reset-password', { userId, token, newPassword });
    return response.data;
  },

  async verifyEmail(userId: string, token: string) {
    const response = await client.post('/auth/verify-email', { userId, token });
    return response.data;
  },

  async getSessions() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const response = await client.get(`/auth/sessions?userId=${user.userId}`);
    return response.data;
  },

  async revokeSession(sessionId: string) {
    const response = await client.post('/auth/revoke-session', { sessionId });
    return response.data;
  },

  async deleteAccount(password: string) {
    const response = await client.delete('/auth/account', { data: { password } });
    return response.data;
  },
};
