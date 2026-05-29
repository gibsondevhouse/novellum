# Agent Prompt — Stage 005: Verification, Docs, and Closeout

## 1. Objective

Implement Stage 005, `stage-005-verification-docs-closeout`, for plan-031. Goal: Run the full gate stack, update module and AI pipeline docs, reconcile plan trackers, and package closeout evidence.

## 2. Problem

Nova currently exposes more capability than it honestly delivers. This stage must move the implementation toward the plan-031 target without violating OpenRouter-only, server-side-key, Svelte 5, token, module-boundary, and no-auto-mutation constraints.

## 3. Files

Primary files/directories to inspect or update:

- `dev-docs/plans/plan-031-nova-vscode-copilot-parity/stage-005-verification-docs-closeout/phase-001-quality-gates/part-001-run-required-quality-gates/evidence/`
- `dev-docs/plans/plan-031-nova-vscode-copilot-parity/checklist.md`
- `dev-docs/plans/plan-031-nova-vscode-copilot-parity/validation-matrix.md`
- `dev-docs/04-modules/nova.md`
- `dev-docs/03-ai/pipeline.md`
- `dev-docs/plans/ACTIVE-PLAN.md`
- `dev-docs/plans/MASTER-PLAN.md`
- `dev-docs/plans/plan-030-nova-production-refactor/plan.md`
- `dev-docs/plans/plan-031-nova-vscode-copilot-parity/closeout-summary.md`
- `dev-docs/plans/plan-031-nova-vscode-copilot-parity/**/impl.log.md`
- `dev-docs/plans/plan-031-nova-vscode-copilot-parity/plan.md`

Plan artifacts to update:

- `dev-docs/plans/plan-031-nova-vscode-copilot-parity/stage-005-verification-docs-closeout/stage.md`
- `dev-docs/plans/plan-031-nova-vscode-copilot-parity/stage-005-verification-docs-closeout/checklist.md`
- Each child part's `part.md`, `checklist.md`, `impl.log.md`, and `evidence/`

## 4. Changes

Implement only the parts in this stage. Do not pull future-stage scope forward unless it is required to remove a fake affordance or keep the build green. If future scope is encountered, leave a clear note in the relevant `impl.log.md`.

## 5. UI/UX

Preserve the compact sidepanel target and honest affordances. User-visible controls must either work, be explicitly disabled, or be labeled as deferred. Do not leave fake controls.

## 6. Data

Use existing project/context services and `/api/db/*` resource paths. Do not add direct client SQLite access. Do not send full manuscript by default.

## 7. Errors

Return structured, user-visible states for unsupported actions, missing project context, validation failures, tool errors, cap exhaustion, and aborts. Do not swallow errors or downgrade them into generic chat replies.

## 8. Tests

Required or expected tests for this stage:

- Add or update tests matching the files changed in this stage.

Run targeted tests during the stage and record output in the relevant evidence directory.

## 9. Criteria

Stage exit criteria:

- [ ] All required quality gates pass or have a documented waiver accepted by Reviewer Agent.
- [ ] `dev-docs/04-modules/nova.md` and `dev-docs/03-ai/pipeline.md` reflect the shipped mode, attachment, and Agent loop contracts.
- [ ] ACTIVE-PLAN and MASTER-PLAN are updated; plan-030 stage 002/003 supersession is recorded.
- [ ] Final PR readiness package includes summary, risks, evidence index, and validation command output.

## 10. Out-of-scope

- Direct manuscript/editor mutation.
- Direct provider SDKs.
- Client-visible API keys.
- Broad app redesign outside Nova.
- Rewriting plan-030 stage 001 context grounding unless a regression is found.

## 11. Format

When complete, report:

1. Files changed.
2. Tests run.
3. Evidence files created.
4. Risks or deviations.
5. Parts ready for reviewer signoff.
