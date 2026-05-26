---
title: AI Surface Ship-or-Cut Decision
slug: stage-005-ai-surface-decision
stage_number: 5
status: complete
owner: AI Agent
plan: plan-024-v1-final-mile
phases: []
estimated_duration: 1.5d
risk_level: low
closed: 2026-05-26
closed_by: supersession
superseded_by: plan-025-functional-after-build
---

## Closeout (2026-05-26)

**Cut path executed by plan-025-functional-after-build** (closed 2026-05-13).

Verified on master 2026-05-26:

- `src/lib/ai/types.ts` `TaskType` union now contains only `continue`,
  `rewrite`, `continuity_check`, `edit`, `style_check`, `chat`. The four
  unimplemented TaskTypes (`brainstorm`, `outline`, `draft`, `summarize`)
  have been removed.
- `AGENTS.md` carries the explicit "Cut from V1 (2026-05-13, plan-025)"
  note for `BrainstormAgent`, `OutlineAgent`, `DraftAgent`, `SummaryAgent`.
- `dev-docs/03-ai/agents-map.md` is the canonical breakdown of the 4
  shipped agents (Continuity, Edit, Rewrite, Style).

The "Fix a Scene" Continuity → Rewrite → Edit composed-task surface from
the original ship path is **not** wired and is explicitly out of V1 scope.
If it is desired post-V1, open a new plan; do not reopen this stage.

## Goal

Make the runtime-agent surface match reality before tagging V1.

Today, [`src/lib/ai/types.ts`](../../../../src/lib/ai/types.ts)
declares TaskTypes for `brainstorm`, `outline`, `draft`, and
`summarize`, but no parser modules exist. AGENTS.md describes a
"Fix a Scene" Continuity → Rewrite → Edit pipeline that the
task-resolver does not actually compose. Pick one of two paths:

- **Ship path:** implement parsers and prompt entries for
  `OutlineAgent` and `SummaryAgent` (the cheapest two), and
  compose Continuity → Rewrite chaining behind a single
  `fix_scene` task. Leave Brainstorm and Draft as documented
  follow-ups.
- **Cut path:** remove `brainstorm`, `outline`, `draft`, and
  `summarize` from the public TaskType union and from
  `agents-map.md`, replacing them with a single "Future agents"
  paragraph that reflects post-V1 intent.

## Entry Criteria

- All shipped agents (Continuity, Edit, Rewrite, Style) still
  pass their parser tests on `master`.

## Exit Criteria

- A decision is recorded in [`agents-map.md`](../../../03-ai/agents-map.md)
  with a one-line rationale and the date.
- If **ship path**: `OutlineAgent` and `SummaryAgent` modules
  exist, are wired through `task-resolver.ts` and the prompt
  registry, have parser tests covering happy + malformed cases,
  and Continuity → Rewrite chains through a documented composed
  task. AGENTS.md's "Fix a Scene" example must run end-to-end.
- If **cut path**: removed TaskTypes no longer appear in
  `types.ts`, `agents-map.md`, AGENTS.md, or any test fixture;
  `pnpm check` still passes.

## Notes

- Either path is reversible — the goal is honesty in the public
  surface. A tagged V1 should not advertise agents that crash
  when invoked.
- If choosing the ship path, keep prompts within the existing
  ROLE → TASK → CONTEXT → CONSTRAINTS → OUTPUT shape; do not
  invent a new prompt convention.
