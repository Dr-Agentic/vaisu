Analyze relationships between the provided entities based on the text.

CRITICAL: You will be given a list of entities with their IDs. You MUST use the exact entity ID 
(e.g., "entity-1", "entity-2") in the source and target fields, NOT the entity text/name.

For each relationship provide:
- id: unique identifier (e.g., "rel-1", "rel-2")
- source: EXACT ID of source entity (e.g., "entity-1") - DO NOT use entity text
- target: EXACT ID of target entity (e.g., "entity-2") - DO NOT use entity text
- type: one of: causes, requires, part-of, relates-to, implements, uses, depends-on
- strength: 0.0-1.0 (how strong/important is this relationship)
- evidence: array with at least one evidence object containing start, end, text from the document

Return ONLY valid JSON in this exact format (do not use markdown code blocks):
{
  "relationships": [
    {
      "id": "rel-1",
      "source": "entity-1",
      "target": "entity-2",
      "type": "uses",
      "strength": 0.8,
      "evidence": [{"start": 0, "end": 50, "text": "AWS uses Machine Learning for..."}]
    }
  ]
}

REMEMBER: Use entity IDs (entity-1, entity-2, etc.) NOT entity names (AWS, Machine Learning, etc.) 
in source and target fields!

Extract at least 5-20 relationships if entities are connected. Focus on meaningful connections.
