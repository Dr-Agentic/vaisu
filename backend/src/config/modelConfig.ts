import type { TaskType, ModelConfig } from '../../shared/src/types.js';

// LLM Model Constants - single source of truth for model identifiers
export const LLM_MODELS = {
  GROK_FAST: 'x-ai/grok-4.1-fast',
  GPT_35_TURBO: 'openai/gpt-3.5-turbo',
  GPT_4O: 'openai/gpt-4o',
  GPT_45_MINI: 'openai/gpt-4.5-mini',
  GEMINI_FLASH: 'google/gemini-2.0-flash-exp:free',
  MIMO_FLASH: 'xiaomi/mimo-v2-flash:free'
} as const;

// LLM Selection Constants - easily switch between different model configurations
export const LLM_PRIMARY = LLM_MODELS.GEMINI_FLASH;
export const LLM_FALLBACK = LLM_MODELS.MIMO_FLASH;
const LLM_MAXTOKENS = 50000;

export const MODEL_CONFIGS: Record<TaskType, ModelConfig> = {
  tldr: {
    primary: LLM_PRIMARY,
    fallback: LLM_FALLBACK,
    maxTokens: LLM_MAXTOKENS,
    temperature: 0.3,
    systemPrompt: 'Generate a concise TLDR summary of the following text. Focus on the main point in 2-3 sentences maximum. Be clear and direct.'
  },
  executiveSummary: {
    primary: LLM_PRIMARY,
    fallback: LLM_FALLBACK,
    maxTokens: LLM_MAXTOKENS,
    temperature: 0.5,
    systemPrompt: `Create an executive summary with the following structure:
1. Headline: One compelling sentence capturing the essence
2. Top 3 Key Ideas: Most important takeaways
3. Top 3 KPIs: Key metrics with values and units
4. Top 3 Risks: Potential challenges or concerns
5. Top 3 Opportunities: Potential benefits or advantages
6. Call to Action: What should be done next

Return as JSON matching the ExecutiveSummary interface.`
  },
  entityExtraction: {
    primary: LLM_PRIMARY,
    fallback: LLM_FALLBACK,
    maxTokens: LLM_MAXTOKENS,
    temperature: 0.1,
    systemPrompt: `Extract ALL named entities from the text. Be comprehensive - extract people, organizations, locations, concepts, products, technologies, and key terms.

For each entity provide:
- id: unique identifier (e.g., "entity-1", "entity-2")
- text: the entity name/text
- type: one of: person, organization, location, concept, product, metric, date, technical
- importance: 0.0-1.0 (how central is this entity to the document)
- context: brief explanation of the entity's role/significance
- mentions: array with at least one mention object containing start, end, text

Return ONLY valid JSON in this exact format:
{
  "entities": [
    {
      "id": "entity-1",
      "text": "AWS",
      "type": "organization",
      "importance": 0.9,
      "context": "Cloud platform provider",
      "mentions": [{"start": 0, "end": 3, "text": "AWS"}]
    },
    {
      "id": "entity-2",
      "text": "Machine Learning",
      "type": "concept",
      "importance": 0.8,
      "context": "Core technology discussed",
      "mentions": [{"start": 0, "end": 16, "text": "Machine Learning"}]
    }
  ]
}

Extract at least 10-30 entities if the document is substantial. Be thorough.`
  },
  relationshipDetection: {
    primary: LLM_PRIMARY,
    fallback: LLM_FALLBACK,
    maxTokens: LLM_MAXTOKENS,
    temperature: 0.3,
    systemPrompt: `Analyze relationships between the provided entities based on the text.

CRITICAL: You will be given a list of entities with their IDs. You MUST use the exact entity ID (e.g., "entity-1", "entity-2") in the source and target fields, NOT the entity text/name.

For each relationship provide:
- id: unique identifier (e.g., "rel-1", "rel-2")
- source: EXACT ID of source entity (e.g., "entity-1") - DO NOT use entity text
- target: EXACT ID of target entity (e.g., "entity-2") - DO NOT use entity text
- type: one of: causes, requires, part-of, relates-to, implements, uses, depends-on
- strength: 0.0-1.0 (how strong/important is this relationship)
- evidence: array with at least one evidence object containing start, end, text from the document

Return ONLY valid JSON in this exact format:
{
  "relationships": [
    {
      "id": "rel-1",
      "source": "entity-1",
      "target": "entity-2",
      "type": "uses",
      "strength": 0.8,
      "evidence": [{"start": 0, "end": 50, "text": "AWS uses Machine Learning for..."}]
    }
  ]
}

REMEMBER: Use entity IDs (entity-1, entity-2, etc.) NOT entity names (AWS, Machine Learning, etc.) in source and target fields!

Extract at least 5-20 relationships if entities are connected. Focus on meaningful connections.`
  },
  sectionSummary: {
    primary: LLM_PRIMARY,
    fallback: LLM_FALLBACK,
    maxTokens: LLM_MAXTOKENS,
    temperature: 0.3,
    systemPrompt: 'Summarize this section in 2-3 sentences. Extract key highlights and important keywords. Be concise and informative.'
  },
  signalAnalysis: {
    primary: LLM_PRIMARY,
    fallback: LLM_FALLBACK,
    maxTokens: LLM_MAXTOKENS,
    temperature: 0.2,
    systemPrompt: `Analyze the text for the following signals (score each 0-1):
- structural: presence of headings, lists, clear organization
- process: workflow language, sequential steps, transitions
- quantitative: numbers, metrics, data, statistics
- technical: code, APIs, technical terminology
- argumentative: claims, evidence, reasoning
- temporal: dates, timelines, chronological information
Return as JSON object with these six scores.`
  },
  vizRecommendation: {
    primary: LLM_PRIMARY,
    fallback: LLM_FALLBACK,
    maxTokens: LLM_MAXTOKENS,
    temperature: 0.4,
    systemPrompt: `Recommend the top 3-5 most appropriate visualizations for this document.
Available types: structured-view, mind-map, flowchart, knowledge-graph, executive-dashboard, timeline.
For each recommendation include: type, score (0-1), and rationale (one sentence).
Return as JSON array.`
  },
  kpiExtraction: {
    primary: LLM_PRIMARY,
    fallback: LLM_FALLBACK,
    maxTokens: LLM_MAXTOKENS,
    temperature: 0.1,
    systemPrompt: `Extract key performance indicators (KPIs) from the text.
For each KPI include: label, value (number), unit, trend (up/down/stable if mentioned), and confidence (0-1).
Deduplicate similar metrics. Return as JSON array.`
  },
  glossary: {
    primary: LLM_PRIMARY,
    fallback: LLM_FALLBACK,
    maxTokens: LLM_MAXTOKENS,
    temperature: 0.3,
    systemPrompt: `Extract keywords and acronyms with context-aware definitions.
Analyze the domain and provide definitions appropriate to that context.
Return as JSON array with: term, definition, domain, confidence.`
  },
  qa: {
    primary: LLM_PRIMARY,
    fallback: LLM_FALLBACK,
    maxTokens: LLM_MAXTOKENS,
    temperature: 0.6,
    systemPrompt: 'Answer questions about the document content. Be helpful, accurate, and concise. Cite specific parts of the text when relevant.'
  },
  mindMapGeneration: {
    primary: LLM_PRIMARY,
    fallback: LLM_FALLBACK,
    maxTokens: LLM_MAXTOKENS,
    temperature: 0.4,
    systemPrompt: `Analyze the document and create a hierarchical mind map structure with 3-5 levels of depth.

Create a tree structure where:
- Root node: Main topic/title
- Level 1: Major themes or sections (3-7 nodes)
- Level 2: Key concepts under each theme (2-5 nodes per parent)
- Level 3+: Supporting details (1-3 nodes per parent)

For each node include:
- id: unique identifier
- label: concise title (2-5 words)
- subtitle: 40-character headline providing quick context (6-8 words max)
- icon: single emoji that represents the concept (use concrete visual metaphors)
- summary: brief description (1-2 sentences)
- detailedExplanation: comprehensive explanation (2-4 sentences) for hover tooltip
- sourceTextExcerpt: relevant quote from original text if applicable (optional, 100-200 chars)
- children: array of child nodes
- importance: 0.3-1.0 based on significance

Icon Selection Guidelines:
- Use concrete, recognizable emojis (🎯 📊 🔧 💡 🌐 📈 ⚙️ 🏗️ 📝 🔍)
- Match semantic meaning (security=🔒, data=📊, process=⚙️, goal=🎯)
- Avoid abstract or ambiguous emojis
- Ensure visual distinction between sibling nodes

Return ONLY valid JSON matching this structure:
{
  "nodes": [
    {
      "id": "node-1",
      "label": "Main Topic",
      "subtitle": "Quick context in 40 chars or less",
      "icon": "🎯",
      "summary": "Brief description",
      "detailedExplanation": "Comprehensive explanation with more context and details for users who want to learn more.",
      "sourceTextExcerpt": "Relevant quote from the original document...",
      "children": [
        {
          "id": "node-1-1",
          "label": "Subtopic",
          "subtitle": "Supporting detail context",
          "icon": "📊",
          "summary": "Details",
          "detailedExplanation": "More detailed explanation of this subtopic.",
          "children": [],
          "importance": 0.8
        }
      ],
      "importance": 1.0
    }
  ]
}

    Focus on creating a meaningful hierarchy with clear visual metaphors and progressive disclosure of information.`
  },
  argumentMapGeneration: {
    primary: LLM_PRIMARY,
    fallback: LLM_FALLBACK,
    maxTokens: LLM_MAXTOKENS,
    temperature: 0.3,
    systemPrompt: `Analyze the text to generate an interactive argument map based on the specific schema provided.

The goal is to map the claims, arguments, evidence, and their relationships.

### Node Types
- **claim**: Main assertion or idea
- **argument**: Reason supporting or attacking a claim
- **evidence**: Factual or empirical support
- **counterargument**: Attacks a claim or argument
- **rebuttal**: Attacks a counterargument
- **alternative**: Competing or replacement idea

### Edge Types
- **supports**: Connects argument/evidence to what it supports
- **attacks**: Connects argument/counterargument to what it attacks
- **rebuts**: Specific for rebuttal -> counterargument
- **is-alternative-to**: Connects alternative -> claim
- **depends-on**: logical dependency

### Requirements
- Create a logical hierarchy with the main claim at the top/center.
- Assign polarity (support/attack/neutral) and confidence (0-1).
- Provide a concise summary (1-2 lines) for each node.

Return ONLY valid JSON in this exact format:
{
  "nodes": [
    {
      "id": "node-1",
      "type": "claim",
      "label": "Main Claim",
      "summary": "The central thesis of the text.",
      "polarity": "neutral",
      "confidence": 0.9,
      "impact": "high"
    },
    {
      "id": "node-2",
      "type": "argument",
      "label": "Supporting Argument",
      "summary": "Reason why the claim is true.",
      "polarity": "support",
      "confidence": 0.8,
      "impact": "medium"
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-2",
      "target": "node-1",
      "type": "supports",
      "strength": 0.8,
      "rationale": "Directly supports the main premise."
    }
  ],
  "metadata": {
    "mainClaimId": "node-1",
    "totalClaims": 1,
    "totalEvidence": 0
  }
}`
  },
  'uml-extraction': {
    primary: LLM_PRIMARY,
    fallback: LLM_FALLBACK,
    maxTokens: LLM_MAXTOKENS,
    temperature: 0.3,
    systemPrompt: `You are a UML class diagram extraction expert. Analyze the following technical document and extract object-oriented structures.

Extract the following:

1. **Classes**: Identify classes, interfaces, abstract classes, and enumerations
   - For each class, extract:
     - Name
     - Type (class/interface/abstract/enum)
     - Stereotype (if mentioned: entity, service, controller, repository, etc.)
     - Package/namespace
     - Description (purpose and responsibilities)
     - Attributes (name, type, visibility, static, default value)
     - Methods (name, return type, visibility, static, abstract, parameters)
     - Source quote (representative text from document mentioning this class)

2. **Relationships**: Identify relationships between classes
   - Inheritance (extends, inherits from, is a, subclass of)
   - Interface realization (implements, realizes, conforms to)
   - Composition (contains, owns, composed of - strong lifecycle)
   - Aggregation (has a, includes - weak lifecycle)
   - Association (uses, relates to, connected to)
   - Dependency (depends on, requires)
   - For each relationship, extract:
     - Source and target class names
     - Relationship type
     - Multiplicity (if mentioned: 1, 0..1, 1..*, *, 0..*)
     - Role names (if mentioned)
     - Description
     - Evidence quote from document

3. **Packages**: Group related classes into packages/namespaces

Return as JSON with this structure:
{
  "classes": [
    {
      "name": "ClassName",
      "type": "class|interface|abstract|enum",
      "stereotype": "entity|service|controller|...",
      "package": "com.example.package",
      "description": "Full description of the class",
      "sourceQuote": "Representative quote from document",
      "attributes": [
        {
          "name": "attributeName",
          "type": "String",
          "visibility": "public|private|protected|package",
          "isStatic": false,
          "defaultValue": "optional"
        }
      ],
      "methods": [
        {
          "name": "methodName",
          "returnType": "void",
          "visibility": "public",
          "isStatic": false,
          "isAbstract": false,
          "parameters": [
            { "name": "param1", "type": "String" }
          ]
        }
      ]
    }
  ],
  "relationships": [
    {
      "source": "ClassName1",
      "target": "ClassName2",
      "type": "inheritance|realization|composition|aggregation|association|dependency",
      "sourceMultiplicity": "1",
      "targetMultiplicity": "0..*",
      "sourceRole": "optional",
      "targetRole": "optional",
      "label": "owns",
      "description": "Relationship description",
      "evidence": "Quote showing this relationship"
    }
  ],
  "packages": [
    {
      "name": "com.example.package",
      "classes": ["ClassName1", "ClassName2"]
    }
  ]
}

Extract 5-30 classes based on document complexity. Focus on the most important classes and their relationships.`
  },
  'knowledge-graph-generation': {
    primary: LLM_PRIMARY,
    fallback: LLM_FALLBACK,
    maxTokens: LLM_MAXTOKENS,
    temperature: 0.4,
    systemPrompt: `You are a knowledge graph generation expert. Analyze the document and create a comprehensive knowledge graph visualization.

Extract the following:

1. **Entities**: Identify key entities (people, organizations, concepts, products, technologies, locations, dates, metrics)
   - For each entity, extract:
     - id: unique identifier
     - label: display name
     - type: person|organization|location|concept|product|metric|date|technical
     - size: importance-based size (20-100)
     - color: type-based color
     - metadata: centrality, connections, description, sourceQuote, sourceSpan

2. **Relationships**: Identify meaningful connections between entities
   - For each relationship, extract:
     - id: unique identifier
     - source: source entity id
     - target: target entity id
     - type: relationship type (causes, requires, part-of, relates-to, implements, uses, depends-on, etc.)
     - strength: 0.0-1.0 based on importance
     - label: relationship label
     - evidence: source text excerpt

3. **Clusters**: Group related entities (optional, computed on frontend)
4. **Hierarchy**: Detect parent-child relationships for recursive exploration

Return as JSON with this exact structure:
{
  "nodes": [
    {
      "id": "entity-1",
      "label": "Entity Name",
      "type": "concept",
      "size": 70,
      "color": "#F59E0B",
      "metadata": {
        "centrality": 1.0,
        "connections": 5,
        "description": "Entity description",
        "sourceQuote": "Relevant quote from text",
        "sourceSpan": {
          "start": 0,
          "end": 50,
          "text": "Quote text"
        }
      }
    }
  ],
  "edges": [
    {
      "id": "rel-1",
      "source": "entity-1",
      "target": "entity-2",
      "type": "relates-to",
      "strength": 0.8,
      "label": "relates-to",
      "evidence": [
        {
          "start": 100,
          "end": 150,
          "text": "Evidence text from document"
        }
      ]
    }
  ],
  "clusters": [],
  "hierarchy": {
    "rootNodes": ["entity-1"],
    "maxDepth": 3,
    "nodeDepths": {
      "entity-1": 0,
      "entity-2": 1
    }
  }
}

Extract 10-50 entities and 15-40 relationships based on document complexity. Focus on meaningful connections that reveal the document's knowledge structure.`
  }
};

export function getModelForTask(task: TaskType): ModelConfig {
  return MODEL_CONFIGS[task];
}
