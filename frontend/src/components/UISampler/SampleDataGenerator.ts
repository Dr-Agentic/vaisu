/**
 * SampleDataGenerator
 *
 * Utility for generating sample data for all visualization types in Vaisu.
 * Provides realistic data structures that match the actual visualization data schema.
 */

export class SampleDataGenerator {
  /**
   * Generate sample data for all visualization types
   */
  static generateAllVisualizations() {
    return {
      'structured-view': this.generateStructuredViewData(),
      'mind-map': this.generateMindMapData(),
      'flowchart': this.generateFlowchartData(),
      'knowledge-graph': this.generateKnowledgeGraphData(),
      'executive-dashboard': this.generateExecutiveDashboardData(),
      'timeline': this.generateTimelineData(),
    };
  }

  /**
   * Generate structured view data (document hierarchy)
   */
  static generateStructuredViewData() {
    return {
      title: 'Project Documentation Structure',
      sections: [
        {
          id: 'intro',
          title: 'Introduction',
          type: 'introduction',
          content: 'This document provides an overview of our project architecture and implementation details.',
          subsections: [
            {
              id: 'overview',
              title: 'Project Overview',
              content: 'A comprehensive overview of the project scope and objectives.'
            },
            {
              id: 'goals',
              title: 'Project Goals',
              content: 'Key goals and success criteria for the project implementation.'
            }
          ]
        },
        {
          id: 'architecture',
          title: 'System Architecture',
          type: 'technical',
          content: 'Detailed breakdown of the system architecture and component interactions.',
          subsections: [
            {
              id: 'frontend',
              title: 'Frontend Architecture',
              content: 'React-based frontend with component hierarchy and state management.'
            },
            {
              id: 'backend',
              title: 'Backend Architecture',
              content: 'Node.js Express backend with service layer and data access patterns.'
            },
            {
              id: 'database',
              title: 'Database Design',
              content: 'Database schema design and data relationships.'
            }
          ]
        },
        {
          id: 'api',
          title: 'API Documentation',
          type: 'technical',
          content: 'Comprehensive API documentation with endpoints and usage examples.',
          subsections: [
            {
              id: 'endpoints',
              title: 'Available Endpoints',
              content: 'List of all available API endpoints with HTTP methods and parameters.'
            },
            {
              id: 'examples',
              title: 'Usage Examples',
              content: 'Code examples showing how to use the API effectively.'
            }
          ]
        },
        {
          id: 'deployment',
          title: 'Deployment Guide',
          type: 'guide',
          content: 'Step-by-step guide for deploying the application to production.',
          subsections: [
            {
              id: 'requirements',
              title: 'System Requirements',
              content: 'Minimum system requirements and dependencies.'
            },
            {
              id: 'steps',
              title: 'Deployment Steps',
              content: 'Detailed deployment process and configuration.'
            }
          ]
        }
      ]
    };
  }

  /**
   * Generate mind map data (radial concept visualization)
   */
  static generateMindMapData() {
    return {
      center: {
        id: 'project',
        label: 'Vaisu Project',
        description: 'AI-powered text-to-visual intelligence application',
        type: 'concept'
      },
      nodes: [
        {
          id: 'frontend',
          label: 'Frontend',
          description: 'React-based user interface with visualization components',
          type: 'component',
          connections: ['backend', 'visualization', 'state']
        },
        {
          id: 'backend',
          label: 'Backend',
          description: 'Node.js Express API with AI integration',
          type: 'component',
          connections: ['frontend', 'database', 'llm']
        },
        {
          id: 'visualization',
          label: 'Visualizations',
          description: 'Six different visualization types for data representation',
          type: 'feature',
          connections: ['frontend', 'analysis']
        },
        {
          id: 'state',
          label: 'State Management',
          description: 'Zustand-based global state management',
          type: 'pattern',
          connections: ['frontend', 'ui']
        },
        {
          id: 'database',
          label: 'Database',
          description: 'AWS DynamoDB for data storage',
          type: 'infrastructure',
          connections: ['backend', 'storage']
        },
        {
          id: 'llm',
          label: 'LLM Integration',
          description: 'OpenRouter API for AI-powered analysis',
          type: 'service',
          connections: ['backend', 'analysis']
        },
        {
          id: 'analysis',
          label: 'Document Analysis',
          description: 'AI-powered document analysis and structure extraction',
          type: 'service',
          connections: ['llm', 'visualization']
        },
        {
          id: 'ui',
          label: 'User Interface',
          description: 'Design system with responsive components',
          type: 'design',
          connections: ['state', 'frontend']
        },
        {
          id: 'storage',
          label: 'File Storage',
          description: 'AWS S3 for document file storage',
          type: 'infrastructure',
          connections: ['database', 'backend']
        }
      ],
      connections: [
        { from: 'project', to: 'frontend' },
        { from: 'project', to: 'backend' },
        { from: 'project', to: 'visualization' },
        { from: 'project', to: 'state' },
        { from: 'project', to: 'database' },
        { from: 'project', to: 'llm' },
        { from: 'project', to: 'analysis' },
        { from: 'project', to: 'ui' },
        { from: 'project', to: 'storage' }
      ]
    };
  }

