import type { KnowledgeNode, KnowledgeEdge } from '../types';

/**
 * AI Regulation Policy Knowledge Graph Seed Data
 *
 * Demonstrates a hierarchical knowledge graph showing the causal chain:
 * Sources/Concepts → Regulations → Impacts → Risks/Opportunities
 *
 * This data showcases the "Elite" grid layout with deterministic column placement
 * based on in-degree analysis and sector headers.
 */

export const aiRegulationPolicySeed: {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
} = {
  nodes: [
    // Column 0: Sources & Concepts (in-degree = 0, foundational elements)
    {
      id: 'ai_foundations',
      label: 'AI Technology Foundations',
      type: 'SOURCE',
      confidence: 0.95,
      metadata: {
        sources: ['MIT AI Research', 'Stanford AI Index 2024'],
        description: 'Fundamental AI/ML technologies including deep learning, neural networks, and machine learning algorithms that enable modern AI systems.',
        category: 'Technology'
      }
    },
    {
      id: 'society_impact',
      label: 'Societal Impact Concerns',
      type: 'CONCEPT',
      confidence: 0.90,
      metadata: {
        sources: ['UNESCO AI Ethics Guidelines', 'EU Commission Reports'],
        description: 'Growing concerns about AI bias, discrimination, privacy violations, and social inequality implications.',
        category: 'Social'
      }
    },
    {
      id: 'economic_potential',
      label: 'Economic Growth Potential',
      type: 'CONCEPT',
      confidence: 0.88,
      metadata: {
        sources: ['World Economic Forum', 'McKinsey Global Institute'],
        description: 'AI projected to contribute $15.7 trillion to global economy by 2030 through productivity gains and innovation.',
        category: 'Economic'
      }
    },

    // Column 1: Regulations & Policies (in-degree = 1+, regulatory frameworks)
    {
      id: 'eu_ai_act',
      label: 'EU AI Act',
      type: 'REGULATION',
      confidence: 0.92,
      metadata: {
        sources: ['European Commission', 'Official EU Legislation'],
        description: 'Comprehensive AI regulation establishing risk categories and conformity requirements for AI systems in the EU market.',
        category: 'Regulatory'
      }
    },
    {
      id: 'us_ai_bill_rights',
      label: 'US AI Bill of Rights',
      type: 'REGULATION',
      confidence: 0.85,
      metadata: {
        sources: ['White House Office of Science and Technology Policy'],
        description: 'Non-binding framework establishing principles for safe and trustworthy AI development in the United States.',
        category: 'Regulatory'
      }
    },
    {
      id: 'gdpr_ai_amendments',
      label: 'GDPR AI Amendments',
      type: 'REGULATION',
      confidence: 0.88,
      metadata: {
        sources: ['European Data Protection Board'],
        description: 'Updates to GDPR addressing automated decision-making, profiling, and AI-specific data protection requirements.',
        category: 'Legal'
      }
    },

    // Column 2: Impacts & Outcomes (in-degree = 2+, direct consequences)
    {
      id: 'compliance_costs',
      label: 'Increased Compliance Costs',
      type: 'IMPACT',
      confidence: 0.87,
      metadata: {
        sources: ['Boston Consulting Group', 'Deloitte AI Compliance Study'],
        description: 'AI companies facing 15-30% increase in operational costs due to regulatory compliance requirements.',
        category: 'Business'
      }
    },
    {
      id: 'innovation_slowdown',
      label: 'Innovation Slowdown',
      type: 'IMPACT',
      confidence: 0.82,
      metadata: {
        sources: ['AI Now Institute', 'Stanford HAI'],
        description: 'Regulatory uncertainty causing 18-month delays in AI product development timelines.',
        category: 'Business'
      }
    },
    {
      id: 'market_consolidation',
      label: 'Market Consolidation',
      type: 'IMPACT',
      confidence: 0.86,
      metadata: {
        sources: ['Brookings Institution', 'OECD AI Policy Observatory'],
        description: 'Regulations favoring large tech companies with compliance resources, reducing startup competition.',
        category: 'Market'
      }
    },
    {
      id: 'consumer_protection',
      label: 'Enhanced Consumer Protection',
      type: 'IMPACT',
      confidence: 0.91,
      metadata: {
        sources: ['Consumer Reports', 'European Consumer Organization'],
        description: 'Significant improvement in AI transparency and accountability leading to better consumer trust.',
        category: 'Social'
      }
    },

    // Column 3: Risks & Opportunities (in-degree = 3+, strategic implications)
    {
      id: 'regulatory_arbitrage',
      label: 'Regulatory Arbitrage',
      type: 'RISK',
      confidence: 0.78,
      metadata: {
        sources: ['Financial Times', 'World Economic Forum Risk Report'],
        description: 'AI development shifting to jurisdictions with lax regulations, creating uneven global standards.',
        category: 'Strategic'
      }
    },
    {
      id: 'talent_drain',
      label: 'Talent Drain from EU',
      type: 'RISK',
      confidence: 0.81,
      metadata: {
        sources: ['McKinsey Talent Survey', 'European AI Talent Report'],
        description: 'AI researchers and developers relocating to more innovation-friendly jurisdictions.',
        category: 'Human Capital'
      }
    },
    {
      id: 'trust_opportunity',
      label: 'Trust & Adoption Opportunity',
      type: 'OPPORTUNITY',
      confidence: 0.89,
      metadata: {
        sources: ['Edelman Trust Barometer', 'PwC Global AI Survey'],
        description: 'Well-regulated AI markets experiencing 40% faster consumer adoption rates.',
        category: 'Market'
      }
    },
    {
      id: 'ethical_ai_leadership',
      label: 'Ethical AI Leadership',
      type: 'OPPORTUNITY',
      confidence: 0.85,
      metadata: {
        sources: ['World Economic Forum', 'Global AI Ethics Consortium'],
        description: 'First-mover advantage for companies establishing ethical AI standards and practices.',
        category: 'Strategic'
      }
    }
  ],

  edges: [
    // Sources → Regulations (Foundational concepts enabling regulatory frameworks)
    {
      id: 'foundations_eu_act',
      source: 'ai_foundations',
      target: 'eu_ai_act',
      relation: 'enables',
      weight: 0.9,
      evidence: ['EU AI Act references technical risk categories'],
      relationshipType: 'INFLUENCES'
    },
    {
      id: 'foundations_us_bill',
      source: 'ai_foundations',
      target: 'us_ai_bill_rights',
      relation: 'informs',
      weight: 0.85,
      evidence: ['US policy documents cite technical capabilities'],
      relationshipType: 'INFLUENCES'
    },
    {
      id: 'society_eu_act',
      source: 'society_impact',
      target: 'eu_ai_act',
      relation: 'drives',
      weight: 0.95,
      evidence: ['EU policy responses to public concerns'],
      relationshipType: 'CAUSES'
    },
    {
      id: 'society_us_bill',
      source: 'society_impact',
      target: 'us_ai_bill_rights',
      relation: 'influences',
      weight: 0.9,
      evidence: ['US policy addresses bias and discrimination'],
      relationshipType: 'INFLUENCES'
    },
    {
      id: 'economic_gdpr',
      source: 'economic_potential',
      target: 'gdpr_ai_amendments',
      relation: 'triggers',
      weight: 0.8,
      evidence: ['GDPR updates respond to economic AI growth'],
      relationshipType: 'CAUSES'
    },

    // Regulations → Impacts (Direct regulatory consequences)
    {
      id: 'eu_act_compliance',
      source: 'eu_ai_act',
      target: 'compliance_costs',
      relation: 'increases',
      weight: 0.9,
      evidence: ['EU companies report compliance cost increases'],
      relationshipType: 'CAUSES'
    },
    {
      id: 'us_bill_innovation',
      source: 'us_ai_bill_rights',
      target: 'innovation_slowdown',
      relation: 'delays',
      weight: 0.75,
      evidence: ['US companies cite regulatory uncertainty'],
      relationshipType: 'INFLUENCES'
    },
    {
      id: 'gdpr_market',
      source: 'gdpr_ai_amendments',
      target: 'market_consolidation',
      relation: 'accelerates',
      weight: 0.85,
      evidence: ['SMBs struggle with GDPR compliance costs'],
      relationshipType: 'CAUSES'
    },
    {
      id: 'eu_act_protection',
      source: 'eu_ai_act',
      target: 'consumer_protection',
      relation: 'enhances',
      weight: 0.9,
      evidence: ['EU consumers report increased AI trust'],
      relationshipType: 'REGULATES'
    },

    // Impacts → Risks/Opportunities (Strategic implications)
    {
      id: 'costs_arbitrage',
      source: 'compliance_costs',
      target: 'regulatory_arbitrage',
      relation: 'drives',
      weight: 0.85,
      evidence: ['Companies relocating to avoid high costs'],
      relationshipType: 'CAUSES'
    },
    {
      id: 'slowdown_talent',
      source: 'innovation_slowdown',
      target: 'talent_drain',
      relation: 'causes',
      weight: 0.8,
      evidence: ['Researchers moving to more innovative markets'],
      relationshipType: 'CAUSES'
    },
    {
      id: 'protection_trust',
      source: 'consumer_protection',
      target: 'trust_opportunity',
      relation: 'creates',
      weight: 0.9,
      evidence: ['Regulated markets show higher adoption rates'],
      relationshipType: 'MEDIATES'
    },
    {
      id: 'consolidation_leadership',
      source: 'market_consolidation',
      target: 'ethical_ai_leadership',
      relation: 'enables',
      weight: 0.75,
      evidence: ['Large players setting industry standards'],
      relationshipType: 'DEPENDS_ON'
    },

    // Cross-column relationships (complex interactions)
    {
      id: 'foundations_trust',
      source: 'ai_foundations',
      target: 'trust_opportunity',
      relation: 'underpins',
      weight: 0.7,
      evidence: ['Technical reliability builds consumer trust'],
      relationshipType: 'MEDIATES'
    },
    {
      id: 'society_arbitrage',
      source: 'society_impact',
      target: 'regulatory_arbitrage',
      relation: 'exacerbates',
      weight: 0.65,
      evidence: ['Public pressure varies by jurisdiction'],
      relationshipType: 'INFLUENCES'
    }
  ]
};

/**
 * Pre-configured AI Regulation Policy Analysis
 * Ready-to-use Knowledge Graph for demonstration
 */
export const createAiRegulationPolicyGraph = (): { nodes: KnowledgeNode[]; edges: KnowledgeEdge[] } => {
  return {
    nodes: aiRegulationPolicySeed.nodes.map(node => ({ ...node })),
    edges: aiRegulationPolicySeed.edges.map(edge => ({ ...edge }))
  };
};