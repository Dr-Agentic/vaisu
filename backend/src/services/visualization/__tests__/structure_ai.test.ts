import { describe, it, expect, vi, beforeEach } from "vitest";
import { visualizationGenerator } from "../visualizationGenerator.js";
import { Document } from "../../../../shared/src/types.js";

// Mock dependencies
const mockCallWithFallback = vi.fn();
const mockParseJSONResponse = vi.fn();

vi.mock("../../llm/openRouterClient.js", () => ({
  getOpenRouterClient: () => ({
    callWithFallback: mockCallWithFallback,
    parseJSONResponse: mockParseJSONResponse,
  }),
}));

describe("Structured View AI Generation", () => {
  const mockDocument: Document = {
    id: "doc-1",
    title: "Test Document",
    content: "Section 1\nContent 1\nSection 1.1\nContent 1.1",
    metadata: {} as any,
    structure: {
      sections: [
        {
          id: "orig-1",
          title: "Original",
          level: 1,
          content: "",
          children: [],
          summary: "",
          keywords: [],
          startIndex: 0,
          endIndex: 10,
        },
      ],
      hierarchy: [],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully generate structured view from LLM response", async () => {
    // Mock LLM response
    const mockFlatSections = [
      {
        title: "Section 1",
        level: 1,
        summary: "Sum 1",
        punching_message: "Punch 1",
      },
      {
        title: "Section 1.1",
        level: 2,
        summary: "Sum 1.1",
        punching_message: "Punch 1.1",
      },
    ];

    mockCallWithFallback.mockResolvedValue('{"some": "json"}');
    mockParseJSONResponse.mockReturnValue(mockFlatSections);

    const result = await visualizationGenerator.generateVisualization(
      "structured-view",
      mockDocument,
      {} as any,
    );

    expect(result.type).toBe("structured-view");
    expect(result.sections).toHaveLength(1); // One root
    expect(result.sections[0].title).toBe("Section 1");
    expect(result.sections[0].children).toHaveLength(1);
    expect(result.sections[0].children[0].title).toBe("Section 1.1");
    expect(result.sections[0].punchingMessage).toBe("Punch 1");

    // Check hierarchy
    expect(result.hierarchy).toHaveLength(1);
    expect(result.hierarchy[0].children).toHaveLength(1);
  });

  it("should fallback to existing structure on LLM failure", async () => {
    mockCallWithFallback.mockRejectedValue(new Error("API Error"));

    const result = await visualizationGenerator.generateVisualization(
      "structured-view",
      mockDocument,
      {} as any,
    );

    expect(result.type).toBe("structured-view");
    expect(result.sections[0].title).toBe("Original"); // Fallback
  });

  it("should correctly reconstruct complex hierarchy", async () => {
    // Manually test the private method logic via public interface
    const mockFlatSections = [
      { title: "Root 1", level: 1, summary: "", punching_message: "" },
      { title: "Child 1.1", level: 2, summary: "", punching_message: "" },
      { title: "Child 1.2", level: 2, summary: "", punching_message: "" },
      {
        title: "Grandchild 1.2.1",
        level: 3,
        summary: "",
        punching_message: "",
      },
      { title: "Root 2", level: 1, summary: "", punching_message: "" },
    ];

    mockCallWithFallback.mockResolvedValue("{}");
    mockParseJSONResponse.mockReturnValue(mockFlatSections);

    const result = await visualizationGenerator.generateVisualization(
      "structured-view",
      mockDocument,
      {} as any,
    );

    expect(result.sections).toHaveLength(2); // Root 1, Root 2
    expect(result.sections[0].children).toHaveLength(2); // Child 1.1, Child 1.2
    expect(result.sections[0].children[1].children).toHaveLength(1); // Grandchild 1.2.1
  });
});
