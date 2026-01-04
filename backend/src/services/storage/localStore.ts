import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define data directory relative to project root (backend/src/services/storage -> backend -> root -> data)
const DATA_DIR = path.resolve(__dirname, '../../../../data');
const FILES_DIR = path.join(DATA_DIR, 'files');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(FILES_DIR)) {
  fs.mkdirSync(FILES_DIR, { recursive: true });
}

export class LocalFileStore {
  private documentsFile = path.join(DATA_DIR, 'documents.json');
  private analysesFile = path.join(DATA_DIR, 'analyses.json');
  private visualizationsFile = path.join(DATA_DIR, 'visualizations.json');

  constructor() {
    this.initJsonFile(this.documentsFile);
    this.initJsonFile(this.analysesFile);
    this.initJsonFile(this.visualizationsFile);
  }

  private initJsonFile(filePath: string) {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
    }
  }

  private readJson<T>(filePath: string): Record<string, T> {
    try {
      if (!fs.existsSync(filePath)) return {};
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error);
      return {};
    }
  }

  private writeJson<T>(filePath: string, data: Record<string, T>) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error writing ${filePath}:`, error);
    }
  }

  // Document Metadata Operations
  getDocument(id: string): any | null {
    const docs = this.readJson<any>(this.documentsFile);
    return docs[id] || null;
  }

  saveDocument(document: any): void {
    const docs = this.readJson<any>(this.documentsFile);
    docs[document.documentId] = document;
    this.writeJson(this.documentsFile, docs);
  }

  listDocuments(userId: string): any[] {
    const docs = this.readJson<any>(this.documentsFile);
    return Object.values(docs)
      .sort((a: any, b: any) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  findByHashAndFilename(hash: string, filename: string): any | null {
    const docs = this.readJson<any>(this.documentsFile);
    return Object.values(docs).find(
      (doc: any) => doc.contentHash === hash && doc.filename === filename
    ) || null;
  }

  // Analysis Operations
  getAnalysis(documentId: string): any | null {
    const analyses = this.readJson<any>(this.analysesFile);
    return analyses[documentId] || null;
  }

  saveAnalysis(analysis: any): void {
    const analyses = this.readJson<any>(this.analysesFile);
    analyses[analysis.documentId] = analysis;
    this.writeJson(this.analysesFile, analyses);
  }

  // Visualization Operations
  getVisualization(documentId: string, visualizationType: string): any | null {
    const visualizations = this.readJson<any>(this.visualizationsFile);
    const docVisualizations = visualizations[documentId] || {};
    return docVisualizations[visualizationType] || null;
  }

  getVisualizationsByDocument(documentId: string): any[] {
    const visualizations = this.readJson<any>(this.visualizationsFile);
    const docVisualizations = visualizations[documentId] || {};
    return Object.values(docVisualizations);
  }

  saveVisualization(visualization: any): void {
    const visualizations = this.readJson<any>(this.visualizationsFile);
    if (!visualizations[visualization.documentId]) {
      visualizations[visualization.documentId] = {};
    }
    visualizations[visualization.documentId][visualization.visualizationType] = visualization;
    this.writeJson(this.visualizationsFile, visualizations);
  }

  // File Operations (Simulating S3)
  async saveFile(key: string, content: Buffer): Promise<string> {
    // Sanitize key to be safe for file system
    const safeKey = key.replace(/[^a-zA-Z0-9-_\.]/g, '_');
    const filePath = path.join(FILES_DIR, safeKey);
    
    // Create subdirectories if needed (flattened structure for simplicity)
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, content);
    return filePath;
  }

  async getFile(key: string): Promise<Buffer> {
    const safeKey = key.replace(/[^a-zA-Z0-9-_\.]/g, '_');
    const filePath = path.join(FILES_DIR, safeKey);
    return fs.readFileSync(filePath);
  }
}

export const localStore = new LocalFileStore();
