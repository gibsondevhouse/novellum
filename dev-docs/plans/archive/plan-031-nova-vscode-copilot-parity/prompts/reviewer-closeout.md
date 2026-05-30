
# Agent Prompt — Reviewer Closeout

## 1. Objective

Review plan-031 for completion readiness and block false completion.

## 2. Problem

The implementation touches UI, state, context, streaming, tools, file validation, and docs. A superficial green test run is not enough. The plan is complete only if behavior, safety guardrails, evidence, and tracker reconciliation are all true.

## 3. Files

- `dev-docs/plans/plan-031-nova-vscode-copilot-parity/plan.md`
- `dev-docs/plans/plan-031-nova-vscode-copilot-parity/checklist.md`
- `dev-docs/plans/plan-031-nova-vscode-copilot-parity/validation-matrix.md`
- `dev-docs/plans/plan-031-nova-vscode-copilot-parity/**/part.md`
- `dev-docs/plans/plan-031-nova-vscode-copilot-parity/**/checklist.md`
- `dev-docs/plans/plan-031-nova-vscode-copilot-parity/**/impl.log.md`
- `dev-docs/plans/plan-031-nova-vscode-copilot-parity/**/evidence/`
- `dev-docs/04-modules/nova.md`
- `dev-docs/03-ai/pipeline.md`
- `dev-docs/plans/ACTIVE-PLAN.md`
- `dev-docs/plans/MASTER-PLAN.md`

## 4. Changes

Do not implement feature code. Review, verify, and append signoff or blockers.

## 5. UI/UX

Verify compact sidepanel evidence at constrained widths and confirm no fake controls remain.

## 6. Data

Verify attachments and tools do not bypass existing data boundaries or send unbounded manuscript context.

## 7. Errors

Verify validation, unsupported action, tool failure, abort, and max-step errors are visible and tested.

## 8. Tests

Required command evidence:

```bash
pnpm check
pnpm lint
pnpm lint:css
pnpm test
pnpm test:visual
pnpm check:tokens
```

Also verify `tests/nova/no-mutation-imports.test.ts` exists and passes.

## 9. Criteria

- [ ] All part checklists complete.
- [ ] Every part has evidence.
- [ ] No stop condition remains unresolved.
- [ ] Global acceptance checklist is complete.
- [ ] Docs are updated.
- [ ] Trackers are reconciled.
- [ ] Reviewer signoff entries are appended.

## 10. Out-of-scope

Do not waive Critical criteria. Do not mark complete if source-contract or file-upload boundaries fail.

## 11. Format

Return a reviewer report with: Approved / Blocked, blockers, evidence gaps, commands verified, and exact files requiring correction.
