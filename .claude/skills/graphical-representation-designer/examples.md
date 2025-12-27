# Skill Usage Examples

## Basic Usage

### Example 1: Semantic Argument Map
```bash
/skill graphical-representation-designer --type="Semantic Argument Map" --purpose="Visualize complex argument structures with claims and evidence" --constraints="Support 1000+ nodes, real-time interaction, export formats" --inspiration="Cosmograph, Obsidian Graph View, Palantir Foundry"
```

**Expected Output:**
- Complete design specification for a semantic argument map
- Technical architecture using Three.js and force-directed graphs
- Dual-mode visual system (Dark/Light themes)
- Performance optimization for large datasets
- 8-week implementation timeline

### Example 2: Interactive Timeline
```bash
/skill graphical-representation-designer --type="Interactive Timeline" --purpose="Display chronological events with relationships" --constraints="Zoom interactions, data filtering, responsive design" --inspiration="TimelineJS, Gantt charts, D3.js examples"
```

**Expected Output:**
- Timeline visualization design with zoom and filtering
- Technical implementation using D3.js timeline components
- Responsive design considerations for different screen sizes
- Integration with existing document analysis system
- 6-week implementation timeline

### Example 3: Knowledge Graph
```bash
/skill graphical-representation-designer --type="Knowledge Graph" --purpose="Explore entity relationships and connections" --constraints="Large-scale data, search functionality, clustering" --inspiration="Neo4j Bloom, Graph databases, Network visualization"
```

**Expected Output:**
- Knowledge graph design with search and clustering features
- Technical architecture using graph database principles
- Performance optimization for entity relationship queries
- Integration with existing entity extraction system
- 10-week implementation timeline

## Interactive Mode Usage

### Example: Complex Visualization Design
```bash
/skill graphical-representation-designer
```

**Follow the prompts:**
1. Enter visualization type: "Flowchart with Dependencies"
2. Enter purpose: "Visualize workflow dependencies and execution paths"
3. Enter data structure: "Nodes representing tasks with dependency edges"
4. Enter constraints: ["Real-time updates", "Collaborative editing", "Version history"]
5. Enter inspiration: ["Miro", "Lucidchart", "Microsoft Visio"]

## Advanced Usage with Custom Parameters

### Example: Custom Visualization with Detailed Requirements
```bash
/skill graphical-representation-designer \
  --type="Multi-layered Network Graph" \
  --purpose="Visualize complex multi-dimensional relationships in research data" \
  --data-structure="Nodes with multiple attribute layers and weighted connections" \
  --constraints="Real-time filtering, layer toggling, export to research formats" \
  --inspiration="Cytoscape, Gephi, Research visualization tools"
```

## Integration Examples

### Example: Adding to Existing Visualization System
```bash
/skill graphical-representation-designer --type="Enhanced Mind Map" --purpose="Add radial layout and clustering to existing mind map" --constraints="Maintain compatibility with existing store, add new interaction modes" --inspiration="Existing mind map, radial tree layouts, clustering algorithms"
```

### Example: Performance-focused Design
```bash
/skill graphical-representation-designer --type="Large-scale Document Map" --purpose="Handle 10,000+ document relationships efficiently" --constraints="WebGL rendering, level-of-detail, progressive loading" --inspiration="Large-scale graph visualization, progressive rendering techniques"
```

## Output Examples

### Design Specification Structure
```
# 🎨 Graphical Representation Design Specification

## 📋 Request Summary
- Type: Semantic Argument Map
- Purpose: Visualize complex argument structures
- Data Structure: Claims and evidence nodes with relationships

## 🎯 Design Rationale
[150-200 word explanation of design approach]

## 🔄 User Experience Flow
[200-250 word user interaction description]

## ⚙️ Technical Architecture
[200-300 word technical implementation plan]

## 🎨 Visual Design System
[150-200 word visual design description]

## ⚡ Performance Strategy
[150-200 word performance optimization plan]

## 📅 Implementation Plan
[300-400 word implementation timeline]

## 🕐 Estimated Timeline
[Complexity assessment and timeline]

## ✅ Validation Results
- ✓ Aligns with design principles
- ✓ Technically feasible
- ✓ Performance optimized
- ✓ Accessible design
```

## Common Use Cases

### 1. Academic Research Visualization
- **Type**: Citation Networks
- **Purpose**: Visualize academic paper relationships and citation patterns
- **Constraints**: Large datasets, filtering by year/author/topic
- **Inspiration**: Connected Papers, Semantic Scholar

### 2. Business Process Mapping
- **Type**: Process Flow Diagram
- **Purpose**: Map and analyze business workflows and dependencies
- **Constraints**: Role-based permissions, real-time collaboration
- **Inspiration**: Lucidchart, Miro, Process mapping tools

### 3. Content Relationship Mapping
- **Type**: Content Graph
- **Purpose**: Visualize relationships between articles, topics, and authors
- **Constraints**: Dynamic content updates, search integration
- **Inspiration**: Notion databases, content management systems

### 4. Data Analysis Visualization
- **Type**: Multi-dimensional Data Map
- **Purpose**: Explore complex datasets with multiple attribute dimensions
- **Constraints**: Interactive filtering, real-time updates
- **Inspiration**: Tableau, Power BI, custom dashboards

## Troubleshooting

### Common Issues and Solutions

**Issue**: "Design guidelines not available"
**Solution**: Ensure the design guide file exists at `/frontend/src/design-system/GRAPHICAL_REPRESENTATIONS_GUIDE.md`

**Issue**: "AI service not available"
**Solution**: Check internet connection and AI service availability

**Issue**: "Missing required parameters"
**Solution**: Provide at least visualizationType and purpose parameters

**Issue**: "Complex request failed"
**Solution**: Break complex requests into smaller, focused requests

## Best Practices

1. **Be Specific**: Provide clear, detailed descriptions of requirements
2. **Include Constraints**: Specify technical limitations and requirements
3. **Provide Inspiration**: Reference existing tools or designs you like
4. **Consider Performance**: Always specify expected data scale and performance requirements
5. **Plan Integration**: Consider how the new visualization integrates with existing features
6. **Accessibility First**: Always include accessibility requirements
7. **Test Early**: Use the generated specifications to create prototypes and validate assumptions

## Integration with Development Workflow

1. **Design Phase**: Use the skill to generate comprehensive design specifications
2. **Review Phase**: Share specifications with team for feedback and validation
3. **Implementation Phase**: Follow the provided implementation plan and technical architecture
4. **Testing Phase**: Use the specification as a basis for test cases and quality assurance
5. **Iteration Phase**: Use the skill again for design iterations and improvements