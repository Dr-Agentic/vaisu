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

export interface TLDRSummary {
  text: string;
  confidence?: number;
  generatedAt?: string;
  model?: string;
}

export interface DocumentAnalysis {
  tldr: TLDRSummary;
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
  trend?: "up" | "down" | "stable";
  trendValue?: number;
  confidence: number;
}

export type EntityType =
  | "person"
  | "organization"
  | "location"
  | "concept"
  | "product"
  | "metric"
  | "date"
  | "technical";

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

export type RelationType =
  | "causes"
  | "requires"
  | "part-of"
  | "relates-to"
  | "implements"
  | "uses"
  | "depends-on";

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
  direction: "up" | "down" | "stable";
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
  | "structured-view"
  | "mind-map"
  | "argument-map"
  | "depth-graph"
  | "flowchart"
  | "knowledge-graph"
  | "uml-class-diagram"
  | "uml-sequence"
  | "uml-activity"
  | "executive-dashboard"
  | "timeline"
  | "gantt"
  | "comparison-matrix"
  | "priority-matrix"
  | "raci-matrix"
  | "terms-definitions"
  | "entity-graph";

export interface VisualizationRecommendation {
  type: VisualizationType;
  score: number;
  rationale: string;
}

// Visualization Data Models

export interface MindMapData {
  root: MindMapNode;
  layout: "radial" | "timeline" | "fishbone";
  theme: ColorTheme;
}

export interface MindMapNode {
  id: string;
  label: string;
  subtitle: string; // 40-char headline for quick context
  summary: string;
  children: MindMapNode[];
  level: number;
  color: string;
  icon: string; // Emoji metaphor for visual categorization
  sourceRef: TextSpan;
  detailedExplanation: string; // For hover tooltip
  sourceTextExcerpt?: string; // Original text excerpt if available
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
  layout: "topToBottom" | "leftToRight";
}

export type FlowNodeType =
  | "process"
  | "decision"
  | "start"
  | "end"
  | "input"
  | "output";

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
  type?: "solid" | "dashed";
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
  hierarchy?: HierarchyInfo;
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
    description?: string;
    sourceQuote?: string;
    sourceSpan?: TextSpan;
  };
}

export interface EnhancedGraphNode extends GraphNode {
  // Computed properties
  degree: number;
  betweenness: number;
  eigenvector: number;
  clusterId: string;
  clusterColor: string;

  // Hierarchical properties
  isExpandable: boolean;
  isExpanded: boolean;
  children: string[]; // Child node IDs
  parent: string | null;
  depth: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: RelationType;
  strength: number;
  label?: string;
  evidence?: TextSpan[];
}

export interface Cluster {
  id: string;
  label: string;
  nodeIds: string[];
  color: string;
  boundary?: { x: number; y: number }[]; // Convex hull points
}

export interface HierarchyInfo {
  rootNodes: string[];
  maxDepth: number;
  nodeDepths: Map<string, number>;
}

export interface DashboardData {
  executiveCard: ExecutiveSummary;
  kpiTiles: KPI[];
  charts: ChartData[];
}

export interface ChartData {
  type: "waterfall" | "sankey" | "heatmap" | "bar" | "line" | "radar";
  title: string;
  data: any;
}

export interface TimelineData {
  events: TimelineEvent[];
  scale: "day" | "week" | "month" | "year";
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

export interface TermsDefinitionsData {
  terms: GlossaryTerm[];
  metadata: {
    totalTerms: number;
    extractionConfidence: number;
    documentDomain: string;
  };
}

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  type: "acronym" | "technical" | "jargon" | "concept";
  confidence: number;
  mentions: number;
  context?: string;
  qualifiers?: string[];
}

// Argument Map Types
export interface ArgumentMapData {
  nodes: ArgumentNode[];
  edges: ArgumentEdge[];
  metadata?: {
    mainClaimId: string;
    totalClaims: number;
    totalEvidence: number;
  };
}

export type ArgumentType =
  | "claim"
  | "argument"
  | "evidence"
  | "counterargument"
  | "rebuttal"
  | "alternative";
export type ArgumentPolarity = "support" | "attack" | "neutral";

