import { vi } from 'vitest';

/**
 * Mock responses for OpenRouter API calls
 */
export const mockOpenRouterResponses = {
  tldr: {
    id: 'gen-123',
    model: 'anthropic/claude-3.7-haiku',
    choices: [{
      message: {
        role: 'assistant',
        content: 'This is a test TLDR summary of the document. It captures the main points concisely in 2-3 sentences.'
      },
      finish_reason: 'stop'
    }],
    usage: {
      prompt_tokens: 500,
      completion_tokens: 50,
      total_tokens: 550
    }
  },
  
  executiveSummary: {
    id: 'gen-124',
    model: 'anthropic/claude-3.7-sonnet',
    choices: [{
      message: {
        role: 'assistant',
        content: JSON.stringify({
          headline: 'Strong Q4 Performance with 15% Revenue Growth',
          keyIdeas: [
            'Revenue increased by 15% to $2.5M',
            'Customer acquisition cost decreased by 20%',
            'Market expansion opportunities identified'
          ],
          kpis: [
            { label: 'Revenue', value: 2500000, unit: 'USD', trend: 'up' },
            { label: 'Growth', value: 15, unit: '%', trend: 'up' },
            { label: 'CAC', value: 150, unit: 'USD', trend: 'down' }
          ],
          risks: [
            'Increasing market competition',
            'Supply chain delays',
            'Customer churn at 3%'
          ],
          opportunities: [
            'New market expansion',
            'Product line extension',
            'Strategic partnerships'
          ],
          callToAction: 'Focus on market expansion while optimizing operations'
        })
      },
      finish_reason: 'stop'
    }],
    usage: {
      prompt_tokens: 800,
      completion_tokens: 200,
      total_tokens: 1000
    }
  },
  
  entityExtraction: {
    id: 'gen-125',
    model: 'openai/gpt-4.5-mini',
    choices: [{
      message: {
        role: 'assistant',
        content: JSON.stringify({
          entities: [
            { text: 'Q4', type: 'temporal', importance: 0.8 },
            { text: 'Revenue', type: 'metric', importance: 0.9 },
            { text: '$2.5M', type: 'numeric', importance: 0.9 },
            { text: 'Customer acquisition cost', type: 'metric', importance: 0.7 }
          ]
        })
      },
      finish_reason: 'stop'
    }],
    usage: {
      prompt_tokens: 600,
      completion_tokens: 100,
      total_tokens: 700
    }
  },
  
  signalAnalysis: {
    id: 'gen-126',
    model: 'openai/gpt-4.5-mini',
    choices: [{
      message: {
        role: 'assistant',
        content: JSON.stringify({
          structural: 0.8,
          process: 0.3,
          quantitative: 0.9,
          technical: 0.2,
          argumentative: 0.4,
          temporal: 0.6
        })
      },
      finish_reason: 'stop'
    }],
    usage: {
      prompt_tokens: 500,
      completion_tokens: 50,
      total_tokens: 550
    }
  },
  
  visualizationRecommendations: {
    id: 'gen-127',
    model: 'anthropic/claude-3.7-sonnet',
    choices: [{
      message: {
        role: 'assistant',
        content: JSON.stringify({
          recommendations: [
            {
              type: 'executive-dashboard',
              score: 0.95,
              rationale: 'High quantitative signal detected (0.9). Document contains 8 numeric metrics and KPIs.'
            },
            {
              type: 'structured-view',
              score: 0.85,
              rationale: 'Clear hierarchical structure with 4 main sections and subsections.'
            },
            {
              type: 'waterfall-chart',
              score: 0.75,
              rationale: 'Sequential financial data showing progression from Q1 to Q4.'
            }
          ]
        })
      },
      finish_reason: 'stop'
    }],
    usage: {
      prompt_tokens: 1000,
      completion_tokens: 150,
      total_tokens: 1150
    }
  },
  
  sectionSummaries: {
    id: 'gen-128',
    model: 'anthropic/claude-3.7-haiku',
    choices: [{
      message: {
        role: 'assistant',
        content: JSON.stringify([
          {
            sectionId: 'section-1',
            summary: 'Executive summary highlighting 15% revenue growth and improved customer metrics.',
            keywords: ['revenue', 'growth', 'CAC']
          },
          {
            sectionId: 'section-2',
            summary: 'Key performance metrics showing strong financial performance.',
            keywords: ['metrics', 'KPI', 'performance']
          }
        ])
      },
      finish_reason: 'stop'
    }],
    usage: {
      prompt_tokens: 700,
      completion_tokens: 120,
      total_tokens: 820
    }
  }
};

/**
 * Create a mock OpenRouter client
 */
export function createMockOpenRouterClient() {
  return {
    call: vi.fn().mockImplementation(async (config: any) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Return appropriate mock based on prompt content
      if (config.messages[0].content.includes('TLDR')) {
        return mockOpenRouterResponses.tldr;
      } else if (config.messages[0].content.includes('executive summary')) {
        return mockOpenRouterResponses.executiveSummary;
      } else if (config.messages[0].content.includes('entities')) {
        return mockOpenRouterResponses.entityExtraction;
      } else if (config.messages[0].content.includes('signal')) {
        return mockOpenRouterResponses.signalAnalysis;
      } else if (config.messages[0].content.includes('visualizations')) {
        return mockOpenRouterResponses.visualizationRecommendations;
      } else if (config.messages[0].content.includes('summarize')) {
        return mockOpenRouterResponses.sectionSummaries;
      }
      
      // Default response
      return mockOpenRouterResponses.tldr;
    }),
    
    callWithFallback: vi.fn().mockImplementation(async (task: string, prompt: string) => {
      await new Promise(resolve => setTimeout(resolve, 10));
      
      switch (task) {
        case 'tldr':
          return mockOpenRouterResponses.tldr;
        case 'executiveSummary':
          return mockOpenRouterResponses.executiveSummary;
        case 'entityExtraction':
          return mockOpenRouterResponses.entityExtraction;
        case 'signalAnalysis':
          return mockOpenRouterResponses.signalAnalysis;
        case 'visualizationRecommendations':
          return mockOpenRouterResponses.visualizationRecommendations;
        default:
          return mockOpenRouterResponses.tldr;
      }
    })
  };
}

/**
 * Mock for testing API failures
 */
export function createFailingMockOpenRouterClient() {
  return {
    call: vi.fn().mockRejectedValue(new Error('OpenRouter API Error: Rate limit exceeded')),
    callWithFallback: vi.fn().mockRejectedValue(new Error('All models failed'))
  };
}

/**
 * Mock for testing slow responses
 */
export function createSlowMockOpenRouterClient() {
  return {
    call: vi.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 5000));
      return mockOpenRouterResponses.tldr;
    }),
    callWithFallback: vi.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 5000));
      return mockOpenRouterResponses.tldr;
    })
  };
}
