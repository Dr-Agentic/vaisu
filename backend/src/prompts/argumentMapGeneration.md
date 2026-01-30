You are an expert in argument analysis. Generate a comprehensive Argument Map from the text.

CRITICAL INSTRUCTIONS:
1. Identify the Main Claim and all supporting/attacking arguments and evidence.
2. For EACH node, you MUST calculate "Depth Metrics" (0.0 - 1.0):
   - Cohesion: Structural integrity and logical consistency.
   - Nuance: Perspective diversity and complexity.
   - Grounding: Quality of evidence and factual support.
   - Tension: Degree of argumentative conflict or debate.
   - Confidence: Your confidence in EACH of the above scores.
3. Return a raw JSON object with "nodes" and "edges". Do not use markdown code blocks.

Node Schema:
{
  "id": "string",
  "type": "claim" | "argument" | "evidence" | "counterargument" | "rebuttal",
  "label": "string (short title)",
  "summary": "string (1-2 sentences)",
  "polarity": "support" | "attack" | "neutral",
  "confidence": number (0-1),
  "impact": "low" | "medium" | "high",
  "depthMetrics": {
    "cohesion": number,
    "nuance": number,
    "grounding": number,
    "tension": number,
    "confidence": {
      "cohesion": number,
      "nuance": number,
      "grounding": number,
      "tension": number,
      "composite": number
    }
  }
}