  /**
   * Generate flowchart data (process visualization)
   */
  static generateFlowchartData() {
    return {
      nodes: [
        {
          id: 'start',
          title: 'Document Upload',
          description: 'User uploads a text document',
          type: 'start',
          position: { x: 100, y: 50 }
        },
        {
          id: 'parse',
          title: 'Document Parsing',
          description: 'Parse document structure and extract content',
          type: 'process',
          position: { x: 300, y: 50 }
        },
        {
          id: 'analyze',
          title: 'Content Analysis',
          description: 'AI analyzes content for key concepts and relationships',
          type: 'process',
          position: { x: 500, y: 50 }
        },
        {
          id: 'structure',
          title: 'Structure Detection',
          description: 'Detect document structure and hierarchy',
          type: 'process',
          position: { x: 700, y: 50 }
        },
        {
          id: 'generate',
          title: 'Visualization Generation',
          description: 'Generate appropriate visualization based on content',
          type: 'process',
          position: { x: 900, y: 50 }
        },
        {
          id: 'render',
          title: 'Render Visualization',
          description: 'Render visualization in the user interface',
          type: 'process',
          position: { x: 1100, y: 50 }
        },
        {
          id: 'interactive',
          title: 'User Interaction',
          description: 'User interacts with visualization',
          type: 'decision',
          position: { x: 1300, y: 50 }
        },
        {
          id: 'feedback',
          title: 'Feedback Loop',
          description: 'User provides feedback or requests new visualization',
          type: 'process',
          position: { x: 1500, y: 50 }
        },
        {
          id: 'end',
          title: 'Complete',
          description: 'Process completed successfully',
          type: 'end',
          position: { x: 1700, y: 50 }
        }
      ],
      edges: [
        { from: 'start', to: 'parse', label: 'Upload Complete' },
        { from: 'parse', to: 'analyze', label: 'Parse Successful' },
        { from: 'analyze', to: 'structure', label: 'Analysis Complete' },
        { from: 'structure', to: 'generate', label: 'Structure Mapped' },
        { from: 'generate', to: 'render', label: 'Visualization Ready' },
        { from: 'render', to: 'interactive', label: 'Rendered' },
        { from: 'interactive', to: 'feedback', label: 'User Action' },
        { from: 'interactive', to: 'end', label: 'No Further Action' },
        { from: 'feedback', to: 'analyze', label: 'New Request' }
      ]
    };
  }

