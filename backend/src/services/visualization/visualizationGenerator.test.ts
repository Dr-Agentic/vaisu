import { describe, it, expect, vi, beforeEach } from "vitest";
import { visualizationGenerator } from "./visualizationGenerator.js";

// Mock dependencies
const mockCallWithFallback = vi.fn();
const mockParseJSONResponse = vi.fn();
const mockGetOpenRouterClient = vi.fn(() => ({
  callWithFallback: mockCallWithFallback,
  parseJSONResponse: mockParseJSONResponse,
}));

vi.mock("../llm/openRouterClient.js", () => ({
  getOpenRouterClient: mockGetOpenRouterClient,
}));

vi.mock("../../repositories/visualizationService.js", () => ({
  visualizationService: {
    findByDocumentIdAndType: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue(true),
  },
}));

// Mock document
const mockDocument = {
  id: "doc-123",
  title: "Test Document",
  content: "Some content...",
  structure: {
    sections: [
      { id: "orig-1", title: "Original", level: 1, content: "", children: [] },
    ],
    hierarchy: [],
  },
};

describe("VisualizationGenerator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateStructuredView", () => {
    it("should reconstruct hierarchy correctly from LLM response [TEST-001] [TEST-003]", async () => {
      // Mock LLM response
      const flatSections = [
        {
          title: "Root",
          level: 1,
          summary: "Root summary",
          punching_message: "Root punch",
        },
        {
          title: "Child 1",
          level: 2,
          summary: "Child 1 summary",
          punching_message: "Child 1 punch",
        },
        {
          title: "Child 1.1",
          level: 3,
          summary: "Child 1.1 summary",
          punching_message: "Child 1.1 punch",
        },
        {
          title: "Child 2",
          level: 2,
          summary: "Child 2 summary",
          punching_message: "Child 2 punch",
        },
      ];

      mockCallWithFallback.mockResolvedValue({
        content: JSON.stringify(flatSections),
      });
      mockParseJSONResponse.mockReturnValue(flatSections);

      const result = await visualizationGenerator.generateVisualization(
        "structured-view",
        mockDocument as any,
        {} as any,
        true, // force regeneration
      );

      expect(result.type).toBe("structured-view");
      expect(result.sections).toHaveLength(1); // One root
      expect(result.sections[0].title).toBe("Root");
      expect(result.sections[0].punchingMessage).toBe("Root punch");
      expect(result.sections[0].children).toHaveLength(2); // Child 1, Child 2
      expect(result.sections[0].children[0].title).toBe("Child 1");
      expect(result.sections[0].children[0].children).toHaveLength(1); // Child 1.1
      expect(result.sections[0].children[0].children[0].title).toBe(
        "Child 1.1",
      );
    });

    it("should fallback to regex parser on error [TEST-002]", async () => {
      mockCallWithFallback.mockRejectedValue(new Error("LLM Error"));

      const result = await visualizationGenerator.generateVisualization(
        "structured-view",
        mockDocument as any,
        {} as any,
        true,
      );

      expect(result.type).toBe("structured-view");
      expect(result.sections).toEqual(mockDocument.structure.sections);
    });
  });
});
