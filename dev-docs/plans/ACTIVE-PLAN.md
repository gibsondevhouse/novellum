# ACTIVE PLAN

> Single source of truth for "which plan is currently being worked on".
> Any agent (Codex CLI, Claude Code, Gemini CLI, GitHub Copilot) resuming
> work should read this file first, then jump to the plan it points at.

## Current

- No active plan.

## Recently completed

- [plan-030-nova-production-refactor](./plan-030-nova-production-refactor/plan.md) —
  Nova Production Refactor. Closed 2026-05-28 with all 4 stages complete.
  Quality gates: `pnpm run check`, `pnpm run lint`, `pnpm run lint:css`,
  and `pnpm run test` passed (`190` files / `1299` tests). Full
  `pnpm run test:visual` reported existing cross-surface snapshot drift;
  targeted Nova visual specs were run as substitution (`2` passed, `3` skipped).
- [plan-029-v1.1-unfinished-work-closeout](./plan-029-v1.1-unfinished-work-closeout/plan.md) —
  V1.1 Unfinished Work Closeout. Closed 2026-05-27 with all 4 stages
  complete. Retired plan-019 (naming consistency — superseded by organic
  evolution), plan-021 (reader pagination — shipped via plans 027/028),
  and plan-024 stage-003 (Ollama & shortcuts — shipped). Executed plan-024
  stage-006 docs rebaseline at reduced scope. Deferred plan-024 stage-002
  (release engineering) to a dedicated release plan. Quality gates: 187
  files / 1270 tests passing; token guard 325 files / 0 violations.
- [plan-028-v1.1-hierarchical-pipeline-ui](./plan-028/plan.md) —
  V1.1 Hierarchical Pipeline UI. Closed 2026-05-26 with all four stages
  complete. Final vitest baseline: 187 files / 1268 tests passing.
- [plan-027-v1.1-scoping](./plan-027-v1.1-scoping/plan.md) —
  V1.1 Fiction Pipeline Scoping & Delivery. Closed 2026-05-27 with
  all three stages complete. Final vitest baseline: 177 files / 1156 tests.
- [plan-024-v1-final-mile](./archive/plan-024-v1-final-mile/plan.md) —
  V1 DoD closure. Closed 2026-05-26 with 47/47 DoD items satisfied.
  Deferred stages fully resolved by plan-029.

## How to resume

1. Read this file. If `Current` says "No active plan", ask the user
   what to work on next.
2. Open the current plan's `plan.md` and find the first stage whose
   `status` is not `complete`. That is the next stage to work on.
3. Inside that stage, find the first phase (or, if phases are not yet
   populated, scaffold them from `_templates/phase.template.md`).
