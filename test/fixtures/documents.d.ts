/**
 * Test document fixtures for various test scenarios
 */
export declare const SMALL_BUSINESS_REPORT = "# Q4 Business Report\n\n## Executive Summary\nRevenue increased by 15% this quarter, reaching $2.5M. Customer acquisition cost decreased by 20%.\n\n## Key Metrics\n- Revenue: $2.5M\n- Growth: 15%\n- CAC: $150\n- Churn: 3%\n\n## Risks\n- Market competition increasing\n- Supply chain delays\n\n## Opportunities\n- New market expansion\n- Product line extension";
export declare const PROCESS_DOCUMENT = "# Employee Onboarding Process\n\n## Step 1: Pre-boarding\nWhen a new employee accepts the offer, HR sends welcome email.\n\n## Step 2: First Day\nIf the employee arrives on time, then:\n- IT sets up workstation\n- Manager conducts orientation\n- HR completes paperwork\n\nOtherwise, reschedule orientation.\n\n## Step 3: Training\nThe employee completes:\n1. Security training\n2. Product training\n3. Team introductions\n\n## Step 4: Review\nAfter 30 days, manager conducts performance review.";
export declare const TECHNICAL_SPEC = "# API Specification\n\n## User Service\n\n### Class: UserController\n- Attributes:\n  - userRepository: UserRepository\n  - authService: AuthService\n- Methods:\n  + createUser(data: UserData): User\n  + getUser(id: string): User\n  + updateUser(id: string, data: UserData): User\n\n### Sequence: User Registration\n1. Client sends POST /users\n2. UserController validates data\n3. UserController calls AuthService.hashPassword()\n4. UserController calls UserRepository.save()\n5. UserRepository returns User\n6. UserController returns 201 Created";
export declare const QUANTITATIVE_REPORT = "# Financial Analysis\n\n## Revenue Breakdown\n- Q1: $1.2M (10% growth)\n- Q2: $1.5M (25% growth)\n- Q3: $1.8M (20% growth)\n- Q4: $2.5M (39% growth)\n\n## Cost Structure\n- COGS: $800K (32% of revenue)\n- Marketing: $400K (16% of revenue)\n- R&D: $300K (12% of revenue)\n- Operations: $200K (8% of revenue)\n\n## Projections\n- Best case: $12M annual revenue\n- Base case: $10M annual revenue\n- Conservative: $8M annual revenue\n\nROI: 150% over 3 years";
export declare const GLOSSARY_HEAVY = "# Medical Device Specification\n\n## Overview\nThe ECG (Electrocardiogram) device monitors cardiac activity using non-invasive electrodes.\n\n## Technical Details\nThe device uses ADC (Analog-to-Digital Converter) to process signals at 1000 Hz sampling rate.\nQRS complex detection identifies ventricular depolarization.\n\n## Safety\nFDA (Food and Drug Administration) approval required.\nISO 13485 compliance mandatory for medical devices.\n\n## Acronyms\n- ECG: Electrocardiogram\n- ADC: Analog-to-Digital Converter\n- FDA: Food and Drug Administration\n- ISO: International Organization for Standardization\n- QRS: Q wave, R wave, S wave complex";
export declare const HIERARCHICAL_DOCUMENT = "# Software Architecture Guide\n\n## 1. Introduction\nThis guide covers system architecture.\n\n### 1.1 Purpose\nDefine architectural patterns.\n\n### 1.2 Scope\nCovers backend and frontend.\n\n## 2. Backend Architecture\n\n### 2.1 API Layer\nRESTful API design.\n\n#### 2.1.1 Authentication\nJWT-based authentication.\n\n#### 2.1.2 Authorization\nRole-based access control.\n\n### 2.2 Business Logic\nService layer pattern.\n\n### 2.3 Data Layer\nRepository pattern with ORM.\n\n## 3. Frontend Architecture\n\n### 3.1 Component Structure\nReact component hierarchy.\n\n### 3.2 State Management\nZustand for global state.";
export declare const EMPTY_DOCUMENT = "";
export declare const MALFORMED_DOCUMENT = "# Heading without content\n\n## Another heading\n\nSome text with <script>alert('xss')</script> embedded.\n\n### Heading ### with ### extra ### hashes\n\nRandom text without structure...\nMore random text...";
export declare const INVALID_CONTENT: Buffer<ArrayBuffer>;
export declare const LARGE_DOCUMENT: string;
/**
 * Helper to create test documents with specific characteristics
 */
export declare function createTestDocument(options: {
    wordCount?: number;
    headingCount?: number;
    hasNumbers?: boolean;
    hasProcessLanguage?: boolean;
    hasTechnicalTerms?: boolean;
}): string;
//# sourceMappingURL=documents.d.ts.map