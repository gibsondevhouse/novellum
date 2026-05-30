# Agent Prompt — Stage 001: Compact Sidepanel Shell

## 1. Objective

Implement Stage 001, `stage-001-compact-sidepanel-shell`, for plan-031. Goal: Compress Nova into a dense, modern assistant sidepanel at 280–520px widths without changing the product color system or drifting from design tokens.

## 2. Problem

Nova currently exposes more capability than it honestly delivers. This stage must move the implementation toward the plan-031 target without violating OpenRouter-only, server-side-key, Svelte 5, token, module-boundary, and no-auto-mutation constraints.

## 3. Files

Primary files/directories to inspect or update:

- `tests/visual/editor-nova-panel*.test.ts`
- `test-results/`
- `dev-docs/plans/plan-031-nova-vscode-copilot-parity/stage-001-compact-sidepanel-shell/phase-001-density-audit-and-token-baseline/part-001-capture-current-density-baseline/evidence/`
- `src/styles/tokens.css`
- `tests/tokens/*`
- `scripts/*token*`
- `src/modules/nova/components/NovaPanel.svelte`
- `src/modules/nova/components/ContextDisclosurePill.svelte`
- `src/modules/nova/components/NovaMessageLog.svelte`
- `src/modules/nova/components/NovaComposer.svelte`
- `tests/nova/*composer*.test.ts`
- `src/modules/nova/components/ModelPickerDropdown.svelte`
- `dev-docs/plans/plan-031-nova-vscode-copilot-parity/stage-001-compact-sidepanel-shell/**/evidence/`

Plan artifacts to update:

- `dev-docs/plans/plan-031-nova-vscode-copilot-parity/stage-001-compact-sidepanel-shell/stage.md`
- `dev-docs/plans/plan-031-nova-vscode-copilot-parity/stage-001-compact-sidepanel-shell/checklist.md`
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

- `tests/nova/*composer*.test.ts`
- `tests/tokens/*`
- `tests/visual/editor-nova-panel*.test.ts`

Run targeted tests during the stage and record output in the relevant evidence directory.

## 9. Criteria

Stage exit criteria:

- [ ] Header, body, composer, message log, and footer use compact spacing tokens and remain keyboard accessible.
- [ ] Composer presents one action row: attach, slash/tools slot, mode slot placeholder, model picker, send.
- [ ] Nova visual baselines are rebaselined once and documented before later stages add behavior.
- [ ] `pnpm check:tokens`, targeted Nova visual tests, and accessibility smoke checks are recorded as evidence.

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
