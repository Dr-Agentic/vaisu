# Revise-Commit Process

## Overview
This document outlines the step‑by‑step procedure for reviewing, testing, linting, building, committing, and pushing changes in a headless manner.

## Detailed Steps
1. **Fetch Latest Changes**
   ```bash
   git fetch origin
   git checkout main
   git pull --rebase
   ```
2. **Check Compliance**
   - Verify all compliance checklist items.
   - Run compliance script: `./scripts/compliance-check.sh`.
3. **Run Tests**
   ```bash
   npm run test:ci
   ```
4. **Linting**
   ```bash
   npm run lint:ci
   ```
5. **Build – Development**
   ```bash
   npm run build:dev
   ```
6. **Build – Production**
   ```bash
   npm run build:prod
   ```
7. **Commit Changes**
   ```bash
   git add .
   git commit -m \"Reviewed changes: compliance, tests, lint, dev & prod builds\"
   ```
8. **Push**
   ```bash
   git push origin HEAD
   ```
9. **Post‑Push Validation**
   - Trigger CI and monitor status.

## Headless Mode Considerations
- Use CI scripts (`*:ci`) or set `CI=true` to avoid interactive prompts.
- For pushing, use a token stored in `~/.git-credentials` if authentication is required.
- Ensure no prompts appear; halt on any error.

## Exit Criteria
- Success only if all steps complete without errors; otherwise abort and report.
