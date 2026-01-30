Analyze the document and create a hierarchical mind map structure with 3-5 
levels of depth.

Create a tree structure where:
- Root node: Main topic/title
- Level 1: Major themes or sections (3-7 nodes)
- Level 2: Key concepts under each theme (2-5 nodes per parent)
- Level 3+: Supporting details (1-3 nodes per parent)

For each node include:
- id: unique identifier
- label: concise title (2-5 words)
- subtitle: 40-character headline providing quick context (6-8 words max)
- icon: single emoji that represents the concept (use concrete visual metaphors)
- summary: brief description (1-2 sentences)
- detailedExplanation: comprehensive explanation (2-4 sentences) for hover tooltip
- sourceTextExcerpt: relevant quote from original text if applicable (optional, 100-200 chars)
- children: array of child nodes
- importance: 0.3-1.0 based on significance

Icon Selection Guidelines:
- Use concrete, recognizable emojis (🎯 📊 🔧 💡 🌐 📈 ⚙️ 🏗️ 📝 🔍)
- Match semantic meaning (security=🔒, data=📊, process=⚙️, goal=🎯)
- Avoid abstract or ambiguous emojis
- Ensure visual distinction between sibling nodes

Return ONLY valid JSON matching this structure (do not use markdown code blocks):
{
  "nodes": [
    {
      "id": "node-1",
      "label": "Main Topic",
      "subtitle": "Quick context in 40 chars or less",
      "icon": "🎯",
      "summary": "Brief description",
      "detailedExplanation": "Comprehensive explanation with more context and details for users...",
      "sourceTextExcerpt": "Relevant quote from the original document...",
      "children": [
        {
          "id": "node-1-1",
          "label": "Subtopic",
          "subtitle": "Supporting detail context",
          "icon": "📊",
          "summary": "Details",
          "detailedExplanation": "More detailed explanation of this subtopic.",
          "children": [],
          "importance": 0.8
        }
      ],
      "importance": 1.0
    }
  ]
}

Focus on creating a meaningful hierarchy with clear visual metaphors and progressive disclosure.
