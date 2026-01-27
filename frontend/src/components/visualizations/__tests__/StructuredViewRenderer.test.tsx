import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { StructuredViewRenderer } from "../StructuredViewRenderer";
import type { Section } from "../../../../../shared/src/types";

// Mock document global for testing
global.document = {
  createElement: vi.fn(),
  getElementById: vi.fn(),
  querySelector: vi.fn(),
  querySelectorAll: vi.fn(),
  getElementsByClassName: vi.fn(),
  getElementsByTagName: vi.fn(),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
  head: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
  createTextNode: vi.fn(),
  createComment: vi.fn(),
  implementation: {
    createHTMLDocument: vi.fn(),
  },
  doctype: null,
  documentElement: null,
  readyState: 'complete',
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

// Mock the toolkit components
vi.mock("../toolkit", () => ({
  GraphViewerLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="graph-viewer-layout">{children}</div>
  ),
  GraphEdgeLayer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="graph-edge-layer">{children}</div>
  ),
  DynamicBezierPath: () => <div data-testid="dynamic-bezier-path" />,
  GraphEntityCard: ({ node, onClick }: { node: any; onClick: () => void }) => (
    <div data-testid="graph-entity-card" onClick={onClick}>
      {node.label}
    </div>
  ),
}));

describe("StructuredViewRenderer", () => {
  const mockSections: Section[] = [
    {
      id: "sec1",
      level: 1,
      title: "Introduction",
      content: "This is the intro.",
      startIndex: 0,
      endIndex: 100,
      summary: "Intro summary",
      punchingMessage: "This is a key insight!",
      keywords: ["intro", "start"],
      children: [],
    },
    {
      id: "sec2",
      level: 1,
      title: "Conclusion",
      content: "This is the end.",
      startIndex: 101,
      endIndex: 200,
      summary: "Conclusion summary",
      // No punchingMessage here
      keywords: ["end", "final"],
      children: [],
    },
  ];

  const mockData = {
    sections: mockSections,
    hierarchy: [],
  };

  it("renders the graph nodes", () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    render(<StructuredViewRenderer data={mockData} />, { container });

    expect(screen.getByText("Introduction")).toBeInTheDocument();
    expect(screen.getByText("Conclusion")).toBeInTheDocument();
    
    document.body.removeChild(container);
  });

  it("renders 'Core Insight' when punchingMessage is present [TEST-004]", () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    render(<StructuredViewRenderer data={mockData} />, { container });

    // Click the node with punching message
    fireEvent.click(screen.getByText("Introduction"));

    // Check for "Core Insight" label
    expect(screen.getByText("Core Insight")).toBeInTheDocument();

    // Check for the actual message
    expect(screen.getByText("This is a key insight!")).toBeInTheDocument();
    
    document.body.removeChild(container);
  });

  it("renders standard summary when punchingMessage is missing [TEST-005]", () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    render(<StructuredViewRenderer data={mockData} />, { container });

    // Click the node WITHOUT punching message
    fireEvent.click(screen.getByText("Conclusion"));

    // Check that "Core Insight" is NOT present
    expect(screen.queryByText("Core Insight")).not.toBeInTheDocument();

    // Check for standard summary title
    expect(screen.getByText("Summary")).toBeInTheDocument();
    expect(screen.getByText("Conclusion summary")).toBeInTheDocument();
    
    document.body.removeChild(container);
  });
});