  /**
   * Generate knowledge graph data (entity relationships)
   */
  static generateKnowledgeGraphData() {
    return {
      entities: [
        {
          id: 'vaisu',
          name: 'Vaisu',
          type: 'application',
          description: 'AI-powered text-to-visual intelligence application',
          importance: 'high'
        },
        {
          id: 'react',
          name: 'React',
          type: 'technology',
          description: 'JavaScript library for building user interfaces',
          importance: 'high'
        },
        {
          id: 'nodejs',
          name: 'Node.js',
          type: 'technology',
          description: 'JavaScript runtime environment',
          importance: 'high'
        },
        {
          id: 'openrouter',
          name: 'OpenRouter',
          type: 'service',
          description: 'AI model routing service',
          importance: 'medium'
        },
        {
          id: 'aws',
          name: 'AWS',
          type: 'service',
          description: 'Amazon Web Services cloud platform',
          importance: 'medium'
        },
        {
          id: 'documentation',
          name: 'Documentation',
          type: 'concept',
          description: 'Technical documentation and guides',
          importance: 'medium'
        },
        {
          id: 'visualization',
          name: 'Visualization',
          type: 'feature',
          description: 'Data visualization and representation',
          importance: 'high'
        },
        {
          id: 'analysis',
          name: 'Analysis',
          type: 'process',
          description: 'Document analysis and processing',
          importance: 'high'
        },
        {
          id: 'frontend',
          name: 'Frontend',
          type: 'component',
          description: 'User interface layer',
          importance: 'high'
        },
        {
          id: 'backend',
          name: 'Backend',
          type: 'component',
          description: 'Server-side application logic',
          importance: 'high'
        }
      ],
      relationships: [
        { from: 'vaisu', to: 'frontend', type: 'contains', strength: 0.9 },
        { from: 'vaisu', to: 'backend', type: 'contains', strength: 0.9 },
        { from: 'vaisu', to: 'visualization', type: 'provides', strength: 1.0 },
        { from: 'vaisu', to: 'analysis', type: 'performs', strength: 1.0 },
        { from: 'frontend', to: 'react', type: 'uses', strength: 0.9 },
        { from: 'backend', to: 'nodejs', type: 'uses', strength: 0.9 },
        { from: 'backend', to: 'openrouter', type: 'integrates', strength: 0.8 },
        { from: 'backend', to: 'aws', type: 'uses', strength: 0.7 },
        { from: 'analysis', to: 'openrouter', type: 'requires', strength: 1.0 },
        { from: 'visualization', to: 'documentation', type: 'visualizes', strength: 0.8 },
        { from: 'frontend', to: 'visualization', type: 'renders', strength: 0.9 }
      ]
    };
  }

  /**
   * Generate executive dashboard data (KPIs and metrics)
   */
  static generateExecutiveDashboardData() {
    return {
      metrics: [
        {
          id: 'user_count',
          label: 'Active Users',
          value: '1,234',
          target: '2,000',
          change: 12.5,
          trend: 'up',
          unit: 'users',
          description: 'Total active users in the last 30 days'
        },
        {
          id: 'document_processed',
          label: 'Documents Processed',
          value: '5,678',
          target: '10,000',
          change: -3.2,
          trend: 'down',
          unit: 'documents',
          description: 'Total documents processed this month'
        },
        {
          id: 'visualization_generated',
          label: 'Visualizations Generated',
          value: '12,345',
          target: '15,000',
          change: 8.7,
          trend: 'up',
          unit: 'visualizations',
          description: 'Total visualizations generated this quarter'
        },
        {
          id: 'api_calls',
          label: 'API Calls',
          value: '45,678',
          target: '50,000',
          change: 0,
          trend: 'stable',
          unit: 'calls',
          description: 'Total API calls in the last 24 hours'
        },
        {
          id: 'response_time',
          label: 'Average Response Time',
          value: '2.3s',
          target: '< 3s',
          change: -15.4,
          trend: 'down',
          unit: 'seconds',
          description: 'Average API response time'
        },
        {
          id: 'error_rate',
          label: 'Error Rate',
          value: '0.5%',
          target: '< 1%',
          change: -0.2,
          trend: 'down',
          unit: 'percentage',
          description: 'API error rate in the last hour'
        }
      ],
      charts: [
        {
          id: 'user_growth',
          title: 'User Growth (Last 30 Days)',
          type: 'line',
          data: [
            { date: '2024-01-01', value: 1000 },
            { date: '2024-01-05', value: 1050 },
            { date: '2024-01-10', value: 1100 },
            { date: '2024-01-15', value: 1150 },
            { date: '2024-01-20', value: 1200 },
            { date: '2024-01-25', value: 1234 },
            { date: '2024-01-30', value: 1250 }
          ]
        },
        {
          id: 'processing_volume',
          title: 'Document Processing Volume',
          type: 'bar',
          data: [
            { date: 'Jan 2024', value: 5000 },
            { date: 'Feb 2024', value: 5500 },
            { date: 'Mar 2024', value: 5678 }
          ]
        },
        {
          id: 'visualization_types',
          title: 'Visualization Types Distribution',
          type: 'pie',
          data: [
            { type: 'Structured View', value: 40 },
            { type: 'Mind Map', value: 25 },
            { type: 'Flowchart', value: 15 },
            { type: 'Knowledge Graph', value: 12 },
            { type: 'Timeline', value: 8 }
          ]
        }
      ],
      summary: {
        period: 'Q1 2024',
        total_revenue: '$125,000',
        growth_rate: '15.2%',
        new_features: 3,
        customer_satisfaction: '94%'
      }
    };
  }

