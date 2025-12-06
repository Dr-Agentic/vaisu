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
    systemPrompt: `Extract named entities from the text and return as JSON array.
For each entity include: text, type (person/organization/location/concept/product/metric/date/technical), importance (0-1), and context.
Return only valid JSON.`
  },
  relationshipDetection: {
    primary: 'x-ai/grok-4.1-fast',
    fallback: 'openai/gpt-3.5-turbo',
    maxTokens: 2000,
    temperature: 0.3,
    systemPrompt: `Analyze relationships between entities in the text.
For each relationship include: source entity, target entity, type (causes/requires/part-of/relates-to/implements/uses/depends-on), and strength (0-1).
Return as JSON array.`
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
Available types: structured-view, mind-map, flowchart, knowledge-graph, uml-class, uml-sequence, uml-activity, executive-dashboard, timeline, gantt, comparison-matrix, priority-matrix, raci-matrix.
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
  }
};

export function getModelForTask(task: TaskType): ModelConfig {
  return MODEL_CONFIGS[task];
}
