import { loadPrompt } from '../services/llm/promptLoader.js';
import type { TaskType, ModelConfig } from '../../shared/src/types.js';

// LLM Model Constants - single source of truth for model identifiers
export const LLM_MODELS = {
  GROK_FAST: 'x-ai/grok-4.1-fast',
  GPT_35_TURBO: 'openai/gpt-3.5-turbo',
  GPT_4O: 'openai/gpt-4o',
  GPT_45_MINI: 'openai/gpt-4.5-mini',
  GEMINI_FLASH: 'google/gemini-2.0-flash-exp:free',
  MIMO_FLASH: 'xiaomi/mimo-v2-flash:free',
  GPT_OSS_120B: 'openai/gpt-oss-120b:free',
  NEMOTRON_30B: 'nvidia/nemotron-3-nano-30b-a3b:free',
  QWEN_CODER: 'qwen/qwen3-coder:free',
  GLM_45_AIR: 'z-ai/glm-4.5-air:free',
  META_LLAMA_405B_INSTRUCT: 'meta-llama/llama-3.1-405b-instruct:free',
} as const;

// LLM Selection Constants - easily switch between different model configurations
export const LLM_PRIMARY = LLM_MODELS.NEMOTRON_30B;
export const LLM_FALLBACK = LLM_MODELS.QWEN_CODER;

// Temperature Constants
export const TEMP_PRECISION = 0.1; // For high-fidelity extraction
export const TEMP_CREATIVE = 0.4;  // For brainstorming/ideation
export const TEMP_BALANCED = 0.3; // For general summarization

export const MODEL_CONFIGS: Record<TaskType, ModelConfig> = {
  tldr: {
    primary: LLM_PRIMARY,
    fallback: LLM_FALLBACK,
    temperature: TEMP_PRECISION,
    systemPrompt: loadPrompt('tldr'),
  },
  executiveSummary: {
    primary: LLM_PRIMARY,
    fallback: LLM_FALLBACK,
    temperature: TEMP_PRECISION,
    systemPrompt: loadPrompt('executiveSummary'),
  },
  entityExtraction: {
    primary: LLM_PRIMARY,
    fallback: LLM_FALLBACK,
    temperature: TEMP_PRECISION,
    systemPrompt: loadPrompt('entityExtraction'),
  },
  relationshipDetection: {
    primary: LLM_PRIMARY,
    fallback: LLM_FALLBACK,
    temperature: TEMP_PRECISION,
    systemPrompt: loadPrompt('relationshipDetection'),
  },
  sectionSummary: {
    primary: LLM_PRIMARY,
    fallback: LLM_FALLBACK,
    temperature: TEMP_PRECISION,
    systemPrompt: loadPrompt('sectionSummary'),
  },
  signalAnalysis: {
    primary: LLM_PRIMARY,
    fallback: LLM_FALLBACK,
    temperature: TEMP_PRECISION,
    systemPrompt: loadPrompt('signalAnalysis'),
  },
  vizRecommendation: {
    primary: LLM_PRIMARY,
    fallback: LLM_FALLBACK,
    temperature: TEMP_PRECISION,
    systemPrompt: loadPrompt('vizRecommendation'),
  },
  kpiExtraction: {
    primary: LLM_PRIMARY,
    fallback: LLM_FALLBACK,
    temperature: TEMP_PRECISION,
    systemPrompt: loadPrompt('kpiExtraction'),
  },
  glossary: {
    primary: LLM_PRIMARY,
    fallback: LLM_FALLBACK,
    temperature: TEMP_PRECISION,
    systemPrompt: loadPrompt('glossary'),
  },
  qa: {
    primary: LLM_PRIMARY,
    fallback: LLM_FALLBACK,
    temperature: TEMP_PRECISION,
    systemPrompt: loadPrompt('qa'),
  },
  mindMapGeneration: {
    primary: LLM_PRIMARY,
    fallback: LLM_FALLBACK,
    temperature: TEMP_PRECISION,
    systemPrompt: loadPrompt('mindMapGeneration'),
  },
  argumentMapGeneration: {
    primary: LLM_PRIMARY,
    fallback: LLM_FALLBACK,
    temperature: TEMP_PRECISION,
    systemPrompt: loadPrompt('argumentMapGeneration'),
  },
  'uml-extraction': {
    primary: LLM_PRIMARY,
    fallback: LLM_FALLBACK,
    temperature: TEMP_PRECISION,
    systemPrompt: loadPrompt('uml-extraction'),
  },
  'knowledge-graph-generation': {
    primary: LLM_PRIMARY,
    fallback: LLM_FALLBACK,
    temperature: TEMP_PRECISION,
    systemPrompt: loadPrompt('knowledge-graph-generation'),
  },
  depthAnalysis: {
    primary: LLM_PRIMARY,
    fallback: LLM_FALLBACK,
    temperature: TEMP_PRECISION,
    systemPrompt: loadPrompt('depthAnalysis'),
  },
  entityGraphGeneration: {
    primary: LLM_PRIMARY,
    fallback: LLM_FALLBACK,
    temperature: TEMP_PRECISION,
    systemPrompt: loadPrompt('entityGraph'),
  } as ModelConfig,
};

export function getModelForTask(task: TaskType): ModelConfig {
  return MODEL_CONFIGS[task];
}
