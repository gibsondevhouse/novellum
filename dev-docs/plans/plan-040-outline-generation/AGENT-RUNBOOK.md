# Plan 040 Agent Runbook

Use this runbook when assigning plan-040 work to Claude Code, Codex, Gemini CLI, Copilot, or another coding agent.

## Non-negotiables

- Read `dev-docs/plans/ACTIVE-PLAN.md` first.
- Open `dev-docs/plans/plan-040-outline-generation/plan.md`.
- Find the first stage/phase/part whose status is not `complete`.
- Complete the part checklist in order.
- Append to `impl.log.md`; never rewrite historical entries.
- Add evidence under the part `evidence/` directory.
- Do not mark complete without Reviewer Agent sign-off.

## Coding Agent Prompt Template

```markdown
1. Objective
Implement the next incomplete part under `dev-docs/plans/plan-040-outline-generation`, preserving review-gated outline generation semantics.

2. Problem
Novellum can worldbuild and draft from an accepted outline, but lacks a production-safe bridge from worldbuilding context to a reviewable outline checkpoint.

3. Files
Start from the current part's `part.md`. Verify every listed path against the repo before editing. Source code wins over stale docs.

4. Changes
Make only the bounded changes required by the part. Do not introduce direct provider SDK calls, client-side DB access, or silent manuscript/hierarchy writes.

5. UI/UX
Use Svelte 5 runes and token-driven styling. Every Nova state must have clear copy and an obvious next action.

6. Data
Generated outlines are non-canonical checkpoints until explicit accept. Server-side accept owns atomic hierarchy materialization.

7. Errors
Return structured, user-safe errors for missing context, provider failures, schema failures, stale checkpoints, conflicts, and rollback failures.

8. Tests
Add/modify the smallest relevant tests first, then run the plan gates required by the part.

9. Criteria
Satisfy every checkbox in the part acceptance criteria and checklist before moving to review.

10. Out-of-scope
No broad redesigns, no cross-project templates, no regeneration/merge tool, no telemetry/auth/cloud sync, no manuscript auto-apply.

11. Format
Return a concise implementation summary, changed files, test commands/results, evidence path, and remaining risks.
```

## Execution Order

1. Stage 001 — contracts and storage.
2. Stage 002 — generation service and prompt.
3. Stage 003 — Nova review surface.
4. Stage 004 — accept/materialization safety.
5. Stage 005 — verification, docs, closeout.

Do not parallelize Stage 004 before Stage 001 contracts are stable.
