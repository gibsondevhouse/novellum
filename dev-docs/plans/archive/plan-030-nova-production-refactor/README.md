# plan-030 — Nova Production Refactor

This package contains the full executable plan for refactoring Nova on branch `feat/nova-development`.

## Directory Layout

```text
plan-030-nova-production-refactor/
├── plan.md
├── README.md
├── checklist.md
├── validation-matrix.md
├── low-hanging-fruit.md
├── agent-handoff.md
├── tracker-update-snippets.md
├── prompts/
├── evidence/
└── stage-*/
```

## How Agents Should Use This Plan

1. Read `plan.md` first.
2. Execute stages in order.
3. Within each stage, execute phases in order.
4. Within each phase, execute parts in order unless a part explicitly says it can run in parallel.
5. Do not expand scope without writing a scope note in the relevant phase evidence.
6. At closeout, update `evidence/closeout.md` and run the validation matrix.

## Structure Note For Codex

This plan uses flat phase-level part files (for example, `part-001-*.md`) instead of
template-style nested `part-NNN-*/part.md` directories. Treat each `part-*.md` file
as the canonical implementation unit, and use the nearest `phase/checklist.md` plus
top-level `evidence/` for execution tracking.

## Primary Work Sequence

1. Fix project context grounding.
2. Make context disclosure honest.
3. Remove misleading UI affordances.
4. Harden sidepanel states and responsiveness.
5. Clean up Chat/Scribe behavior.
6. Verify and document.

## Production Bias

Prefer small, verified changes over broad rewrites. The highest-value fix is not a visual redesign; it is making Nova reliably know the active project when the active project has usable metadata.