  /**
   * Generate timeline data (chronological events)
   */
  static generateTimelineData() {
    return {
      title: 'Project Development Timeline',
      events: [
        {
          id: 'project_start',
          title: 'Project Initiation',
          date: '2024-01-15',
          description: 'Project kickoff and initial planning phase completed',
          status: 'completed',
          milestone: true
        },
        {
          id: 'requirements',
          title: 'Requirements Gathering',
          date: '2024-02-01',
          description: 'Completed comprehensive requirements analysis and user stories',
          status: 'completed',
          milestone: true
        },
        {
          id: 'architecture',
          title: 'Architecture Design',
          date: '2024-02-15',
          description: 'System architecture and technology stack finalized',
          status: 'completed',
          milestone: true
        },
        {
          id: 'frontend_dev',
          title: 'Frontend Development',
          date: '2024-03-01',
          description: 'React frontend development commenced',
          status: 'in_progress',
          milestone: false
        },
        {
          id: 'backend_dev',
          title: 'Backend Development',
          date: '2024-03-15',
          description: 'Node.js backend API development started',
          status: 'pending',
          milestone: false
        },
        {
          id: 'llm_integration',
          title: 'LLM Integration',
          date: '2024-04-01',
          description: 'OpenRouter API integration and testing',
          status: 'pending',
          milestone: false
        },
        {
          id: 'visualization',
          title: 'Visualization Engine',
          date: '2024-04-15',
          description: 'Visualization components and rendering engine',
          status: 'pending',
          milestone: false
        },
        {
          id: 'testing',
          title: 'Testing & QA',
          date: '2024-05-01',
          description: 'Comprehensive testing and quality assurance',
          status: 'pending',
          milestone: false
        },
        {
          id: 'deployment',
          title: 'Production Deployment',
          date: '2024-05-15',
          description: 'Production deployment and monitoring setup',
          status: 'pending',
          milestone: true
        },
        {
          id: 'launch',
          title: 'Public Launch',
          date: '2024-06-01',
          description: 'Public launch and marketing campaign',
          status: 'pending',
          milestone: true
        }
      ],
      phases: [
        {
          name: 'Planning',
          start: '2024-01-15',
          end: '2024-02-15',
          color: '#3b82f6'
        },
        {
          name: 'Development',
          start: '2024-03-01',
          end: '2024-04-30',
          color: '#10b981'
        },
        {
          name: 'Testing',
          start: '2024-05-01',
          end: '2024-05-14',
          color: '#f59e0b'
        },
        {
          name: 'Launch',
          start: '2024-05-15',
          end: '2024-06-01',
          color: '#ef4444'
        }
      ]
    };
  }

