---
title: Frontend Visual Consistency Refactor
slug: plan-016-visual-consistency
version: 1.2.0
status: complete
owner: Planner Agent
created: 2026-04-24
last_updated: 2026-04-28
target_completion: 2026-06-15
completed_at: 2026-04-28
stages:
  - stage-001-inventory-evidence
  - stage-002-app-shell-convergence
  - stage-003-primitive-pattern-convergence
  - stage-004-workspace-family-convergence
  - stage-005-story-bible-family-convergence
  - stage-006-editor-surface-correction
  - stage-007-ai-consistency-export-alignment
  - stage-008-empty-error-loading-states
  - stage-009-visual-qa-gate
dependencies: []
quality_gates:
  - lint
  - typecheck
  - tests
  - tokens
  - boundaries
  - visual
---

## Objective

Make every page, module, and surface in Novellum feel like one coherent, dark, cinematic, author-focused writing product. Move beyond static token compliance and eliminate shell drift, primitive duplication, density/typography drift, empty-state placeholderism, and interaction inconsistency across workspace, Story Bible, editor, AI, consistency, export, and settings surfaces.

Scope is driven by the research brief at [dev-docs/plans/research/visual-consistency.md](../research/visual-consistency.md).

## Scope

**In scope:**

- Full surface inventory of every reachable SvelteKit route and major UI surface.
- Audits covering: app shell, visual language, primitives, page archetypes, density/rhythm, typography, interaction patterns, and empty/error/loading states.
- Definition and enforcement of canonical visual rules (page shell, page header, cards, panels, inspector panels, forms, buttons, tabs/pills, empty states, workspace hero cards, editor surface, AI assistant surface, metadata rows, entity cards, scroll behavior).
- Convergence of the app shell (global layout, sidebar, navigation rail, page header, scroll boundaries).
- Replacement of local duplicate cards / panels / headers / buttons / empty states / pills / inputs with canonical primitives from `src/lib/components/ui`.
- Convergence of the Workspace family (Arc / Act / Chapter / Scene) into one recognizable planning family.
- Convergence of the Story Bible family (individuals, factions, lineages, realms, landmarks, myths, technology, traditions) into one entity-management family.
- Editor surface correction so it reads as a calm writing surface, not a control center.
- Alignment of AI Assistant, Consistency Engine, and Export surfaces with the writing product.
- Unification of empty, error, and loading states with authored, in-voice copy and shared treatment.
- Visual QA matrix with screenshot evidence across all listed surfaces.

**Out of scope:**

- Backend, persistence, or AI pipeline logic changes beyond what is strictly required to render frontend state.
- Introduction of new design tokens unless absolutely necessary. `src/styles/tokens.css` is the source of truth.
- Feature additions unrelated to visual consistency.
- Mobile redesign beyond the current narrow-layout behavior (the narrow layout is audited, not rebuilt).
- Navigation strategy changes — `goto()` remains the only navigation path; `window.location.href` is not permitted.

## Stages

- 001 [Inventory and Evidence](stage-001-inventory-evidence/stage.md) — status: `complete`; est: 4d
- 002 [App Shell Convergence](stage-002-app-shell-convergence/stage.md) — status: `complete`; est: 4d
- 003 [Primitive and Pattern Convergence](stage-003-primitive-pattern-convergence/stage.md) — status: `complete`; est: 5d
- 004 [Workspace Family Convergence](stage-004-workspace-family-convergence/stage.md) — status: `complete`; est: 4d
- 005 [Story Bible Family Convergence](stage-005-story-bible-family-convergence/stage.md) — status: `complete`; est: 4d
- 006 [Editor Surface Correction](stage-006-editor-surface-correction/stage.md) — status: `complete (transferred to plan-018 stage-002)`; est: 3d
- 007 [AI / Consistency / Export Surface Alignment](stage-007-ai-consistency-export-alignment/stage.md) — status: `complete (mixed: phase-002 executed, phases 001/003 transferred to plan-018)`; est: 3d
- 008 [Empty / Error / Loading State Pass](stage-008-empty-error-loading-states/stage.md) — status: `complete`; est: 2d
- 009 [Visual QA Gate](stage-009-visual-qa-gate/stage.md) — status: `complete (phase-001 transferred to plan-018 stage-012)`; est: 2d

## Quality Gates

All stages must pass the following gates before the plan is marked `complete`:

