import { vi } from 'vitest';

/**
 * Mock responses for OpenRouter API calls
 */
export const mockOpenRouterResponses = {
  tldr: {
    id: 'gen-123',
    model: 'x-ai/grok-4.1-fast',
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
    model: 'x-ai/grok-4.1-fast',
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

  relationshipDetection: {
    id: 'gen-129',
    model: 'openai/gpt-4.5-mini',
    choices: [{
      message: {
        role: 'assistant',
        content: JSON.stringify({
          relationships: [
            { source: 'Revenue', target: '$2.5M', type: 'has-value' },
            { source: 'Q4', target: 'Revenue', type: 'temporal' }
          ]
        })
      },
      finish_reason: 'stop'
    }],
    usage: {
      prompt_tokens: 600,
      completion_tokens: 80,
      total_tokens: 680
    }
  },

  sectionSummary: {
    id: 'gen-130',
    model: 'x-ai/grok-4.1-fast',
    choices: [{
      message: {
        role: 'assistant',
        content: 'This section discusses key metrics and performance indicators.'
      },
      finish_reason: 'stop'
    }],
    usage: {
      prompt_tokens: 400,
      completion_tokens: 30,
      total_tokens: 430
    }
  },

  visualizationRecommendations: {
    id: 'gen-127',
    model: 'x-ai/grok-4.1-fast',
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
    model: 'x-ai/grok-4.1-fast',
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
 * Create a mock OpenRouter client that returns simplified responses
 * matching the format returned by the real OpenRouterClient
 */
export function createMockOpenRouterClient() {
  return {
    call: vi.fn().mockImplementation(async (config: any) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 10));

      // Return simplified format matching real OpenRouterClient
      const rawResponse = mockOpenRouterResponses.tldr;
      return {
        content: rawResponse.choices[0].message.content,
        tokensUsed: rawResponse.usage.total_tokens,
        model: rawResponse.model
      };
    }),

    callWithFallback: vi.fn().mockImplementation(async (task: string, prompt: string) => {
      await new Promise(resolve => setTimeout(resolve, 10));

      let rawResponse;
      switch (task) {
        case 'tldr':
          rawResponse = mockOpenRouterResponses.tldr;
          break;
        case 'executiveSummary':
          rawResponse = mockOpenRouterResponses.executiveSummary;
          break;
        case 'entityExtraction':
          rawResponse = mockOpenRouterResponses.entityExtraction;
          break;
        case 'signalAnalysis':
          // Detect document type from prompt content
          let signals = {
            structural: 0.8,
            process: 0.3,
            quantitative: 0.9,
            technical: 0.2,
            argumentative: 0.4,
            temporal: 0.6
          };

          if (prompt.toLowerCase().includes('workflow') ||
            prompt.toLowerCase().includes('process') ||
            prompt.toLowerCase().includes('step') ||
            prompt.toLowerCase().includes('procedure')) {
            signals = {
              structural: 0.6,
              process: 0.85,
              quantitative: 0.3,
              technical: 0.4,
              argumentative: 0.2,
              temporal: 0.7
            };
          } else if (prompt.toLowerCase().includes('api') ||
            prompt.toLowerCase().includes('endpoint') ||
            prompt.toLowerCase().includes('technical') ||
            prompt.toLowerCase().includes('specification')) {
            signals = {
              structural: 0.7,
              process: 0.4,
              quantitative: 0.3,
              technical: 0.85,
              argumentative: 0.2,
              temporal: 0.3
            };
          }

          rawResponse = {
            ...mockOpenRouterResponses.signalAnalysis,
            choices: [{
              ...mockOpenRouterResponses.signalAnalysis.choices[0],
              message: {
                ...mockOpenRouterResponses.signalAnalysis.choices[0].message,
                content: JSON.stringify(signals)
              }
            }]
          };
          break;
        case 'relationshipDetection':
          rawResponse = mockOpenRouterResponses.relationshipDetection;
          break;
        case 'sectionSummary':
          rawResponse = mockOpenRouterResponses.sectionSummary;
          break;
        case 'vizRecommendation':
          // Return more recommendations based on content and signals
          let recommendations = [
            {
              type: 'executive-dashboard',
              score: 0.95,
              rationale: 'High quantitative signal detected. Document contains numeric metrics and KPIs.'
            },
            {
              type: 'structured-view',
              score: 0.85,
              rationale: 'Clear hierarchical structure with main sections and subsections.'
            },
            {
              type: 'waterfall-chart',
              score: 0.75,
              rationale: 'Sequential data showing progression over time.'
            },
            {
              type: 'mind-map',
              score: 0.70,
              rationale: 'Good for visualizing relationships between concepts.'
            }
          ];

          // Check signals in the prompt
          const signalsMatch = prompt.match(/"quantitative":\s*([\d.]+)/);
          const quantitativeSignal = signalsMatch ? parseFloat(signalsMatch[1]) : 0;

          const processMatch = prompt.match(/"process":\s*([\d.]+)/);
          const processSignal = processMatch ? parseFloat(processMatch[1]) : 0;

          // Adjust based on signals (prioritize signal values over content keywords)
          if (processSignal > 0.6) {
            recommendations = [
              {
                type: 'flowchart',
                score: 0.95,
                rationale: 'High process signal detected. Document describes sequential workflow.'
              },
              {
                type: 'swimlane',
                score: 0.85,
                rationale: 'Multiple actors and process steps identified.'
              },
              {
                type: 'structured-view',
                score: 0.80,
                rationale: 'Clear hierarchical structure.'
              },
              {
                type: 'timeline',
                score: 0.70,
                rationale: 'Temporal progression in the process.'
              }
            ];
          } else if (quantitativeSignal < 0.5) {
            // Low quantitative signal - don't recommend dashboard
            recommendations = [
              {
                type: 'structured-view',
                score: 0.90,
                rationale: 'Clear hierarchical structure with main sections and subsections.'
              },
              {
                type: 'mind-map',
                score: 0.85,
                rationale: 'Good for visualizing relationships between concepts.'
              },
              {
                type: 'knowledge-graph',
                score: 0.75,
                rationale: 'Shows connections between entities.'
              }
            ];
          }

          rawResponse = {
            ...mockOpenRouterResponses.visualizationRecommendations,
            choices: [{
              ...mockOpenRouterResponses.visualizationRecommendations.choices[0],
              message: {
                ...mockOpenRouterResponses.visualizationRecommendations.choices[0].message,
                content: JSON.stringify({ recommendations })
              }
            }]
          };
          break;
        default:
          rawResponse = mockOpenRouterResponses.tldr;
      }

      // Return simplified format matching real OpenRouterClient
      return {
        content: rawResponse.choices[0].message.content,
        tokensUsed: rawResponse.usage.total_tokens,
        model: rawResponse.model
      };
    }),

    parseJSONResponse: vi.fn().mockImplementation(async (response: any) => {
      return JSON.parse(response.content);
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
