# Plan 040 Tracker Patch

This file is intentionally non-invasive. Apply these edits manually after importing the expanded plan tree.

## `dev-docs/plans/ACTIVE-PLAN.md`

Recommended `## Current` section while implementation is active:

```markdown
## Current

- [plan-040-outline-generation](./plan-040-outline-generation/plan.md) — Outline Generation: Worldbuild → Outline loop closure. Status: `draft`; next step is Stage 001, Phase 001, Part 001.
```

After plan completion, move plan-040 to `Recently completed` with final quality gate results.

## `dev-docs/plans/MASTER-PLAN.md`

The current master tracker already lists plan-040 as the next skeleton. After importing this expanded package, update that line to:

```markdown
- [plan-040-outline-generation](./plan-040-outline-generation/plan.md) — Outline Generation: review-gated Worldbuild → Outline bridge that creates structured outline checkpoints and atomically materializes accepted outlines into hierarchy data. Status: `draft`.
```

When complete, move it to `Completed Plans (Archived)` with final gate evidence.