export interface ArgumentNode {
  id: string;
  type: ArgumentType;
  label: string;
  summary: string; // 1-2 lines max
  polarity: ArgumentPolarity;
  confidence: number; // 0-1
  impact: "low" | "medium" | "high";
  depthMetrics?: {
    cohesion: number;
    nuance: number;
    grounding: number;
    tension: number;
    confidence: {
      cohesion: number;
      nuance: number;
      grounding: number;
      tension: number;
      composite: number;
    };
  };
  source?: string;
  parentId?: string; // For hierarchy if needed, mostly handled by edges
  isCollapsed?: boolean;
}

export type ArgumentEdgeType =
  | "supports"
  | "attacks"
  | "rebuts"
  | "is-alternative-to"
  | "depends-on";

export interface ArgumentEdge {
  id: string;
  source: string;
  target: string;
  type: ArgumentEdgeType;
  strength: number; // 0-1
  rationale?: string;
}

// Depth Graph Types

export interface DepthGraphData {
  analysis_metadata: {
    total_logical_units: number;
    overall_text_depth_trajectory: string;
  };
  logical_units: DepthGraphNode[];
}

export interface DepthGraphNode {
  id: number;
  topic: string;
  topic_summary: string;
  extended_summary: string;
  true_depth: number;
  dimensions: DepthDimensions;
  clarity_signals: ClaritySignals;
  actionable_feedback: string;
  additional_data: {
    text_preview: string;
    coherence_analysis: string;
  };
}

export interface DepthDimensions {
  cognitive: DimensionDetail;
  epistemic: DimensionDetail;
  causal: DimensionDetail;
  rigor: DimensionDetail;
  coherence: DimensionDetail;
}

export interface DimensionDetail {
  score: number;
  rationale: string;
  evidence: string[];
}

export interface ClaritySignals {
  grounding: string[];
  nuance: string[];
}

// UML Class Diagram Types

export interface UMLDiagramData {
  classes: ClassEntity[];
  relationships: UMLRelationship[];
  packages: Package[];
  metadata: DiagramMetadata;
}

export interface ClassEntity {
  id: string;
  name: string;
  type: "class" | "interface" | "abstract" | "enum";
  stereotype?: string;
  package?: string;

  // Members
  attributes: Attribute[];
  methods: Method[];

  // Computed properties
  position?: Position;
  size?: Size;

  // Context (for hover tooltips)
  description: string;
  sourceQuote: string;
  sourceSpan: TextSpan | null;
  documentLink: string;
}

export interface Attribute {
  id: string;
  name: string;
  type: string;
  visibility: "public" | "private" | "protected" | "package";
  isStatic: boolean;
  defaultValue?: string;
}

export interface Method {
  id: string;
  name: string;
  returnType: string;
  visibility: "public" | "private" | "protected" | "package";
  isStatic: boolean;
  isAbstract: boolean;
  parameters: Parameter[];
}

export interface Parameter {
  name: string;
  type: string;
  defaultValue?: string;
}

export interface UMLRelationship {
  id: string;
  source: string; // Class ID
  target: string; // Class ID
  type:
  | "inheritance"
  | "realization"
  | "composition"
  | "aggregation"
  | "association"
  | "dependency";

  // Optional properties
  sourceMultiplicity?: string;
  targetMultiplicity?: string;
  sourceRole?: string;
  targetRole?: string;
  label?: string;

  // Context (for hover tooltips)
  description: string;
  sourceQuote: string;
  evidence: string[];
}

export interface Package {
  id: string;
  name: string;
  parent?: string;
  classes: string[]; // Class IDs
  color: string;
}

