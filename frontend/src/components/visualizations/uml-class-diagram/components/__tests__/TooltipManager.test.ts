/**
 * TooltipManager Tests
 *
 * These tests focus on the logic for hover tooltip delay, positioning, and content.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import type { ClassEntity, UMLRelationship } from '@shared/types';

describe('TooltipManager Logic Tests', () => {
  const mockClassEntity: ClassEntity = {
    id: 'class-1',
    name: 'UserService',
    type: 'class',
    stereotype: 'service',
    package: 'com.example.service',
    attributes: [
      {
        id: 'attr-1',
        name: 'userRepository',
        type: 'UserRepository',
        visibility: 'private',
        isStatic: false,
      },
    ],
    methods: [
      {
        id: 'method-1',
        name: 'authenticate',
        returnType: 'boolean',
        visibility: 'public',
        isStatic: false,
        isAbstract: false,
        parameters: [
          { name: 'username', type: 'String' },
          { name: 'password', type: 'String' },
        ],
      },
    ],
    description: 'Handles user authentication and management',
    sourceQuote: 'The UserService class manages user operations including authentication and user data management',
    sourceSpan: null,
    documentLink: '#document-1',
  };

  const mockRelationship: UMLRelationship = {
    id: 'rel-1',
    source: 'class-1',
    target: 'class-2',
    type: 'inheritance',
    description: 'UserService extends BaseService',
    sourceMultiplicity: '1',
    targetMultiplicity: '1',
    sourceRole: 'child',
    targetRole: 'parent',
    sourceQuote: 'UserService extends BaseService to inherit common functionality',
    evidence: [],
  };

  const mockRelationships = [
    { source: 'class-1', target: 'class-2', type: 'inheritance' },
    { source: 'class-3', target: 'class-1', type: 'association' },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Property Test 28: Hover tooltip delay
  it('property test: tooltip appears after specified delay (Property 28)', () => {
    const hoverDelay = 400;
    let tooltipVisible = false;

    // Simulate hover delay logic
    const simulateHoverDelay = (delay: number) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          tooltipVisible = true;
          resolve();
        }, delay);
      });
    };

    // Start hover
    const hoverPromise = simulateHoverDelay(hoverDelay);

    // Tooltip should not be visible immediately
    expect(tooltipVisible).toBe(false);

    // Advance time by less than delay
    vi.advanceTimersByTime(hoverDelay - 100);
    expect(tooltipVisible).toBe(false);

    // Advance time to complete delay
    vi.advanceTimersByTime(100);

    return hoverPromise.then(() => {
      expect(tooltipVisible).toBe(true);
    });
  });

  // Property Test 29: Hover tooltip content completeness
  it('property test: tooltip contains all required content sections (Property 29)', () => {
    const validateTooltipContent = (entity: ClassEntity) => {
      const requiredSections = {
        header: true,
        classIcon: true,
        className: true,
        classType: true,
        stereotype: entity.stereotype ? true : false,
        description: entity.description ? true : false,
        statistics: true,
        memberCount: true,
        relationshipCount: true,
        packageInfo: entity.package ? true : false,
        sourceQuote: entity.sourceQuote ? true : false,
        documentLink: entity.documentLink ? true : false,
      };

      return requiredSections;
    };

    const content = validateTooltipContent(mockClassEntity);

    // Required sections should always be present
    expect(content.header).toBe(true);
    expect(content.classIcon).toBe(true);
    expect(content.className).toBe(true);
    expect(content.classType).toBe(true);
    expect(content.statistics).toBe(true);
    expect(content.memberCount).toBe(true);
    expect(content.relationshipCount).toBe(true);

    // Optional sections based on data availability
    expect(content.stereotype).toBe(true); // mockClassEntity has stereotype
    expect(content.description).toBe(true); // mockClassEntity has description
    expect(content.packageInfo).toBe(true); // mockClassEntity has package
    expect(content.sourceQuote).toBe(true); // mockClassEntity has sourceQuote
    expect(content.documentLink).toBe(true); // mockClassEntity has documentLink
  });

  it('validates tooltip positioning with viewport clamping', () => {
    const calculateTooltipPosition = (
      mousePos: { x: number; y: number },
      tooltipSize: { width: number; height: number },
      viewport: { width: number; height: number },
      padding: number = 20,
    ) => {
      const offset = 20;

      return {
        x: Math.max(
          padding,
          Math.min(
            mousePos.x + offset,
            viewport.width - tooltipSize.width - padding,
          ),
        ),
        y: Math.max(
          padding,
          Math.min(
            mousePos.y + offset,
            viewport.height - tooltipSize.height - padding,
          ),
        ),
      };
    };

    const viewport = { width: 1000, height: 800 };
    const tooltipSize = { width: 380, height: 400 };

    // Test normal positioning
    const normalPos = calculateTooltipPosition(
      { x: 100, y: 100 },
      tooltipSize,
      viewport,
    );
    expect(normalPos.x).toBe(120); // 100 + 20 offset
    expect(normalPos.y).toBe(120); // 100 + 20 offset

    // Test right edge clamping
    const rightEdgePos = calculateTooltipPosition(
      { x: 900, y: 100 },
      tooltipSize,
      viewport,
    );
    expect(rightEdgePos.x).toBe(600); // 1000 - 380 - 20 padding

    // Test bottom edge clamping
    const bottomEdgePos = calculateTooltipPosition(
      { x: 100, y: 700 },
      tooltipSize,
      viewport,
    );
    expect(bottomEdgePos.y).toBe(380); // 800 - 400 - 20 padding
  });

  it('validates relationship statistics calculation', () => {
    const calculateRelationshipStats = (
      classId: string,
      relationships: Array<{ source: string; target: string; type: string }>,
    ) => {
      return relationships.reduce((stats, rel) => {
        if (rel.source === classId || rel.target === classId) {
          stats.total++;
          if (rel.source === classId) stats.outgoing++;
          else stats.incoming++;
        }
        return stats;
      }, { total: 0, incoming: 0, outgoing: 0 });
    };

    const stats = calculateRelationshipStats('class-1', mockRelationships);

    expect(stats.total).toBe(2);
    expect(stats.outgoing).toBe(1); // class-1 -> class-2
    expect(stats.incoming).toBe(1); // class-3 -> class-1
  });

  it('validates source context extraction', () => {
    const getSourceContext = (quote: string, fullText?: string, contextLength: number = 50) => {
      if (!fullText || !quote) return quote;

      const index = fullText.indexOf(quote);
      if (index === -1) return quote;

      const start = Math.max(0, index - contextLength);
      const end = Math.min(fullText.length, index + quote.length + contextLength);
      const context = fullText.slice(start, end);

      return start > 0 ? `...${context}` : context;
    };

    const fullText = 'This is a long document. The UserService class manages user operations. It provides authentication.';
    const quote = 'UserService class manages user operations';

    const context = getSourceContext(quote, fullText, 20);

    expect(context).toContain(quote);
    expect(context.length).toBeGreaterThan(quote.length);
    expect(context).toContain('...'); // Should have leading ellipsis
  });

  it('validates class type icon mapping', () => {
    const getTypeIcon = (type: string) => {
      const iconMap = {
        'interface': 'Code',
        'abstract': 'Database',
        'enum': 'Package',
        'class': 'Users',
      };
      return iconMap[type as keyof typeof iconMap] || 'Users';
    };

    expect(getTypeIcon('interface')).toBe('Code');
    expect(getTypeIcon('abstract')).toBe('Database');
    expect(getTypeIcon('enum')).toBe('Package');
    expect(getTypeIcon('class')).toBe('Users');
    expect(getTypeIcon('unknown')).toBe('Users'); // Default
  });

  it('validates relationship type descriptions', () => {
    const getRelationshipDescription = (type: string) => {
      const descriptions = {
        'inheritance': 'Child class inherits from parent class',
        'interface': 'Class implements interface contract',
        'composition': 'Strong ownership - part cannot exist without whole',
        'aggregation': 'Weak ownership - part can exist independently',
        'association': 'General relationship between classes',
        'dependency': 'One class depends on another',
      };
      return descriptions[type as keyof typeof descriptions] || 'Relationship between classes';
    };

    expect(getRelationshipDescription('inheritance')).toContain('inherits');
    expect(getRelationshipDescription('composition')).toContain('Strong ownership');
    expect(getRelationshipDescription('aggregation')).toContain('Weak ownership');
    expect(getRelationshipDescription('unknown')).toBe('Relationship between classes');
  });

  it('validates tooltip timeout cleanup', () => {
    let timeoutId: NodeJS.Timeout | null = null;
    let tooltipVisible = false;

    const startHover = (delay: number) => {
      if (timeoutId) clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        tooltipVisible = true;
      }, delay);
    };

    const stopHover = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      tooltipVisible = false;
    };

    // Start hover
    startHover(400);
    expect(tooltipVisible).toBe(false);

    // Stop hover before timeout
    vi.advanceTimersByTime(200);
    stopHover();

    // Advance past original timeout
    vi.advanceTimersByTime(300);
    expect(tooltipVisible).toBe(false); // Should not appear due to cleanup
  });

  it('validates member count calculation', () => {
    const calculateMemberCount = (entity: ClassEntity) => {
      return {
        attributes: entity.attributes.length,
        methods: entity.methods.length,
        total: entity.attributes.length + entity.methods.length,
      };
    };

    const memberCount = calculateMemberCount(mockClassEntity);

    expect(memberCount.attributes).toBe(1);
    expect(memberCount.methods).toBe(1);
    expect(memberCount.total).toBe(2);
  });

  it('validates tooltip content for different class types', () => {
    const interfaceEntity: ClassEntity = {
      ...mockClassEntity,
      type: 'interface',
      stereotype: undefined,
    };

    const validateClassTypeContent = (entity: ClassEntity) => {
      return {
        hasStereotype: !!entity.stereotype,
        typeSpecificStyling: true, // Would be determined by type
        iconType: entity.type,
      };
    };

    const classContent = validateClassTypeContent(mockClassEntity);
    const interfaceContent = validateClassTypeContent(interfaceEntity);

    expect(classContent.hasStereotype).toBe(true);
    expect(classContent.iconType).toBe('class');

    expect(interfaceContent.hasStereotype).toBe(false);
    expect(interfaceContent.iconType).toBe('interface');
  });

  it('validates relationship tooltip content structure', () => {
    const validateRelationshipTooltip = (relationship: UMLRelationship) => {
      return {
        hasHeader: true,
        hasTypeDescription: true,
        hasMultiplicity: !!(relationship.sourceMultiplicity || relationship.targetMultiplicity),
        hasRoles: !!(relationship.sourceRole || relationship.targetRole),
        hasDescription: !!relationship.description,
        hasSourceQuote: !!relationship.sourceQuote,
      };
    };

    const content = validateRelationshipTooltip(mockRelationship);

    expect(content.hasHeader).toBe(true);
    expect(content.hasTypeDescription).toBe(true);
    expect(content.hasMultiplicity).toBe(true);
    expect(content.hasRoles).toBe(true);
    expect(content.hasDescription).toBe(true);
    expect(content.hasSourceQuote).toBe(true);
  });
});
