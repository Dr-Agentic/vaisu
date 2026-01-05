# Step-by-Step Guide: Adding a New Graphical Representation

Based on the Knowledge Map implementation analysis, here's a comprehensive guide for adding new graphical representations to Vaisu.

## Overview

This guide covers the complete implementation pipeline from database schema to frontend visualization, following the established patterns in the Vaisu codebase.

## Phase 1: Database Specification

### 1.1 Define Data Model Types

**File: `/backend/src/repositories/types.ts`**

```typescript
// Add new entity types
interface NewVisualizationNode {
  id: string;
  documentId: string;
  label: string;
  nodeType: string;  // e.g., 'timeline-event', 'flow-step'
  position: number;
  metadata: {
    sources: string[];
    description?: string;
    category?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface NewVisualizationEdge {
  id: string;
  documentId: string;
  sourceId: string;
  targetId: string;
  relationshipType: string;
  weight: number;
  metadata: {
    description: string;
    evidence: string[];
  };
  createdAt: string;
  updatedAt: string;
}

interface NewVisualizationRecord {
  documentId: string;
  visualizationType: string;  // e.g., "timeline", "flowchart"
  visualizationData: {
    nodes: NewVisualizationNode[];
    edges: NewVisualizationEdge[];
    layout: any;  // specific layout data
  };
  llmMetadata: {
    model: string;
    tokensUsed: number;
    processingTime: number;
    timestamp: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

### 1.2 Create Repository

**File: `/backend/src/repositories/newVisualizationRepository.ts`**

```typescript
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

export class NewVisualizationRepository {
  private client: DynamoDBClient;
  private tableName: string;

  constructor() {
    this.client = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
    this.tableName = process.env.DYNAMODB_NEW_VIZ_TABLE || 'vaisu-new-visualization';
  }

  async create(data: NewVisualizationRecord): Promise<void> {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: {
        documentId: data.documentId,
        SK: 'NEW_VIZ',
        visualizationType: data.visualizationType,
        visualizationData: data.visualizationData,
        llmMetadata: data.llmMetadata,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
    });
    await this.client.send(command);
  }

  async getByDocumentId(documentId: string): Promise<NewVisualizationRecord | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: {
        documentId,
        SK: 'NEW_VIZ',
      },
    });
    const result = await this.client.send(command);
    return result.Item as NewVisualizationRecord || null;
  }

  async createTable(): Promise<void> {
    // Table creation script similar to setupKnowledgeGraphTable.ts
  }
}
```

### 1.3 Database Setup Script

**File: `/backend/scripts/setupNewVisualizationTable.ts`**

```typescript
import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const createTable = async () => {
  const command = new CreateTableCommand({
    TableName: process.env.DYNAMODB_NEW_VIZ_TABLE || 'vaisu-new-visualization',
    KeySchema: [
      { AttributeName: 'documentId', KeyType: 'HASH' },
      { AttributeName: 'SK', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'documentId', AttributeType: 'S' },
      { AttributeName: 'SK', AttributeType: 'S' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  });

  await client.send(command);
  console.log('New Visualization table created successfully');
};

createTable().catch(console.error);
```

## Phase 2: Service Layer Implementation

### 2.1 Create Visualization Service

**File: `/backend/src/services/visualization/newVisualizationGenerator.ts`**

```typescript
import { NewVisualizationRepository } from '../../repositories/newVisualizationRepository.js';
import { OpenRouterClient } from '../llm/openRouterClient.js';

export class NewVisualizationGenerator {
  private repository: NewVisualizationRepository;
  private client: OpenRouterClient;

  constructor() {
    this.repository = new NewVisualizationRepository();
    this.client = new OpenRouterClient();
  }

  async generate(documentId: string, document: string, analysis: any): Promise<any> {
    // 1. Check cache first
    const cached = await this.repository.getByDocumentId(documentId);
    if (cached) {
      return cached.visualizationData;
    }

    // 2. Generate visualization data using LLM
    const prompt = `
      Analyze the following document and extract data for a new visualization:

      Document: ${document}

      Analysis: ${JSON.stringify(analysis)}

      Extract:
      1. Nodes/entities relevant to the new visualization type
      2. Relationships between these entities
      3. Appropriate layout information

      Return in JSON format with strict schema validation.
    `;

    const response = await this.client.generate(prompt, {
      model: 'x-ai/grok-4.1-fast',
      temperature: 0.1,
    });

    // 3. Parse and validate response
    const data = this.parseResponse(response);

    // 4. Create visualization record
    const record = {
      documentId,
      visualizationType: 'new-viz',
      visualizationData: data,
      llmMetadata: {
        model: 'x-ai/grok-4.1-fast',
        tokensUsed: response.usage?.total_tokens || 0,
        processingTime: Date.now(),
        timestamp: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 5. Store in database
    await this.repository.create(record);

    return data;
  }

  private parseResponse(response: any): any {
    // Implement response parsing and validation
    return response.choices[0]?.message?.content;
  }
}
```

### 2.2 Integrate with Visualization Service

**File: `/backend/src/services/visualization/visualizationGenerator.ts`**

```typescript
import { NewVisualizationGenerator } from './newVisualizationGenerator.js';

export class VisualizationGenerator {
  private generators: Map<string, any>;

  constructor() {
    this.generators = new Map([
      ['structured-view', new StructuredViewGenerator()],
      ['mind-map', new MindMapGenerator()],
      ['flowchart', new FlowchartGenerator()],
      ['knowledge-graph', new KnowledgeGraphGenerator()],
      ['new-viz', new NewVisualizationGenerator()], // Add new generator
    ]);
  }

  async generateVisualization(
    type: string,
    document: string,
    analysis: any
  ): Promise<any> {
    const generator = this.generators.get(type);
    if (!generator) {
      throw new Error(`Unknown visualization type: ${type}`);
    }

    return await generator.generate(document, analysis);
  }
}
```

## Phase 3: API Endpoints

### 3.1 Add Route Handler

**File: `/backend/src/routes/documents.ts`**

```typescript
// Add to existing visualization routes (around line 332-419)

router.post(
  '/:id/visualizations/new-viz',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id: documentId } = req.params;

      // Load document from cache or DynamoDB
      const document = await documentRepository.getDocumentById(documentId);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Check if analysis exists
      const analysis = await analysisRepository.getAnalysisByDocumentId(documentId);
      if (!analysis) {
        return res.status(400).json({
          error: 'Document must be analyzed before generating visualization',
        });
      }

      // Generate visualization
      const data = await visualizationGenerator.generateVisualization(
        'new-viz',
        document.content,
        analysis
      );

      res.json({
        type: 'new-viz',
        data,
        cached: false,
      });
    } catch (error: any) {
      console.error('New Visualization error:', error);
      res.status(500).json({
        error: error.message || 'Failed to generate new visualization',
      });
    }
  }
);

// Add GET endpoint for retrieving visualization
router.get(
  '/:id/visualizations/new-viz',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id: documentId } = req.params;

      const repository = new NewVisualizationRepository();
      const record = await repository.getByDocumentId(documentId);

      if (!record) {
        return res.status(404).json({ error: 'Visualization not found' });
      }

      res.json({
        type: 'new-viz',
        data: record.visualizationData,
        llmMetadata: record.llmMetadata,
      });
    } catch (error: any) {
      console.error('Get new visualization error:', error);
      res.status(500).json({
        error: error.message || 'Failed to retrieve new visualization',
      });
    }
  }
);
```

## Phase 4: Frontend Implementation

### 4.1 Define Frontend Types

**File: `/frontend/src/components/visualizations/new-viz/types.ts`**

```typescript
export interface NewVizNode {
  id: string;
  label: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  metadata: {
    description?: string;
    category?: string;
    importance?: number;
  };
}

