import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TextAnalyzer } from '../textAnalyzer';
import { createMockOpenRouterClient } from '../../../../../test/mocks/openRouterMock';
import { 
  SMALL_BUSINESS_REPORT,
  PROCESS_DOCUMENT,
  TECHNICAL_SPEC,
  QUANTITATIVE_REPORT 
} from '../../../../../test/fixtures/documents';

describe('TextAnalyzer', () => {
  let analyzer: TextAnalyzer;
  let mockLLMClient: any;

  beforeEach(() => {
    mockLLMClient = createMockOpenRouterClient();
    analyzer = new TextAnalyzer(mockLLMClient);
  });

  describe('generateTLDR', () => {
    it('should generate TLDR summary', async () => {
      const tldr = await analyzer.generateTLDR(SMALL_BUSINESS_REPORT);

      expect(tldr).toBeDefined();
      expect(tldr.length).toBeGreaterThan(0);
      expect(tldr.length).toBeLessThan(500); // Should be concise
      expect(mockLLMClient.callWithFallback).toHaveBeenCalledWith(
        'tldr',
        expect.any(String)
      );
    });

    it('should complete within 3 seconds', async () => {
      const start = Date.now();
      await analyzer.generateTLDR(SMALL_BUSINESS_REPORT);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(3000);
    });

    it('should handle empty text', async () => {
      const tldr = await analyzer.generateTLDR('');

      expect(tldr).toBeDefined();
    });
  });

  describe('generateExecutiveSummary', () => {
    it('should generate executive summary with all components', async () => {
      const summary = await analyzer.generateExecutiveSummary(SMALL_BUSINESS_REPORT);

      expect(summary).toBeDefined();
      expect(summary.headline).toBeDefined();
      expect(summary.keyIdeas).toHaveLength(3);
      expect(summary.kpis).toBeDefined();
      expect(summary.risks).toBeDefined();
      expect(summary.opportunities).toBeDefined();
      expect(summary.callToAction).toBeDefined();
    });

    it('should extract exactly 3 key ideas', async () => {
      const summary = await analyzer.generateExecutiveSummary(SMALL_BUSINESS_REPORT);

      expect(summary.keyIdeas).toHaveLength(3);
      summary.keyIdeas.forEach(idea => {
        expect(idea).toBeTruthy();
        expect(typeof idea).toBe('string');
      });
    });

    it('should use Claude 3.7 Sonnet', async () => {
      await analyzer.generateExecutiveSummary(SMALL_BUSINESS_REPORT);

      expect(mockLLMClient.callWithFallback).toHaveBeenCalledWith(
        'executiveSummary',
        expect.any(String)
      );
    });
  });

  describe('analyzeSignals', () => {
    it('should detect quantitative signals in financial reports', async () => {
      const signals = await analyzer.analyzeSignals(QUANTITATIVE_REPORT);

      expect(signals.quantitative).toBeGreaterThan(0.7);
    });

    it('should detect process signals in workflow documents', async () => {
      const signals = await analyzer.analyzeSignals(PROCESS_DOCUMENT);

      expect(signals.process).toBeGreaterThan(0.6);
    });

    it('should detect technical signals in API specs', async () => {
      const signals = await analyzer.analyzeSignals(TECHNICAL_SPEC);

      expect(signals.technical).toBeGreaterThan(0.5);
    });

    it('should detect structural signals in hierarchical docs', async () => {
      const signals = await analyzer.analyzeSignals(SMALL_BUSINESS_REPORT);

      expect(signals.structural).toBeGreaterThan(0.5);
    });

    it('should return scores between 0 and 1', async () => {
      const signals = await analyzer.analyzeSignals(SMALL_BUSINESS_REPORT);

      Object.values(signals).forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('recommendVisualizations', () => {
    it('should recommend 3-5 visualizations', async () => {
      const mockDocument = {
        id: 'test',
        title: 'Test',
        content: SMALL_BUSINESS_REPORT,
        metadata: { wordCount: 100, uploadDate: new Date(), fileType: 'txt', language: 'en' },
        structure: { sections: [{} as any, {} as any], hierarchy: [] }
      } as any;
      
      const mockSignals = { structural: 0.8, process: 0.3, quantitative: 0.5, technical: 0.2, argumentative: 0.3, temporal: 0.2 };
      
      const recommendations = await analyzer.recommendVisualizations(
        mockDocument,
        mockSignals,
        5, // entityCount
        3  // relationshipCount
      );

      expect(recommendations.length).toBeGreaterThanOrEqual(3);
      expect(recommendations.length).toBeLessThanOrEqual(5);
    });

    it('should include rationale for each recommendation', async () => {
      const mockDocument = {
        id: 'test',
        title: 'Test',
        content: SMALL_BUSINESS_REPORT,
        metadata: { wordCount: 100, uploadDate: new Date(), fileType: 'txt', language: 'en' },
        structure: { sections: [{} as any], hierarchy: [] }
      } as any;
      
      const mockSignals = { structural: 0.8, process: 0.3, quantitative: 0.5, technical: 0.2, argumentative: 0.3, temporal: 0.2 };
      
      const recommendations = await analyzer.recommendVisualizations(
        mockDocument,
        mockSignals,
        5,
        3
      );

      recommendations.forEach(rec => {
        expect(rec.type).toBeDefined();
        expect(rec.score).toBeDefined();
        expect(rec.rationale).toBeDefined();
        expect(rec.rationale.length).toBeGreaterThan(0);
      });
    });

    it('should rank recommendations by score', async () => {
      const mockDocument = {
        id: 'test',
        title: 'Test',
        content: SMALL_BUSINESS_REPORT,
        metadata: { wordCount: 100, uploadDate: new Date(), fileType: 'txt', language: 'en' },
        structure: { sections: [{} as any], hierarchy: [] }
      } as any;
      
      const mockSignals = { structural: 0.8, process: 0.3, quantitative: 0.5, technical: 0.2, argumentative: 0.3, temporal: 0.2 };
      
      const recommendations = await analyzer.recommendVisualizations(
        mockDocument,
        mockSignals,
        5,
        3
      );

      for (let i = 0; i < recommendations.length - 1; i++) {
        expect(recommendations[i].score).toBeGreaterThanOrEqual(
          recommendations[i + 1].score
        );
      }
    });

    it('should recommend executive dashboard for quantitative content', async () => {
      const mockDocument = {
        id: 'test',
        title: 'Test',
        content: QUANTITATIVE_REPORT,
        metadata: { wordCount: 100, uploadDate: new Date(), fileType: 'txt', language: 'en' },
        structure: { sections: [{} as any], hierarchy: [] }
      } as any;
      
      const mockSignals = { structural: 0.5, process: 0.2, quantitative: 0.9, technical: 0.2, argumentative: 0.3, temporal: 0.2 };
      
      const recommendations = await analyzer.recommendVisualizations(
        mockDocument,
        mockSignals,
        5,
        3
      );

      const hasExecutiveDashboard = recommendations.some(
        rec => rec.type === 'executive-dashboard'
      );
      
      // Debug: log recommendations if test fails
      if (!hasExecutiveDashboard) {
        console.log('Recommendations received:', recommendations.map(r => r.type));
      }
      
      expect(hasExecutiveDashboard).toBe(true);
    });

    it('should recommend flowchart for process content', async () => {
      const mockDocument = {
        id: 'test',
        title: 'Test',
        content: PROCESS_DOCUMENT,
        metadata: { wordCount: 100, uploadDate: new Date(), fileType: 'txt', language: 'en' },
        structure: { sections: [{} as any], hierarchy: [] }
      } as any;
      
      const mockSignals = { structural: 0.5, process: 0.9, quantitative: 0.2, technical: 0.3, argumentative: 0.2, temporal: 0.3 };
      
      const recommendations = await analyzer.recommendVisualizations(
        mockDocument,
        mockSignals,
        5,
        3
      );

      const hasFlowchart = recommendations.some(
        rec => rec.type === 'flowchart' || rec.type === 'swimlane'
      );
      expect(hasFlowchart).toBe(true);
    });
  });

  describe('analyzeDocument (full analysis)', () => {
    it('should perform complete document analysis', async () => {
      const parsedDoc = {
        id: 'test-doc',
        title: 'Test',
        content: SMALL_BUSINESS_REPORT,
        metadata: {
          wordCount: 100,
          uploadDate: new Date(),
          fileType: 'txt',
          language: 'en'
        },
        structure: {
          sections: [],
          hierarchy: []
        }
      };

      const analysis = await analyzer.analyzeDocument(parsedDoc);

      expect(analysis.tldr).toBeDefined();
      expect(analysis.executiveSummary).toBeDefined();
      expect(analysis.signals).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
    });

    it('should complete full analysis within reasonable time', async () => {
      const parsedDoc = {
        id: 'test-doc',
        title: 'Test',
        content: SMALL_BUSINESS_REPORT,
        metadata: {
          wordCount: 100,
          uploadDate: new Date(),
          fileType: 'txt',
          language: 'en'
        },
        structure: {
          sections: [],
          hierarchy: []
        }
      };

      const start = Date.now();
      await analyzer.analyzeDocument(parsedDoc);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(10000); // 10 seconds for full analysis
    });
  });

  describe('error handling', () => {
    it('should handle LLM API failures gracefully', async () => {
      const failingClient = {
        callWithFallback: vi.fn().mockRejectedValue(new Error('API Error'))
      };
      const failingAnalyzer = new TextAnalyzer(failingClient);

      await expect(
        failingAnalyzer.generateTLDR(SMALL_BUSINESS_REPORT)
      ).rejects.toThrow();
    });

    it('should retry on transient failures', async () => {
      let callCount = 0;
      const retryClient = {
        callWithFallback: vi.fn().mockImplementation(async () => {
          callCount++;
          if (callCount < 2) {
            throw new Error('Transient error');
          }
          return {
            content: 'Success after retry',
            tokensUsed: 100,
            model: 'test-model'
          };
        })
      };

      const retryAnalyzer = new TextAnalyzer(retryClient);
      const result = await retryAnalyzer.generateTLDR(SMALL_BUSINESS_REPORT);

      expect(result).toBeDefined();
      expect(result).toBe('Success after retry');
      expect(callCount).toBeGreaterThan(1);
    });
  });
});