export interface DiagramMetadata {
  totalClasses: number;
  totalRelationships: number;
  extractionConfidence: number;
  documentDomain: string;
  generatedAt: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
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

export interface DocumentListItem {
  id: string;
  title: string;
  fileType: string;
  uploadDate: Date;
  tldr?: string;
  summaryHeadline?: string;
  wordCount: number;
}

export interface ListDocumentsResponse {
  documents: DocumentListItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface SearchDocumentsResponse {
  documents: DocumentListItem[];
  total: number;
  query: string;
}

export interface GetDocumentFullResponse {
  document: Document;
  analysis?: DocumentAnalysis;
  visualizations: Map<VisualizationType, any>;
}

export interface AnalyzeDocumentRequest {
  documentId?: string;
  text?: string;
}

export interface AnalyzeDocumentResponse {
  documentId: string;
  document: Document;
  analysis: DocumentAnalysis;
  processingTime: number;
  cached?: boolean;
}

export interface GetDocumentResponse {
  documentId: string;
  document: Document;
  analysis: DocumentAnalysis;
  presignedUrl?: string;
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
  format: "pdf" | "png" | "svg" | "pptx" | "html" | "json" | "csv";
}

// LLM Types

export type TaskType =
  | "tldr"
  | "executiveSummary"
  | "entityExtraction"
  | "relationshipDetection"
  | "sectionSummary"
  | "signalAnalysis"
  | "vizRecommendation"
  | "kpiExtraction"
  | "glossary"
  | "qa"
  | "mindMapGeneration"
  | "argumentMapGeneration"
  | "uml-extraction"
  | "knowledge-graph-generation"
  | "depthAnalysis"
  | "entityGraphGeneration";

export interface LLMCallConfig {
  model: string;
  messages: LLMMessage[];
  maxTokens: number;
  temperature: number;
}

export interface LLMMessage {
  role: "system" | "user" | "assistant";
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

// Entity Graph Types
export interface EntityGraphData {
  nodes: EntityGraphNode[];
  edges: EntityGraphEdge[];
  metadata: {
    trajectory: string;
    depthScore: number;
    totalUnits: number;
  };
}

export interface EntityGraphNode {
  id: string;
  label: string;
  summary: string;
  depth: number; // 0-10
  sequenceIndex: number; // X-axis position
  type: "concept" | "mechanism" | "evidence";
  clarityScore: number;
}

export interface EntityGraphEdge {
  id: string;
  source: string;
  target: string;
  type: "leads-to" | "supports" | "contrasts" | "expands" | "relates-to";
  label?: string;
  strength: number;
}

// Knowledge Graph State Management Types

export type LayoutAlgorithm = "force-directed" | "hierarchical" | "circular";

export interface FilterState {
  visibleEntityTypes: Set<EntityType>;
  importanceThreshold: number;
  searchQuery: string;
  visibleRelationTypes: Set<RelationType>;
}

export interface GraphSnapshot {
  id: string;
  timestamp: Date;
  nodePositions: Map<string, { x: number; y: number }>;
  zoom: number;
  pan: { x: number; y: number };
  filters: FilterState;
  selectedNodeIds: string[];
  expandedNodeIds: string[];
}

export interface BreadcrumbItem {
  nodeId: string;
  label: string;
  depth: number;
}

export interface GraphState {
  // Data
  nodes: EnhancedGraphNode[];
  edges: GraphEdge[];
  clusters: Cluster[];

  // Layout
  layoutAlgorithm: LayoutAlgorithm;
  nodePositions: Map<string, { x: number; y: number }>;
  isLayouting: boolean;

  // Viewport
  zoom: number;
  pan: { x: number; y: number };

  // Selection
  selectedNodeIds: Set<string>;
  selectedEdgeIds: Set<string>;
  hoveredNodeId: string | null;

  // Filters
  visibleEntityTypes: Set<EntityType>;
  importanceThreshold: number;
  searchQuery: string;
  visibleRelationTypes: Set<RelationType>;

  // Exploration
  expandedNodeIds: Set<string>;
  explorationDepth: number;
  breadcrumbs: BreadcrumbItem[];

  // Snapshots
  snapshots: GraphSnapshot[];
  currentSnapshotIndex: number;

  // Performance
  performanceMode: boolean;

  // Actions
  setLayout: (algorithm: LayoutAlgorithm) => void;
  selectNode: (id: string, multi: boolean) => void;
  selectEdge: (id: string) => void;
  expandNode: (id: string) => void;
  collapseNode: (id: string) => void;
  applyFilters: (filters: Partial<FilterState>) => void;
  saveSnapshot: () => void;
  restoreSnapshot: (index: number) => void;
  setPerformanceMode: (enabled: boolean) => void;
}

export type ExportFormat = "png" | "svg" | "html" | "json";
export interface DashboardStats {
  totalDocuments: number;
  totalGraphs: number;
  documentsThisWeek: number;
  totalWords: number;
  averageConfidence?: number;
}
