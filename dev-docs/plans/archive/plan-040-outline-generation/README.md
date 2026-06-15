# Plan 040 Export — Outline Generation

This package expands `dev-docs/plans/plan-040-outline-generation/plan.md` from skeleton to a complete four-tier planning tree.

## Contents

- `plan.md` — initiative-level plan.
- `stage-*/stage.md` — stage-level milestones.
- `phase-*/phase.md` — coherent implementation slices.
- `part-*/part.md` — executable work orders.
- `part-*/checklist.md` — pre/implementation/post checklists.
- `part-*/impl.log.md` — append-only execution log stubs.
- `part-*/evidence/README.md` — evidence capture target for every part.
- `AGENT-RUNBOOK.md` — coding-agent execution guidance.
- `TRACKER-PATCH.md` — non-invasive suggested updates for `ACTIVE-PLAN.md` and `MASTER-PLAN.md`.

## Import

Copy the `dev-docs/plans/plan-040-outline-generation/` directory into the repo root, replacing the skeleton `plan.md` with the expanded one.

Do not mark any part `in-progress` until implementation starts. All plan artifacts intentionally remain `draft`.

## Verification before commit

```bash
find dev-docs/plans/plan-040-outline-generation -name '*.md' -print
rg '\[\[' dev-docs/plans/plan-040-outline-generation
pnpm check
pnpm lint
pnpm test
pnpm check:tokens
```

Expected result for `rg '\[\[' ...`: no matches.