export interface NewVizEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label?: string;
  metadata: {
    description?: string;
    strength?: number;
  };
}

export interface NewVizData {
  nodes: NewVizNode[];
  edges: NewVizEdge[];
  layout: string; // 'horizontal', 'vertical', 'circular'
  settings: {
    nodeSize: number;
    edgeThickness: number;
    colors: string[];
  };
}
```

### 4.2 Create Frontend Store

**File: `/frontend/src/components/visualizations/new-viz/stores/newVizStore.ts`**

```typescript
import { create } from 'zustand';
import { NewVizData, NewVizNode, NewVizEdge } from '../types';

interface NewVizState {
  data: NewVizData | null;
  isLoading: boolean;
  error: string | null;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;

  generate: (documentId: string) => Promise<void>;
  setSelectedNode: (nodeId: string | null) => void;
  setHoveredNode: (nodeId: string | null) => void;
  clear: () => void;
}

export const useNewVizStore = create<NewVizState>((set, get) => ({
  data: null,
  isLoading: false,
  error: null,
  selectedNodeId: null,
  hoveredNodeId: null,

  generate: async (documentId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.generateVisualization(documentId, 'new-viz');
      set({ data: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),
  setHoveredNode: (nodeId) => set({ hoveredNodeId: nodeId }),
  clear: () => set({ data: null, selectedNodeId: null, hoveredNodeId: null }),
}));
```

### 4.3 Create Main Component

**File: `/frontend/src/components/visualizations/new-viz/NewViz.tsx`**

```typescript
import React, { useEffect, useRef } from 'react';
import { useNewVizStore } from './stores/newVizStore';
import { NewVizData } from './types';
import { NewVizNode } from './components/NewVizNode';
import { NewVizEdge } from './components/NewVizEdge';

interface NewVizProps {
  documentId: string;
}

export const NewViz: React.FC<NewVizProps> = ({ documentId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, error, generate, selectedNodeId, hoveredNodeId } = useNewVizStore();

  useEffect(() => {
    if (documentId) {
      generate(documentId);
    }
  }, [documentId, generate]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!data) {
    return <div className="text-gray-500">No data available</div>;
  }

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <svg className="w-full h-full">
        {/* Render edges first */}
        {data.edges.map((edge) => (
          <NewVizEdge
            key={edge.id}
            edge={edge}
            nodes={data.nodes}
            selected={false}
            hovered={false}
          />
        ))}

        {/* Render nodes */}
        {data.nodes.map((node) => (
          <NewVizNode
            key={node.id}
            node={node}
            selected={node.id === selectedNodeId}
            hovered={node.id === hoveredNodeId}
            onSelect={() => useNewVizStore.getState().setSelectedNode(node.id)}
            onHover={() => useNewVizStore.getState().setHoveredNode(node.id)}
          />
        ))}
      </svg>
    </div>
  );
};
```

### 4.4 Create Visualization Components

**File: `/frontend/src/components/visualizations/new-viz/components/NewVizNode.tsx`**

```typescript
import React from 'react';
import { NewVizNode as NewVizNodeType } from '../types';

interface NewVizNodeProps {
  node: NewVizNodeType;
  selected: boolean;
  hovered: boolean;
  onSelect: () => void;
  onHover: () => void;
}

export const NewVizNode: React.FC<NewVizNodeProps> = ({
  node,
  selected,
  hovered,
  onSelect,
  onHover,
}) => {
  const baseClasses = "transition-all duration-200 cursor-pointer";
  const selectedClasses = selected ? "ring-2 ring-blue-500 shadow-lg" : "";
  const hoveredClasses = hovered ? "scale-110 z-10" : "";

  return (
    <g
      className={`${baseClasses} ${selectedClasses} ${hoveredClasses}`}
      onClick={onSelect}
      onMouseEnter={onHover}
    >
      <circle
        cx={node.position.x}
        cy={node.position.y}
        r={20}
        fill="var(--color-primary)"
        stroke="var(--color-border)"
        strokeWidth={2}
      />
      <text
        x={node.position.x}
        y={node.position.y + 5}
        textAnchor="middle"
        className="text-xs fill-gray-700 font-medium"
      >
        {node.label}
      </text>
    </g>
  );
};
```

### 4.5 Add to Visualization Router

**File: `/frontend/src/components/visualizations/VisualizationRouter.tsx`**

```typescript
import React from 'react';
import { NewViz } from './new-viz/NewViz';

interface VisualizationRouterProps {
  type: string;
  documentId: string;
}

export const VisualizationRouter: React.FC<VisualizationRouterProps> = ({
  type,
  documentId,
}) => {
  switch (type) {
    case 'structured-view':
      return <StructuredView documentId={documentId} />;
    case 'mind-map':
      return <MindMap documentId={documentId} />;
    case 'flowchart':
      return <Flowchart documentId={documentId} />;
    case 'knowledge-graph':
      return <KnowledgeGraph documentId={documentId} />;
    case 'new-viz':
      return <NewViz documentId={documentId} />;
    default:
      return <div>Unknown visualization type: {type}</div>;
  }
};
```

## Phase 5: Integration and Testing

### 5.1 Add to Package Scripts

**File: `/backend/package.json`**

```json
{
  "scripts": {
    "setup:new-viz": "tsx scripts/setupNewVisualizationTable.ts",
    "dev": "tsx watch src/server.ts"
  }
}
```

**File: `/frontend/package.json`**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build"
  }
}
```

### 5.2 Add Tests

**File: `/backend/src/services/visualization/newVisualizationGenerator.test.ts`**

```typescript
import { NewVisualizationGenerator } from './newVisualizationGenerator';

describe('NewVisualizationGenerator', () => {
  let generator: NewVisualizationGenerator;

  beforeEach(() => {
    generator = new NewVisualizationGenerator();
  });

  test('should generate visualization data', async () => {
    const document = "Test document content";
    const analysis = { summary: "Test analysis" };

    const result = await generator.generate("test-id", document, analysis);

    expect(result).toBeDefined();
    expect(result.nodes).toBeDefined();
    expect(result.edges).toBeDefined();
  });
});
```

### 5.3 Environment Configuration

**File: `/backend/.env.example`**

```env
# Add new environment variables
DYNAMODB_NEW_VIZ_TABLE=vaisu-new-visualization
```

## Phase 6: Deployment and Migration

### 6.1 Database Migration

```bash
# Run setup script
npm run setup:new-viz
```

### 6.2 Frontend Build Process

```bash
# Build frontend
cd frontend && npm run build

# Start servers
npm run dev:backend
npm run dev:frontend
```

## Key Patterns to Follow

1. **Repository Pattern**: Always use repositories for database operations
2. **Service Layer**: Keep business logic in services, not routes
3. **Type Safety**: Define TypeScript interfaces for all data structures
4. **Error Handling**: Implement comprehensive error handling at all layers
5. **Testing**: Write unit tests for all new functionality
6. **Documentation**: Document all new components and APIs
7. **Performance**: Consider caching and lazy loading for large datasets

## Validation Checklist

- [ ] Database schema defined and created
- [ ] Repository implementation complete
- [ ] Service layer with LLM integration
- [ ] API endpoints with proper error handling
- [ ] Frontend store and state management
- [ ] React components with TypeScript
- [ ] Integration with existing visualization router
- [ ] Unit tests written
- [ ] Environment variables configured
- [ ] Documentation updated

This guide provides a complete roadmap for implementing new graphical representations while maintaining consistency with the existing Vaisu architecture.