  /**
   * Get sample content for a specific visualization type
   */
  static getSampleContent(type: string): string {
    const contentMap: Record<string, string> = {
      'structured-view': `
# Project Documentation

## Introduction
This document outlines the architecture and implementation details of our application.

### Overview
The application consists of multiple interconnected components that work together to provide a seamless user experience.

### Goals
- Provide excellent user experience
- Maintain high performance standards
- Ensure scalability and maintainability

## System Architecture
Our system follows a modern architecture pattern with clear separation of concerns.

### Frontend
The frontend is built using React with TypeScript, providing a responsive and interactive user interface.

### Backend
The backend is implemented using Node.js with Express, handling all business logic and API endpoints.

### Database
We use PostgreSQL for our database needs, with proper indexing and optimization strategies.

## API Documentation
Our API follows REST principles and provides comprehensive endpoints for all functionality.

### Authentication
All API endpoints require proper authentication using JWT tokens.

### Rate Limiting
API calls are rate-limited to ensure fair usage and system stability.

## Deployment
The application is deployed using Docker containers with Kubernetes orchestration.

### Environment Variables
All configuration is managed through environment variables for security and flexibility.

### Monitoring
We use comprehensive monitoring tools to track application performance and user experience.
      `,

      'mind-map': `
Central Concept: Project Management

Main Branches:
- Planning: Requirements gathering, timeline, resources
- Development: Frontend, backend, database design
- Testing: Unit tests, integration tests, user acceptance
- Deployment: CI/CD, monitoring, maintenance
- Team: Roles, responsibilities, communication

Sub-branches for each main branch with specific tasks and deliverables.
      `,

      'flowchart': `
Process: Document Analysis Workflow

1. Start: Document Upload
   - Accept various file formats
   - Validate file size and type
   - Store in cloud storage

2. Document Processing
   - Extract text content
   - Parse document structure
   - Identify key elements

3. Content Analysis
   - Apply AI algorithms
   - Extract semantic meaning
   - Identify relationships

4. Visualization Generation
   - Choose appropriate visualization type
   - Generate visualization data
   - Optimize for performance

5. User Interface
   - Render visualization
   - Handle user interactions
   - Provide export options

6. End: Complete
      `,

      'knowledge-graph': `
Entities:
- User: Interacts with the system, uploads documents
- Document: Text files, PDFs, various formats
- Analysis Engine: Processes documents, extracts insights
- Visualization: Different types of data representations
- Database: Stores user data and document metadata
- API: Provides endpoints for frontend communication

Relationships:
- User uploads Document
- Analysis Engine processes Document
- Analysis Engine generates Visualization
- System stores data in Database
- Frontend communicates with API
- API accesses Database for data
      `,

      'executive-dashboard': `
Key Metrics for Project Management:

1. User Engagement
   - Active users per day/week/month
   - Session duration and frequency
   - Feature usage statistics

2. System Performance
   - API response times
   - Error rates and uptime
   - Resource utilization

3. Business Metrics
   - Conversion rates
   - Revenue growth
   - Customer satisfaction scores

4. Development Progress
   - Feature completion rates
   - Bug resolution times
   - Code quality metrics
      `,

      'timeline': `
Project Milestones:

Q1 2024:
- January: Project initiation and planning
- February: Requirements gathering and analysis
- March: Architecture design and technology selection

Q2 2024:
- April: Frontend development begins
- May: Backend development and API design
- June: Integration testing and QA

Q3 2024:
- July: Performance optimization and scaling
- August: Security implementation and testing
- September: User acceptance testing

Q4 2024:
- October: Production deployment preparation
- November: Beta release and feedback collection
- December: Public launch and marketing campaign
      `
    };

    return contentMap[type] || 'Sample content for visualization';
  }

  /**
   * Generate realistic document content for testing
   */
  static generateTestDocument(title: string = 'Sample Document'): string {
    const sections = [
      `# ${title}`,
      '',
      '## Introduction',
      'This is a sample document generated for testing visualization components.',
      'The content includes various types of information that would typically be found in technical documentation.',
      '',
      '### Purpose',
      'The purpose of this document is to demonstrate how different visualization types handle various content structures.',
      '',
      '## Technical Architecture',
      '',
      '### Frontend Components',
      '- React-based user interface',
      '- TypeScript for type safety',
      '- Component-based architecture',
      '',
      '### Backend Services',
      '- Node.js Express server',
      '- RESTful API design',
      '- Database integration',
      '',
      '## Implementation Details',
      '',
      '### Code Structure',
      'The application follows a modular structure with clear separation of concerns.',
      '',
      '### Data Flow',
      '1. User uploads document',
      '2. System processes content',
      '3. AI analyzes structure',
      '4. Visualization is generated',
      '',
      '## Conclusion',
      'This sample document demonstrates the capabilities of the visualization system.',
      'Various content types and structures are supported for optimal user experience.'
    ];

    return sections.join('\n');
  }
}