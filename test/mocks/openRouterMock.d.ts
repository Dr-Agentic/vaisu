/**
 * Mock responses for OpenRouter API calls
 */
export declare const mockOpenRouterResponses: {
    tldr: {
        id: string;
        model: string;
        choices: {
            message: {
                role: string;
                content: string;
            };
            finish_reason: string;
        }[];
        usage: {
            prompt_tokens: number;
            completion_tokens: number;
            total_tokens: number;
        };
    };
    executiveSummary: {
        id: string;
        model: string;
        choices: {
            message: {
                role: string;
                content: string;
            };
            finish_reason: string;
        }[];
        usage: {
            prompt_tokens: number;
            completion_tokens: number;
            total_tokens: number;
        };
    };
    entityExtraction: {
        id: string;
        model: string;
        choices: {
            message: {
                role: string;
                content: string;
            };
            finish_reason: string;
        }[];
        usage: {
            prompt_tokens: number;
            completion_tokens: number;
            total_tokens: number;
        };
    };
    signalAnalysis: {
        id: string;
        model: string;
        choices: {
            message: {
                role: string;
                content: string;
            };
            finish_reason: string;
        }[];
        usage: {
            prompt_tokens: number;
            completion_tokens: number;
            total_tokens: number;
        };
    };
    relationshipDetection: {
        id: string;
        model: string;
        choices: {
            message: {
                role: string;
                content: string;
            };
            finish_reason: string;
        }[];
        usage: {
            prompt_tokens: number;
            completion_tokens: number;
            total_tokens: number;
        };
    };
    sectionSummary: {
        id: string;
        model: string;
        choices: {
            message: {
                role: string;
                content: string;
            };
            finish_reason: string;
        }[];
        usage: {
            prompt_tokens: number;
            completion_tokens: number;
            total_tokens: number;
        };
    };
    visualizationRecommendations: {
        id: string;
        model: string;
        choices: {
            message: {
                role: string;
                content: string;
            };
            finish_reason: string;
        }[];
        usage: {
            prompt_tokens: number;
            completion_tokens: number;
            total_tokens: number;
        };
    };
    sectionSummaries: {
        id: string;
        model: string;
        choices: {
            message: {
                role: string;
                content: string;
            };
            finish_reason: string;
        }[];
        usage: {
            prompt_tokens: number;
            completion_tokens: number;
            total_tokens: number;
        };
    };
};
/**
 * Create a mock OpenRouter client that returns simplified responses
 * matching the format returned by the real OpenRouterClient
 */
export declare function createMockOpenRouterClient(): {
    call: import("vitest").Mock<any, any>;
    callWithFallback: import("vitest").Mock<any, any>;
    parseJSONResponse: import("vitest").Mock<any, any>;
};
/**
 * Mock for testing API failures
 */
export declare function createFailingMockOpenRouterClient(): {
    call: import("vitest").Mock<any, any>;
    callWithFallback: import("vitest").Mock<any, any>;
};
/**
 * Mock for testing slow responses
 */
export declare function createSlowMockOpenRouterClient(): {
    call: import("vitest").Mock<any, any>;
    callWithFallback: import("vitest").Mock<any, any>;
};
//# sourceMappingURL=openRouterMock.d.ts.map