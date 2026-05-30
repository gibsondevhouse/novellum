---
title: World Building Workflow Refactor
slug: plan-034
version: 1.0.0
status: draft
owner: Planner Agent
created: 2026-05-30
last_updated: 2026-05-30
target_completion: 2026-06-20
stages:
  - stage-001-foundation-refactor
  - stage-002-ui-integration
  - stage-003-generation-pipeline
  - stage-004-hardening-polish
dependencies:
  - plan-031-nova-vscode-copilot-parity
  - plan-032-worldbuilding-generation-engine
quality_gates:
  - lint
  - typecheck
  - tests
  - tokens
  - docs_sync
---

## Objective

Refactor World Building from a mixed informational/navigation page into a guided Nova-powered generation workspace. The workflow should make generation order explicit, add per-domain generation affordances, and preserve review-gated canon safety so generated output is staged and accepted by the author before projection into canonical tables.

## Scope

**In scope:**

- Extract worldbuilding educational/help content from route-level UI into dedicated world-building help module surfaces.
- Define a reusable, static workflow config for ordered worldbuilding generation:
  Personae → Atlas → Archive → Threads → Chronicles.
- Add section-level Generate actions with domain-specific prompt seeds and readiness gating.
- Ship phased behavior:
  - Stage 002: Generate actions open Nova with scoped prefilled prompts (non-mutating).
  - Stage 003: Generate actions create reviewable domain-scoped proposals/checkpoints.
- Implement accept/reject flow where only explicit accept projects into canon.
- Add production states (`idle`, `missing-context`, `queued`, `running`, `review-ready`, `accepted`, `rejected`, `failed`) and error handling.
- Enforce guardrails: server-side model access, schema validation, provenance display, no silent writes.

**Out of scope:**

- Direct generate-and-write canon behavior without review.
- Full new database schema redesign for worldbuilding tables.
- Editor-side worldbuilding panels and manuscript-context generation UX.
- Export integration changes (EPUB/DOCX) tied to worldbuilding outputs.
- Rebuilding unrelated Story Bible surfaces or factions route completion not required by this plan.

## Stages

| # | Stage | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Foundation Refactor](stage-001-foundation-refactor/stage.md) | `draft` | 4d |
| 002 | [UI Integration](stage-002-ui-integration/stage.md) | `draft` | 4d |
| 003 | [Generation Pipeline](stage-003-generation-pipeline/stage.md) | `draft` | 6d |
| 004 | [Hardening & Polish](stage-004-hardening-polish/stage.md) | `draft` | 4d |

## Quality Gates

All stages must pass the following gates before the plan is marked `complete`:

- [ ] **lint** — zero lint errors (`pnpm lint` and `pnpm lint:css`)
- [ ] **typecheck** — zero type errors (`pnpm check`)
- [ ] **tests** — all tests pass (`pnpm test`)
- [ ] **tokens** — token enforcement passes (`pnpm check:tokens`)
- [ ] **docs_sync** — planning docs and implementation docs updated

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Generate action semantics drift back toward silent writes | medium | Keep staging and accept-projection contract explicit in types, tests, and UI copy |
| Workflow order duplicated across UI and pipeline | medium | Centralize order/dependency metadata in `worldbuilding-workflow.ts` and reference it everywhere |
| Section-level generation fails when upstream context is sparse | medium | Implement `missing-context` gating with explicit dependency messaging before execution |
| Schema mismatch between generated output and artifact envelope | medium | Validate every domain proposal with strict schema before storing review artifact |
| Surface complexity regresses accessibility/usability | low | Maintain action consistency (open/help/generate), keyboard paths, and clear state badges |

## Notes

This plan is intentionally staged to separate low-risk UX refactor from medium-risk generation pipeline work:

- Stage 001 and Stage 002 establish architecture and affordances without mutation risk.
- Stage 003 introduces proposal artifacts and review-accept behavior.
- Stage 004 hardens safety constraints and verification to production standards.

The primary safety principle is unchanged: Nova may propose canon, but only the author can accept canon.