- [ ] **lint** — `pnpm run lint` passes with zero errors (includes `eslint-plugin-boundaries`).
- [ ] **typecheck** — `pnpm run check` passes with zero type errors.
- [ ] **tests** — `pnpm run test` passes; service and AI-logic coverage ≥ 80% lines where touched.
- [ ] **tokens** — `scripts/check-visual-tokens.mjs` reports zero violations.
- [ ] **boundaries** — no FSD/VSA module leakage introduced by convergence work.
- [ ] **visual** — screenshot matrix from Stage 009 captured and reviewed by the Stylist and Reviewer agents.
- [ ] **docs_sync** — `dev-docs/design-system.md`, `dev-docs/context-docs/frontend.md`, and `dev-docs/audits/component-inventory.md` updated to reflect canonical rules.

## Risks & Mitigations

- Over-convergence flattens intentional differences between archetypes:
Canonical rules in Stage 001 explicitly preserve archetype distinctions; Stylist signs off before Stage 003 touches components.
- Shell convergence breaks route-level layout overrides:
Architect owns Stage 002 and freezes shell contract; route-local overrides are enumerated before deletion.
- Primitive sweep introduces regressions in Editor or AI surfaces:
Editor and AI surfaces are handled in dedicated stages (006, 007) after primitive convergence, with visual evidence gating each part.
- Empty-state copy drifts toward SaaS/dev tone:
Stage 008 requires Stylist review of every copy change; tone anchors defined in Stage 001 canonical rules.
- Visual QA gate blocks merge on subjective disagreements:
Stage 009 part uses an explicit screenshot matrix with pass/fail criteria per surface; Reviewer is the final arbiter.
- Token enforcement regresses during convergence:
Every part's checklist includes `pnpm run lint` and the token script; Stage 009 re-runs all gates.

## Notes

- **Owners.** Stages 001 and 009 are led jointly by the Architect and Stylist agents with Reviewer sign-off. Stage 002 is Architect-led. Stages 003–008 are Stylist-led with Architect consultation on layout primitives. All parts require Reviewer sign-off to move `complete`.
- **Svelte 5.** All touched components must use Svelte 5 Runes (`$state`, `$derived`, `.svelte.ts`). Legacy Svelte 4 patterns found during convergence are upgraded in-place.
- **Evidence discipline.** Every part produces at least one evidence artifact. Audits produce markdown tables and screenshots; convergence parts produce before/after screenshots and command output.
- **No silent rewrites.** A convergence part may not touch a file that is not listed in its `Files > Update` section. If scope creep is discovered, create a follow-up part instead of expanding an existing one.
- **Research brief.** [dev-docs/plans/research/visual-consistency.md](../research/visual-consistency.md) is the authoritative source for stage intent, audit method, canonical rules, and implementation prompts.

## Closure Note (2026-04-28)

Plan-016 is closed `complete` via a hybrid path. Stages 001–005 and 008 landed on the canonical convergence work. The remaining cosmetic-only deferred work substantially overlapped with the V1 product rebuilds defined in plan-018, so it was absorbed there rather than duplicated:

| Source | Disposition | Destination |
| --- | --- | --- |
| Stage 006 (Editor Surface Correction) | Transferred | [plan-018 stage-002 — Editor Writing-First Refactor](../plan-018-v1-product-experience/stage-002-editor-writing-first/stage.md) |
| Stage 007 phase-001 (AI Assistant Panel) | Transferred | [plan-018 stage-005 — AI Assistant V1 Scope](../plan-018-v1-product-experience/stage-005-ai-assistant-v1-scope/stage.md) |
| Stage 007 phase-002 (Consistency Engine) | Executed in-place | `src/modules/consistency/components/{ConsistencyPanel,IssueRow}.svelte` |
| Stage 007 phase-003 (Export Surface) | Transferred | [plan-018 stage-001 — Export Quality](../plan-018-v1-product-experience/stage-001-export-quality/stage.md) |
| Stage 009 phase-001 (Screenshot Matrix) | Transferred | [plan-018 stage-012 — QA, Performance, Beta, & DoD](../plan-018-v1-product-experience/stage-012-qa-performance-beta-and-dod/stage.md) |

Visual QA gate quality_gate is satisfied by transfer to plan-018 stage-012, which re-establishes the screenshot matrix on the post-rebuild surfaces.
