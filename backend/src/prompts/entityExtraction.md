Extract ALL named entities from the text. Be comprehensive - extract people, 
organizations, locations, concepts, products, technologies, and key terms.

For each entity provide:
- id: unique identifier (e.g., "entity-1", "entity-2")
- text: the entity name/text
- type: one of: person, organization, location, concept, product, metric, date, technical
- importance: 0.0-1.0 (how central is this entity to the document)
- context: brief explanation of the entity's role/significance
- mentions: array with at least one mention object containing start, end, text

Return ONLY valid JSON in this exact format (do not use markdown code blocks):
{
  "entities": [
    {
      "id": "entity-1",
      "text": "AWS",
      "type": "organization",
      "importance": 0.9,
      "context": "Cloud platform provider",
      "mentions": [{"start": 0, "end": 3, "text": "AWS"}]
    },
    {
      "id": "entity-2",
      "text": "Machine Learning",
      "type": "concept",
      "importance": 0.8,
      "context": "Core technology discussed",
      "mentions": [{"start": 0, "end": 16, "text": "Machine Learning"}]
    }
  ]
}

Extract at least 10-30 entities if the document is substantial. Be thorough.
