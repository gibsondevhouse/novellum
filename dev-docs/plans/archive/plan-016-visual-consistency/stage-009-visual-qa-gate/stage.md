---
title: Visual QA Gate
slug: stage-009-visual-qa-gate
stage_number: 9
status: complete
owner: Reviewer Agent
plan: plan-016-visual-consistency
phases:
  - phase-001-evidence-capture
  - phase-002-gate-verification
estimated_duration: 2d
risk_level: low
closed_at: 2026-04-28
---

## Goal

Prove, with screenshots and command output, that Novellum feels like one coherent product across every surface in the research brief's Visual QA Checklist, and that every automated gate passes.

## Phases

| #   | Phase                                                             | Status                   | Est. Duration |
| --- | ----------------------------------------------------------------- | ------------------------ | ------------- |
| 001 | [Visual Evidence Capture](phase-001-evidence-capture/phase.md)    | `complete (transferred)` | 1d            |
| 002 | [Quality Gate Verification](phase-002-gate-verification/phase.md) | `complete`               | 1d            |

## Entry Criteria

- Stages 002–008 complete.

## Exit Criteria

- Screenshot matrix captured for every surface in the research brief's Visual QA Checklist: Dashboard, Editor, Outliner, Arc / Act / Chapter / Scene workspaces, Story Bible, entity detail, entity create, Consistency Engine, AI Assistant, Export, Settings, empty state, error state, loading state, narrow layout.
- All automated gates pass: `pnpm run lint`, `pnpm run check`, `pnpm run test`, `node scripts/check-visual-tokens.mjs`, `eslint-plugin-boundaries` clean.
- Reviewer and Stylist sign off on the evidence matrix; plan-level `status` flips to `complete`.

## Notes

- The Reviewer agent owns the final sign-off. Disagreements default to canonical rules produced in Stage 001.
- Visual evidence is captured via Playwright visual tests where present and manual screenshots where not.

## Status Note

Closed 2026-04-28. phase-002 (automated gate run) was already complete with green output captured. phase-001 (screenshot matrix) was closed via transfer to [plan-018 stage-012 — QA, Performance, Beta, & DoD](../../plan-018-v1-product-experience/stage-012-qa-performance-beta-and-dod/stage.md): capturing screenshots now would be invalidated by the editor / AI / export rebuilds in plan-018, and plan-018 stage-012 already requires Playwright e2e + visual coverage as part of V1 Definition of Done.
