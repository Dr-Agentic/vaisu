/**
 * Test document fixtures for various test scenarios
 */
export const SMALL_BUSINESS_REPORT = `# Q4 Business Report

## Executive Summary
Revenue increased by 15% this quarter, reaching $2.5M. Customer acquisition cost decreased by 20%.

## Key Metrics
- Revenue: $2.5M
- Growth: 15%
- CAC: $150
- Churn: 3%

## Risks
- Market competition increasing
- Supply chain delays

## Opportunities
- New market expansion
- Product line extension`;
export const PROCESS_DOCUMENT = `# Employee Onboarding Process

## Step 1: Pre-boarding
When a new employee accepts the offer, HR sends welcome email.

## Step 2: First Day
If the employee arrives on time, then:
- IT sets up workstation
- Manager conducts orientation
- HR completes paperwork

Otherwise, reschedule orientation.

## Step 3: Training
The employee completes:
1. Security training
2. Product training
3. Team introductions

## Step 4: Review
After 30 days, manager conducts performance review.`;
export const TECHNICAL_SPEC = `# API Specification

## User Service

### Class: UserController
- Attributes:
  - userRepository: UserRepository
  - authService: AuthService
- Methods:
  + createUser(data: UserData): User
  + getUser(id: string): User
  + updateUser(id: string, data: UserData): User

### Sequence: User Registration
1. Client sends POST /users
2. UserController validates data
3. UserController calls AuthService.hashPassword()
4. UserController calls UserRepository.save()
5. UserRepository returns User
6. UserController returns 201 Created`;
export const QUANTITATIVE_REPORT = `# Financial Analysis

## Revenue Breakdown
- Q1: $1.2M (10% growth)
- Q2: $1.5M (25% growth)
- Q3: $1.8M (20% growth)
- Q4: $2.5M (39% growth)

## Cost Structure
- COGS: $800K (32% of revenue)
- Marketing: $400K (16% of revenue)
- R&D: $300K (12% of revenue)
- Operations: $200K (8% of revenue)

## Projections
- Best case: $12M annual revenue
- Base case: $10M annual revenue
- Conservative: $8M annual revenue

ROI: 150% over 3 years`;
export const GLOSSARY_HEAVY = `# Medical Device Specification

## Overview
The ECG (Electrocardiogram) device monitors cardiac activity using non-invasive electrodes.

## Technical Details
The device uses ADC (Analog-to-Digital Converter) to process signals at 1000 Hz sampling rate.
QRS complex detection identifies ventricular depolarization.

## Safety
FDA (Food and Drug Administration) approval required.
ISO 13485 compliance mandatory for medical devices.

## Acronyms
- ECG: Electrocardiogram
- ADC: Analog-to-Digital Converter
- FDA: Food and Drug Administration
- ISO: International Organization for Standardization
- QRS: Q wave, R wave, S wave complex`;
export const HIERARCHICAL_DOCUMENT = `# Software Architecture Guide

## 1. Introduction
This guide covers system architecture.

### 1.1 Purpose
Define architectural patterns.

### 1.2 Scope
Covers backend and frontend.

## 2. Backend Architecture

### 2.1 API Layer
RESTful API design.

#### 2.1.1 Authentication
JWT-based authentication.

#### 2.1.2 Authorization
Role-based access control.

### 2.2 Business Logic
Service layer pattern.

### 2.3 Data Layer
Repository pattern with ORM.

## 3. Frontend Architecture

### 3.1 Component Structure
React component hierarchy.

### 3.2 State Management
Zustand for global state.`;
export const EMPTY_DOCUMENT = ``;
export const MALFORMED_DOCUMENT = `# Heading without content

## Another heading

Some text with <script>alert('xss')</script> embedded.

### Heading ### with ### extra ### hashes

Random text without structure...
More random text...`;
// Binary-like content that should be rejected
export const INVALID_CONTENT = Buffer.from([0xFF, 0xFE, 0x00, 0x01, 0x02]);
export const LARGE_DOCUMENT = `# Large Document\n\n` +
    Array(1000).fill('## Section\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(10)).join('\n\n');
/**
 * Helper to create test documents with specific characteristics
 */
export function createTestDocument(options) {
    const { wordCount = 100, headingCount = 3, hasNumbers = false, hasProcessLanguage = false, hasTechnicalTerms = false } = options;
    let content = '# Test Document\n\n';
    for (let i = 0; i < headingCount; i++) {
        content += `## Section ${i + 1}\n\n`;
        const wordsPerSection = Math.floor(wordCount / headingCount);
        const words = [];
        for (let j = 0; j < wordsPerSection; j++) {
            if (hasNumbers && j % 10 === 0) {
                words.push(`${Math.floor(Math.random() * 1000)}`);
            }
            else if (hasProcessLanguage && j % 15 === 0) {
                words.push(['first', 'then', 'next', 'finally', 'if', 'when'][Math.floor(Math.random() * 6)]);
            }
            else if (hasTechnicalTerms && j % 12 === 0) {
                words.push(['API', 'database', 'server', 'client', 'authentication'][Math.floor(Math.random() * 5)]);
            }
            else {
                words.push('word');
            }
        }
        content += words.join(' ') + '.\n\n';
    }
    return content;
}
//# sourceMappingURL=documents.js.map