// Shared types between frontend and backend

export interface Document {
  id: string;
  title: string;
  content: string;
  metadata: DocumentMetadata;
  structure: DocumentStructure;
  analysis?: DocumentAnalysis;
}

export interface DocumentMetadata {
  wordCount: number;
  uploadDate: Date;
  fileType: string;
  language: string;
}

export interface DocumentStructure {
  sections: Section[];
  hierarchy: HierarchyNode[];
}

export interface Section {
  id: string;
  level: number;
  title: string;
  content: string;
  startIndex: number;
  endIndex: number;
  summary: string;
  keywords: string[];
  children: Section[];
}

export interface HierarchyNode {
  id: string;
  sectionId: string;
  level: number;
  children: HierarchyNode[];
}

export interface DocumentAnalysis {
  tldr: string;
  executiveSummary: ExecutiveSummary;
  entities: Entity[];
  relationships: Relationship[];
  metrics: Metric[];
  signals: SignalAnalysis;
  recommendations: VisualizationRecommendation[];
}

export interface AnalysisProgress {
  step: string;
  progress: number; // 0-100
  message: string;
  partialAnalysis?: Partial<DocumentAnalysis>; // Early results
}

export interface ExecutiveSummary {
  headline: string;
  keyIdeas: string[];
  kpis: KPI[];
  risks: string[];
  opportunities: string[];
  callToAction: string;
}

export interface KPI {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  confidence: number;
}

export type EntityType = 'person' | 'organization' | 'location' | 'concept' | 'product' | 'metric' | 'date' | 'technical';

export interface Entity {
  id: string;
  text: string;
  type: EntityType;
  mentions: TextSpan[];
  importance: number;
  context?: string;
}

export interface TextSpan {
  start: number;
  end: number;
  text: string;
}

export type RelationType = 'causes' | 'requires' | 'part-of' | 'relates-to' | 'implements' | 'uses' | 'depends-on';

export interface Relationship {
  id: string;
  source: string;
  target: string;
  type: RelationType;
  strength: number;
  evidence: TextSpan[];
}

export interface Metric {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend?: TrendIndicator;
  context: string;
  source: TextSpan;
}

export interface TrendIndicator {
  direction: 'up' | 'down' | 'stable';
  percentage?: number;
}

export interface SignalAnalysis {
  structural: number;
  process: number;
  quantitative: number;
  technical: number;
  argumentative: number;
  temporal: number;
}

export type VisualizationType = 
  | 'structured-view'
  | 'mind-map'
  | 'flowchart'
  | 'knowledge-graph'
  | 'uml-class'
  | 'uml-sequence'
  | 'uml-activity'
  | 'executive-dashboard'
  | 'timeline'
  | 'gantt'
  | 'comparison-matrix'
  | 'priority-matrix'
  | 'raci-matrix';

export interface VisualizationRecommendation {
  type: VisualizationType;
  score: number;
  rationale: string;
}

// Visualization Data Models

export interface MindMapData {
  root: MindMapNode;
  layout: 'radial' | 'timeline' | 'fishbone';
  theme: ColorTheme;
}

export interface MindMapNode {
  id: string;
  label: string;
  summary: string;
  children: MindMapNode[];
  level: number;
  color: string;
  icon?: string;
  sourceRef: TextSpan;
  metadata: {
    importance: number;
    confidence: number;
  };
}

export interface ColorTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface FlowchartData {
  nodes: FlowNode[];
  edges: FlowEdge[];
  swimlanes?: Swimlane[];
  layout: 'topToBottom' | 'leftToRight';
}

export type FlowNodeType = 'process' | 'decision' | 'start' | 'end' | 'input' | 'output';

export interface FlowNode {
  id: string;
  type: FlowNodeType;
  label: string;
  description: string;
  swimlane?: string;
  position?: { x: number; y: number };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: 'solid' | 'dashed';
}

export interface Swimlane {
  id: string;
  label: string;
  color: string;
}

export interface KnowledgeGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  clusters: Cluster[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: EntityType;
  size: number;
  color: string;
  position?: { x: number; y: number };
  metadata: {
    centrality: number;
    connections: number;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: RelationType;
  strength: number;
  label?: string;
}

export interface Cluster {
  id: string;
  label: string;
  nodeIds: string[];
  color: string;
}

export interface DashboardData {
  executiveCard: ExecutiveSummary;
  kpiTiles: KPI[];
  charts: ChartData[];
}

export interface ChartData {
  type: 'waterfall' | 'sankey' | 'heatmap' | 'bar' | 'line';
  title: string;
  data: any;
}

export interface TimelineData {
  events: TimelineEvent[];
  scale: 'day' | 'week' | 'month' | 'year';
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  endDate?: Date;
  category: string;
  color: string;
}

// API Request/Response types

export interface UploadDocumentRequest {
  file?: File;
  text?: string;
}

export interface UploadDocumentResponse {
  documentId: string;
  message: string;
}

export interface AnalyzeDocumentRequest {
  documentId?: string;
  text?: string;
}

export interface AnalyzeDocumentResponse {
  document: Document;
  analysis: DocumentAnalysis;
  processingTime: number;
}

export interface GenerateVisualizationRequest {
  documentId: string;
  type: VisualizationType;
}

export interface GenerateVisualizationResponse {
  type: VisualizationType;
  data: any;
}

export interface ExportRequest {
  documentId: string;
  visualizationType: VisualizationType;
  format: 'pdf' | 'png' | 'svg' | 'pptx' | 'html' | 'json' | 'csv';
}

// LLM Types

export type TaskType = 
  | 'tldr'
  | 'executiveSummary'
  | 'entityExtraction'
  | 'relationshipDetection'
  | 'sectionSummary'
  | 'signalAnalysis'
  | 'vizRecommendation'
  | 'kpiExtraction'
  | 'glossary'
  | 'qa'
  | 'mindMapGeneration';

export interface LLMCallConfig {
  model: string;
  messages: LLMMessage[];
  maxTokens: number;
  temperature: number;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  tokensUsed: number;
  model: string;
}

export interface ModelConfig {
  primary: string;
  fallback: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
}
