# Agent Prompt — Stage 002: Modes Refactor — Ask, Write, Agent

## 1. Objective

Implement Stage 002, `stage-002-modes-refactor`, for plan-031. Goal: Replace the misleading Chat/Scribe model with explicit Ask, Write, and Agent modes that route through distinct prompt and resolver contracts.

## 2. Problem

Nova currently exposes more capability than it honestly delivers. This stage must move the implementation toward the plan-031 target without violating OpenRouter-only, server-side-key, Svelte 5, token, module-boundary, and no-auto-mutation constraints.

## 3. Files

Primary files/directories to inspect or update:

- `src/modules/nova/types.ts`
- `src/modules/nova/**/*.ts`
- `src/modules/nova/**/*.svelte`
- `src/modules/nova/stores/nova-session.svelte.ts`
- `src/modules/nova/services/*`
- `tests/nova/mode-routing.test.ts`
- `src/modules/nova/components/NovaComposer.svelte`
- `src/modules/nova/components/NovaPanel.svelte`
- `src/lib/ai/prompt-builder.ts`
- `src/modules/nova/services/chat-service.ts`
- `tests/ai/*prompt*.test.ts`
- `src/lib/ai/task-resolver.ts`
- `src/lib/ai/pipeline/contracts.ts`
- `dev-docs/04-modules/nova.md`
- `tests/ai/*`
- `tests/nova/*`

Plan artifacts to update:

- `dev-docs/plans/plan-031-nova-vscode-copilot-parity/stage-002-modes-refactor/stage.md`
- `dev-docs/plans/plan-031-nova-vscode-copilot-parity/stage-002-modes-refactor/checklist.md`
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

- `tests/ai/*`
- `tests/ai/*prompt*.test.ts`
- `tests/nova/*`
- `tests/nova/mode-routing.test.ts`

Run targeted tests during the stage and record output in the relevant evidence directory.

## 9. Criteria

Stage exit criteria:

- [ ] `NovaMode = 'ask' | 'write' | 'agent'` replaces `chat | scribe` across Nova types, store, UI, and resolver routing.
- [ ] Each mode has distinct placeholder copy, system prompt behavior, and acceptance-tested route behavior.
- [ ] Write mode preserves existing Scribe outline capability but reframes it as proposal generation.
- [ ] Last-used mode persists per project without leaking between projects.

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
