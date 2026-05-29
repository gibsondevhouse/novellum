# Agent Prompt — Stage 003: Attachments

## 1. Objective

Implement Stage 003, `stage-003-attachments`, for plan-031. Goal: Make the `+` affordance real: users can attach project entities and plain-text files to a Nova conversation, and those attachments become a disclosed additive context scope.

## 2. Problem

Nova currently exposes more capability than it honestly delivers. This stage must move the implementation toward the plan-031 target without violating OpenRouter-only, server-side-key, Svelte 5, token, module-boundary, and no-auto-mutation constraints.

## 3. Files

Primary files/directories to inspect or update:

- `src/modules/nova/types.ts`
- `src/lib/ai/context*`
- `tests/nova/attachments.test.ts`
- `src/modules/nova/stores/nova-session.svelte.ts`
- `src/modules/nova/services/chat-service.ts`
- `src/modules/nova/components/NovaAttachmentPopover.svelte`
- `src/modules/nova/components/NovaComposer.svelte`
- `src/modules/nova/components/*Attachment*.svelte`
- `src/modules/nova/components/ContextDisclosurePill.svelte`
- `src/modules/nova/services/context-hooks.ts`
- `src/routes/api/db/*`
- `src/routes/api/ai/*`
- `src/lib/ai/context-engine.ts`
- `tests/visual/editor-nova-panel*.test.ts`

Plan artifacts to update:

- `dev-docs/plans/plan-031-nova-vscode-copilot-parity/stage-003-attachments/stage.md`
- `dev-docs/plans/plan-031-nova-vscode-copilot-parity/stage-003-attachments/checklist.md`
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

- `tests/nova/attachments.test.ts`
- `tests/visual/editor-nova-panel*.test.ts`

Run targeted tests during the stage and record output in the relevant evidence directory.

## 9. Criteria

Stage exit criteria:

- [ ] Attach popover has project and upload tabs with keyboard-accessible navigation.
- [ ] Project entities and `.md/.txt` files ≤100KB attach as chips and clear on new chat.
- [ ] Attachments are validated client-side and server-side and counted as `'user-attached'` context.
- [ ] Invalid files are rejected at the boundary with actionable UI copy and tests.

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
