## Scenario Overview

This document clarifies how the staged development plan accommodates the two distinct product‑development contexts you described:

### 1. Greenfield / Backend‑First Scenario (New Product from Scratch)

- **When to use:** You are creating a product that did not exist before and want to leverage AI agents for rapid backend generation.
- **Execution rhythm:**
  1. **Requirements → Architecture → Backend prototyping → Testing → Merge** (Stages 02‑07).
  2. UI is **deferred** until the backend is stable and signed‑off.
  3. A thin “draft UI” may be added only as a testing façade; the **solid web UI** and **mobile UI** are built later as separate, dedicated stages.
- **Stage modifications:**
  - `stage-03-ux-ui-design-plan.md` – UI work is marked as *deferred*; only placeholder tokens and documentation of deferred UI are added.
  - `stage-04-architecture-design-plan.md` – Emphasis on backend service boundaries, API contracts, and data model; UI design explicitly noted as deferred.
  - `stage-05-prototyping-validation-plan.md` – Prototype focuses on backend services; UI is mentioned only as a minimal placeholder.
  - `stage-07-incremental-development-plan.md` – Backlog pull‑order prioritizes backend features; UI implementation is optional and postponed.

### 2. Evolutionary / Parallel‑Delivery Scenario (Existing Product)

- **When to use:** The product already exists and must evolve through continuous, iterative releases. Both backend and UI must be delivered together to maintain user experience.
- **Execution rhythm:**
  1. Backlog items include **both** backend and frontend work.
  2. Sprints are **cross‑functional**; UI/UX design, implementation, and testing happen in the same sprint as backend development.
  3. Feedback loops (UAT, analytics, usability testing) feed directly into subsequent sprint planning.
- **Stage modifications:** (No explicit stage changes needed; the existing stages already support parallel work. The key is to treat **all** approved backlog items—whether backend or UI—as “Ready for Development” and to run the full CI/CD pipeline on each PR.)

### Mapping Scenarios to the Stage Sequence

| Stage | Primary Focus | Greenfield Emphasis | Evolutionary Emphasis |
|-------|----------------|---------------------|-----------------------|
| **02 – Requirements & Backlog** | Capture PRD, personas, success metrics | Backend‑centric epics (API, data model) | Mixed backlog (backend + UI) |
| **03 – UX/UI Design** | UI design | Deferred; only placeholder tokens | UI design performed in dedicated sprint(s) |
| **04 – Architecture** | Backend service boundaries, API contracts | Backend‑first architecture; UI deferred | Architecture supports mixed services; UI‑related endpoints still defined |
| **05 – Prototyping** | Build backend prototype | Full backend prototype; UI only thin façade | Prototype may include UI spikes, but both sides evolve together |
| **06 – Dev Environment** | Setup dev environment | Add backend services, mock payment/gateway, etc. | Same environment also runs UI tooling (e.g., webpack dev server) |
| **07 – Incremental Development** | Implement backend features | Prioritize backend items; UI stubs optional | Implement backend **and** UI items in same sprint |
| **08 – Testing QA** | Test backend APIs, performance, security | Test backend heavily; UI tests limited to API contract tests | Full end‑to‑end UI + backend tests executed |
| **09 – CI/CD** | Build, test, deploy backend | Deploy backend artifacts; UI assets may be built later | Deploy both backend and UI artifacts; feature‑flag rollout of UI |
| **10‑14 – Staging → Production** | Validate, release, monitor | Focus on backend stability, backend‑centric metrics | Full stack validation (UI + backend) and user‑facing metrics |

### How to Use This Document

- **Select the scenario** that matches your current product context.
- **Follow the corresponding stage emphasis** outlined above.
- **Adjust backlog grooming** accordingly (e.g., keep UI stories deferred in greenfield, keep them alongside backend stories in evolutionary mode).
- **Update the stage markdown files** as needed; the modifications already applied (see the “Deferred UI” notes in `stage-03‑ux-ui-design-plan.md`, `stage-04‑architecture-design-plan.md`, `stage-05‑prototyping-validation-plan.md`, and `stage-07‑incremental-development-plan.md`).

If you need a more concrete artifact—such as a checklist or a mapping table embedded directly into each stage file—just let me know and I can append it to the relevant markdown documents.
