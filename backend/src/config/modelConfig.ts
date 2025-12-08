import type { TaskType, ModelConfig } from '../../../shared/src/types.js';

export const MODEL_CONFIGS: Record<TaskType, ModelConfig> = {
  tldr: {
    primary: 'x-ai/grok-4.1-fast',
    fallback: 'openai/gpt-3.5-turbo',
    maxTokens: 500,
    temperature: 0.3,
    systemPrompt: 'Generate a concise TLDR summary of the following text. Focus on the main point in 2-3 sentences maximum. Be clear and direct.'
  },
  executiveSummary: {
    primary: 'x-ai/grok-4.1-fast',
    fallback: 'openai/gpt-3.5-turbo',
    maxTokens: 1500,
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
    primary: 'x-ai/grok-4.1-fast',
    fallback: 'openai/gpt-3.5-turbo',
    maxTokens: 2000,
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
    primary: 'x-ai/grok-4.1-fast',
    fallback: 'openai/gpt-3.5-turbo',
    maxTokens: 2000,
    temperature: 0.3,
    systemPrompt: `Analyze relationships between the provided entities based on the text.

For each relationship provide:
- id: unique identifier (e.g., "rel-1", "rel-2")
- source: ID of source entity
- target: ID of target entity  
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

Extract at least 5-20 relationships if entities are connected. Focus on meaningful connections.`
  },
  sectionSummary: {
    primary: 'x-ai/grok-4.1-fast',
    fallback: 'openai/gpt-3.5-turbo',
    maxTokens: 300,
    temperature: 0.3,
    systemPrompt: 'Summarize this section in 2-3 sentences. Extract key highlights and important keywords. Be concise and informative.'
  },
  signalAnalysis: {
    primary: 'x-ai/grok-4.1-fast',
    fallback: 'openai/gpt-3.5-turbo',
    maxTokens: 500,
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
    primary: 'x-ai/grok-4.1-fast',
    fallback: 'openai/gpt-3.5-turbo',
    maxTokens: 1000,
    temperature: 0.4,
    systemPrompt: `Recommend the top 3-5 most appropriate visualizations for this document.
Available types: structured-view, mind-map, flowchart, knowledge-graph, executive-dashboard, timeline.
For each recommendation include: type, score (0-1), and rationale (one sentence).
Return as JSON array.`
  },
  kpiExtraction: {
    primary: 'x-ai/grok-4.1-fast',
    fallback: 'openai/gpt-3.5-turbo',
    maxTokens: 1000,
    temperature: 0.1,
    systemPrompt: `Extract key performance indicators (KPIs) from the text.
For each KPI include: label, value (number), unit, trend (up/down/stable if mentioned), and confidence (0-1).
Deduplicate similar metrics. Return as JSON array.`
  },
  glossary: {
    primary: 'x-ai/grok-4.1-fast',
    fallback: 'openai/gpt-3.5-turbo',
    maxTokens: 2000,
    temperature: 0.3,
    systemPrompt: `Extract keywords and acronyms with context-aware definitions.
Analyze the domain and provide definitions appropriate to that context.
Return as JSON array with: term, definition, domain, confidence.`
  },
  qa: {
    primary: 'x-ai/grok-4.1-fast',
    fallback: 'openai/gpt-3.5-turbo',
    maxTokens: 800,
    temperature: 0.6,
    systemPrompt: 'Answer questions about the document content. Be helpful, accurate, and concise. Cite specific parts of the text when relevant.'
  },
  mindMapGeneration: {
    primary: 'x-ai/grok-4.1-fast',
    fallback: 'openai/gpt-3.5-turbo',
    maxTokens: 3000,
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
  }
};

export function getModelForTask(task: TaskType): ModelConfig {
  return MODEL_CONFIGS[task];
}
