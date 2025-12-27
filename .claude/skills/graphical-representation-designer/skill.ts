import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Graphical Representation Designer Skill
 *
 * This skill provides comprehensive capabilities for designing state-of-the-art
 * graphical representations and visualizations for the Vaisu application.
 *
 * Usage: /skill graphical-representation-designer
 */

interface DesignRequest {
  visualizationType: string;
  purpose: string;
  dataStructure: string;
  constraints?: string[];
  inspiration?: string[];
}

interface DesignOutput {
  designRationale: string;
  userExperienceFlow: string;
  technicalArchitecture: string;
  visualDesignSystem: string;
  performanceStrategy: string;
  implementationPlan: string;
  estimatedTimeline: string;
  validationResults: string[];
}

export class GraphicalRepresentationDesignerSkill {
  private readonly DESIGN_GUIDE_PATH = '/frontend/src/design-system/GRAPHICAL_REPRESENTATIONS_GUIDE.md';
  private readonly GRAPHY_AGENT_PATH = '/agents/graphy/design-agent.ts';

  /**
   * Main skill execution method
   */
  async execute(params: Record<string, any>): Promise<string> {
    try {
      // Parse input parameters
      const request = this.parseInput(params);

      // Generate design specification
      const designOutput = await this.designVisualization(request);

      // Validate against guidelines
      const validation = await this.validateDesign(designOutput);

      // Generate output summary
      return this.formatOutput(designOutput, validation);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Parse input parameters into design request
   */
  private parseInput(params: Record<string, any>): DesignRequest {
    // Command line parameters
    const request: DesignRequest = {
      visualizationType: params.type || params['--type'] || '',
      purpose: params.purpose || params['--purpose'] || '',
      dataStructure: params['data-structure'] || params['--data-structure'] || '',
      constraints: params.constraints ? (Array.isArray(params.constraints) ? params.constraints : [params.constraints]) : [],
      inspiration: params.inspiration ? (Array.isArray(params.inspiration) ? params.inspiration : [params.inspiration]) : []
    };

    // If interactive mode, prompt for missing values
    if (!request.visualizationType) {
      request.visualizationType = this.promptForInput('Visualization Type (e.g., "Semantic Argument Map", "Mind Map")');
    }

    if (!request.purpose) {
      request.purpose = this.promptForInput('Purpose and primary user goals');
    }

    if (!request.dataStructure) {
      request.dataStructure = this.promptForInput('Data structure to be visualized');
    }

    return request;
  }

  /**
   * Generate comprehensive design specification
   */
  private async designVisualization(request: DesignRequest): Promise<DesignOutput> {
    // Read design guidelines
    const guidelines = await this.readDesignGuidelines();

    // AI-powered design generation
    const designSpec = await this.generateDesignSpecification(request, guidelines);

    // Parse and structure the output
    return this.parseDesignOutput(designSpec);
  }

  /**
   * Validate design against established guidelines
   */
  private async validateDesign(designOutput: DesignOutput): Promise<string[]> {
    const guidelines = await this.readDesignGuidelines();
    const validationPrompt = `
      Validate this design specification against the established guidelines:

      Design Output: ${JSON.stringify(designOutput, null, 2)}
      Guidelines: ${guidelines}

      Check for:
      1. Alignment with design principles
      2. Technical feasibility
      3. Performance considerations
      4. User experience quality
      5. Accessibility compliance
      6. Integration compatibility

      Return validation results as a list of issues or confirmations.
    `;

    const validation = await this.callAI(validationPrompt);
    return validation.split('\n').filter(line => line.trim().length > 0);
  }

  /**
   * Read design guidelines from file system
   */
  private async readDesignGuidelines(): Promise<string> {
    try {
      const guidelines = readFileSync(this.DESIGN_GUIDE_PATH, 'utf8');
      return guidelines;
    } catch (error) {
      console.warn(`Warning: Could not read design guidelines from ${this.DESIGN_GUIDE_PATH}`);
      return 'Design guidelines not available';
    }
  }

  /**
   * Generate AI-powered design specification
   */
  private async generateDesignSpecification(request: DesignRequest, guidelines: string): Promise<string> {
    const prompt = `
      Create a comprehensive design specification for this visualization request:

      Request: ${JSON.stringify(request, null, 2)}
      Guidelines: ${guidelines}

      The specification must include:

      1. **Design Rationale** (150-200 words)
         - Why this visualization approach is optimal
         - How it solves the user's problem
         - Alignment with Vaisu's design principles

      2. **User Experience Flow** (200-250 words)
         - Step-by-step user interaction
         - Key user actions and system responses
         - Error states and edge cases

      3. **Technical Architecture** (200-300 words)
         - Recommended libraries and technologies (Three.js, D3.js, React Flow, etc.)
         - Data flow and state management
         - Integration points with existing Vaisu system
         - API requirements and data structures

      4. **Visual Design System** (150-200 words)
         - Color scheme and typography for both Dark and Light modes
         - Interaction states and animations
         - Accessibility considerations (WCAG 2.2 AA compliance)
         - Responsive design requirements

      5. **Performance Strategy** (150-200 words)
         - Performance optimization approaches for high-density data
         - Level of Detail (LOD) implementation strategies
         - Memory management and rendering optimization
         - Scalability considerations

      6. **Implementation Plan** (300-400 words)
         - Phase-by-phase implementation strategy
         - Key milestones and deliverables
         - Dependencies and integration points
         - Testing strategy and quality assurance

      7. **Estimated Timeline**
         - Rough timeline with phases (Week 1-2: Design, Week 3-4: Core implementation, etc.)
         - Complexity assessment (Low/Medium/High)
         - Risk factors and mitigation strategies

      Ensure the specification is actionable and follows the established design guidelines.
      Focus on creating a "Cinematic Intelligence Interface" that rivals tools like Palantir, Cosmograph, and Linear.
    `;

    return await this.callAI(prompt);
  }

  /**
   * Parse AI-generated output into structured format
   */
  private parseDesignOutput(output: string): DesignOutput {
    return {
      designRationale: this.extractSection(output, 'Design Rationale'),
      userExperienceFlow: this.extractSection(output, 'User Experience Flow'),
      technicalArchitecture: this.extractSection(output, 'Technical Architecture'),
      visualDesignSystem: this.extractSection(output, 'Visual Design System'),
      performanceStrategy: this.extractSection(output, 'Performance Strategy'),
      implementationPlan: this.extractSection(output, 'Implementation Plan'),
      estimatedTimeline: this.extractSection(output, 'Estimated Timeline'),
      validationResults: []
    };
  }

  /**
   * Extract specific section from AI output
   */
  private extractSection(text: string, sectionTitle: string): string {
    const regex = new RegExp(`${sectionTitle}\\s*(.*?)(?=\\n\\d+\\.\\s|$)`, 's');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  }

  /**
   * Format final output for user
   */
  private formatOutput(designOutput: DesignOutput, validation: string[]): string {
    const output = `
# 🎨 Graphical Representation Design Specification

## 📋 Request Summary
- **Type**: ${designOutput.estimatedTimeline}
- **Purpose**: ${designOutput.designRationale.substring(0, 100)}...
- **Data Structure**: ${designOutput.userExperienceFlow.substring(0, 100)}...

## 🎯 Design Rationale
${designOutput.designRationale}

## 🔄 User Experience Flow
${designOutput.userExperienceFlow}

## ⚙️ Technical Architecture
${designOutput.technicalArchitecture}

## 🎨 Visual Design System
${designOutput.visualDesignSystem}

## ⚡ Performance Strategy
${designOutput.performanceStrategy}

## 📅 Implementation Plan
${designOutput.implementationPlan}

## 🕐 Estimated Timeline
${designOutput.estimatedTimeline}

## ✅ Validation Results
${validation.map(result => `- ${result}`).join('\n')}

---

**💡 Next Steps:**
1. Review this specification with your team
2. Begin Phase 1 implementation following the provided plan
3. Refer to the design guidelines for detailed technical specifications
4. Use the Graphy agent for additional design iterations if needed

**📁 Generated Files:**
- Design specification saved to skill output
- Refer to ${this.DESIGN_GUIDE_PATH} for detailed implementation guidelines
    `;

    return output;
  }

  /**
   * Handle errors gracefully
   */
  private handleError(error: any): string {
    return `
❌ **Error occurred during design generation:**

\`\`\`
${error.message || error}
\`\`\`

**💡 Suggestions:**
1. Ensure all required parameters are provided
2. Check that design guidelines file exists at ${this.DESIGN_GUIDE_PATH}
3. Verify that the AI service is available
4. Try a simpler request or break complex requests into smaller steps

**📝 Example Usage:**
\`\`\`
/skill graphical-representation-designer --type="Semantic Argument Map" --purpose="Visualize argument structures"
\`\`\`
    `;
  }

  /**
   * Prompt for interactive input (placeholder for actual implementation)
   */
  private promptForInput(prompt: string): string {
    // In actual implementation, this would use Claude Code's interactive input
    console.log(`Please provide: ${prompt}`);
    return ''; // Placeholder
  }

  /**
   * Call AI service (placeholder for actual implementation)
   */
  private async callAI(prompt: string): Promise<string> {
    // In actual implementation, this would use Claude Code's AI capabilities
    // For now, return a mock response
    return `
1. Design Rationale
This visualization approach is optimal because it leverages force-directed physics combined with semantic zoom to provide both overview and detail views. It solves the user's problem by enabling exploration of complex data relationships while maintaining performance through level-of-detail optimization. The design aligns with Vaisu's principles of cinematic intelligence interfaces that are both beautiful and functional.

2. User Experience Flow
Users begin by uploading or pasting content for analysis. The system processes the text and generates a semantic graph visualization. Users can interact with the visualization through zoom, pan, and node selection. Hover effects highlight connected nodes while clicking reveals detailed information. Context menus provide export options and filtering capabilities.

3. Technical Architecture
Recommended technologies include react-force-graph-3d for 3D rendering, D3.js for 2D interactions, and Zustand for state management. Data flows from the backend analysis service through the frontend store to visualization components. Integration points include the existing document analysis pipeline and export functionality. API requirements include endpoints for data retrieval and visualization configuration.

4. Visual Design System
Color schemes follow the dual-metaphor approach with bioluminescent themes for dark mode and architectural blueprint aesthetics for light mode. Typography uses system fonts with clear hierarchy. Interaction states include hover, selection, and loading states with smooth transitions. Accessibility is ensured through proper contrast ratios and keyboard navigation support.

5. Performance Strategy
Performance optimization uses instanced rendering for large datasets, frustum culling for off-screen elements, and adaptive quality settings based on device capabilities. Level of Detail implementation progressively reveals information based on zoom level. Memory management includes texture cleanup and geometry pooling. Scalability is achieved through spatial partitioning and batched updates.

6. Implementation Plan
Phase 1 (Week 1-2): Design system implementation and basic rendering. Phase 2 (Week 3-4): Interaction system and state management. Phase 3 (Week 5-6): Performance optimization and LOD system. Phase 4 (Week 7-8): Accessibility features and polish. Dependencies include Three.js, D3.js, and Zustand. Integration requires updates to the existing visualization store.

7. Estimated Timeline
Complexity: Medium-High
Timeline: 8 weeks total
Risk factors: Performance optimization for large datasets, 3D/2D mode transitions, accessibility compliance
Mitigation: Early prototyping, performance testing with realistic data, accessibility testing throughout development.
    `;
  }
}

/**
 * Export the skill as the default export
 */
export default GraphicalRepresentationDesignerSkill;