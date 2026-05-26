# ACTIVE PLAN

> Single source of truth for "which plan is currently being worked on".
> Any agent (Codex CLI, Claude Code, Gemini CLI, GitHub Copilot) resuming
> work should read this file first, then jump to the plan it points at.

## Current

- **Plan:** [plan-027-v1.1-scoping](./plan-027-v1.1-scoping/plan.md)
- **Status:** `draft`
- **Next action owner:** Planner Agent — begin
  `stage-001-pipeline-foundation/phase-001-orchestrator-contract/part-001-define-pipeline-contract`.

## Recently completed

- [plan-024-v1-final-mile](./archive/plan-024-v1-final-mile/plan.md) —
  V1 DoD closure & release engineering. Closed 2026-05-26 with 47/47 DoD
  items satisfied. Three stages (release-engineering, ollama+shortcuts,
  docs-rebaseline) deferred-to-v1.1. See
  [CLOSEOUT.md](./archive/plan-024-v1-final-mile/CLOSEOUT.md).

## Deferred to V1.1

- [plan-019-naming-consistency](./archive/plan-019-naming-consistency/plan.md) —
  Codebase-wide naming alignment. Never executed. See
  [CLOSEOUT.md](./archive/plan-019-naming-consistency/CLOSEOUT.md).
- [plan-021-reader-pagination](./archive/plan-021-reader-pagination/plan.md) —
  Reader empty state + pagination engine. Never executed. See
  [CLOSEOUT.md](./archive/plan-021-reader-pagination/CLOSEOUT.md).
- plan-024 stages 002 (release engineering), 003 (ollama & shortcuts),
  006 (docs re-baseline).

## How to resume

1. Read this file. The `Current` plan is the default target unless the
   user explicitly names a different slug.
2. Open the current plan's `plan.md` and find the first stage whose
   `status` is not `complete`. That is the next stage to work on.
3. Inside that stage, find the first phase (or, if phases are not yet
   populated, scaffold them from `_templates/phase.template.md`).
