# Graphical Representation Designer Skill

## Overview

This skill provides comprehensive capabilities for designing state-of-the-art graphical representations and visualizations for the Vaisu application. It encapsulates the Graphy agent's functionality into an easily accessible skill system.

## Capabilities

### 🎨 **Visualization Design**
- Create complete design specifications for new graphical representations
- Design user experience flows and interaction patterns
- Define visual metaphors and aesthetic systems
- Create wireframes and interaction mockups

### 🔧 **Technical Architecture**
- Design technical implementation strategies
- Recommend appropriate libraries and technologies
- Plan integration with existing system architecture
- Define state management approaches

### 🎯 **Aesthetic Systems**
- Create dual-mode visual systems (Dark/Light themes)
- Define color schemes and typography
- Design interaction states and animations
- Ensure accessibility compliance

### ⚡ **Performance Optimization**
- Design performance strategies for high-density data
- Implement Level of Detail (LOD) systems
- Optimize rendering for large datasets
- Plan memory management strategies

### 📋 **Implementation Planning**
- Create phase-by-phase implementation plans
- Define key milestones and deliverables
- Identify dependencies and integration points
- Provide estimated timelines and complexity assessments

## Usage

### Basic Usage
```bash
/skill graphical-representation-designer
```

### With Parameters
```bash
/skill graphical-representation-designer --type="Semantic Argument Map" --purpose="Visualize complex argument structures" --constraints="High-performance, 1000+ nodes"
```

### Interactive Mode
The skill supports interactive input for complex design requests:
1. Define visualization type and purpose
2. Specify data structure requirements
3. Set performance and technical constraints
4. Provide inspiration references
5. Review and refine the design specification

## Input Format

The skill accepts both command-line parameters and interactive input:

### Command Line Parameters
- `--type`: Type of visualization (e.g., "Semantic Argument Map", "Mind Map", "Flowchart")
- `--purpose`: Primary purpose and user goals
- `--data-structure`: Description of data to be visualized
- `--constraints`: Technical or design constraints
- `--inspiration`: Reference designs or similar tools

### Interactive Input Schema
```json
{
  "visualizationType": "string",
  "purpose": "string",
  "dataStructure": "string",
  "constraints": ["string"],
  "inspiration": ["string"]
}
```

## Output Format

The skill generates comprehensive design specifications including:

### 📖 **Design Documentation**
- Design rationale (150-200 words)
- User experience flow (200-250 words)
- Technical architecture overview (200-300 words)

### 🎨 **Visual Design System**
- Color schemes for both Dark and Light modes
- Typography and spacing guidelines
- Interaction states and animations
- Accessibility considerations

### ⚙️ **Technical Specifications**
- Recommended libraries and technologies
- Data flow and state management strategy
- Performance optimization approaches
- Integration points with existing system

### 📅 **Implementation Plan**
- Phase-by-phase implementation strategy
- Key milestones and deliverables
- Dependencies and integration requirements
- Estimated timeline and complexity assessment

## Design Guidelines Integration

The skill automatically references and applies the design guidelines from:
- `/frontend/src/design-system/GRAPHICAL_REPRESENTATIONS_GUIDE.md`
- `/agents/graphy/design-agent.ts`
- Existing Vaisu design system principles

## Examples

### Example 1: Semantic Argument Map
```bash
/skill graphical-representation-designer --type="Semantic Argument Map" --purpose="Visualize complex argument structures with claims and evidence" --constraints="Support 1000+ nodes, real-time interaction, export formats" --inspiration="Cosmograph, Obsidian Graph View, Palantir Foundry"
```

### Example 2: Interactive Timeline
```bash
/skill graphical-representation-designer --type="Interactive Timeline" --purpose="Display chronological events with relationships" --constraints="Zoom interactions, data filtering, responsive design" --inspiration="TimelineJS, Gantt charts, D3.js examples"
```

### Example 3: Knowledge Graph
```bash
/skill graphical-representation-designer --type="Knowledge Graph" --purpose="Explore entity relationships and connections" --constraints="Large-scale data, search functionality, clustering" --inspiration="Neo4j Bloom, Graph databases, Network visualization"
```

## Integration with Existing System

### Store Integration
The skill provides guidance on integrating new visualizations with the existing Zustand store system:
- State management patterns
- Action definitions
- Data flow integration

### Component Architecture
- Component structure recommendations
- Reusable component patterns
- Design system integration

### Performance Considerations
- Rendering optimization strategies
- Memory management approaches
- Scalability planning

## Validation and Quality Assurance

The skill includes built-in validation against:
- Established design principles
- Technical feasibility
- Performance requirements
- Accessibility standards
- Integration compatibility

## Development Workflow

### Phase 1: Requirements Analysis
1. Define visualization purpose and goals
2. Analyze data structure and constraints
3. Research inspiration and reference designs
4. Identify technical requirements

### Phase 2: Design Specification
1. Create user experience flow
2. Design visual system and interactions
3. Define technical architecture
4. Plan performance optimization

### Phase 3: Implementation Guidance
1. Provide detailed implementation plan
2. Define component structure
3. Specify integration points
4. Create testing strategy

## References

- **Design Guidelines**: `/frontend/src/design-system/GRAPHICAL_REPRESENTATIONS_GUIDE.md`
- **Graphy Agent**: `/agents/graphy/design-agent.ts`
- **Existing Visualizations**: `/frontend/src/components/visualizations/`
- **Design System**: `/frontend/src/design-system/`

This skill provides a comprehensive framework for designing high-quality graphical representations that integrate seamlessly with the Vaisu application architecture.