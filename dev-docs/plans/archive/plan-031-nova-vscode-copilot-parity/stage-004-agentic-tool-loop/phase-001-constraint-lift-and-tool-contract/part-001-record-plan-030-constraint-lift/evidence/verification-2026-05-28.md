# Evidence — Record Plan-030 Constraint Lift

**Date:** 2026-05-28
**Part:** phase-001 / part-001

## What was done

Plan-031 `plan.md` section 4 ("Plan-030 Constraint Lift") documents:
- Plan-030 prohibited broad tool-calling; plan-031 lifts that for Agent mode only.
- Guardrails: Agent-mode only, read-only project tools, proposal-only mutation tools, no auto-apply, hard iteration cap (8), user abort, source-contract test.

The constraint lift text was authored as part of the initial plan scaffold and verified intact.

## File evidence

- `dev-docs/plans/plan-031-nova-vscode-copilot-parity/plan.md` — Section 4 records the lift with full guardrail list.

## Quality gate results

```
pnpm check:   0 errors, 0 warnings
pnpm lint:    clean
pnpm test:    1358/1358 passed
```
