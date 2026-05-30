# Agent Prompt — Stage 004: Agentic Tool Loop

## 1. Objective

Implement Stage 004, `stage-004-agentic-tool-loop`, for plan-031. Goal: Enable a real, bounded Agent-mode tool loop using existing OpenRouter infrastructure, read-only project tools, and proposal-only mutation tools.

## 2. Problem

Nova currently exposes more capability than it honestly delivers. This stage must move the implementation toward the plan-031 target without violating OpenRouter-only, server-side-key, Svelte 5, token, module-boundary, and no-auto-mutation constraints.

## 3. Files

Primary files/directories to inspect or update:

- `dev-docs/plans/plan-031-nova-vscode-copilot-parity/plan.md`
- `dev-docs/plans/plan-030-nova-production-refactor/plan.md`
- `dev-docs/plans/ACTIVE-PLAN.md`
- `dev-docs/plans/MASTER-PLAN.md`
- `src/modules/nova/services/tool-registry.ts`
- `src/modules/nova/services/tool-router.ts`
- `src/modules/nova/types.ts`
- `src/modules/nova/services/context-hooks.ts`
- `src/routes/api/db/*`
- `src/lib/ai/pipeline/contracts.ts`
- `src/modules/nova/services/chat-service.ts`
- `src/lib/ai/model-router.ts`
- `tests/nova/agentic-loop.test.ts`
- `src/modules/nova/components/NovaComposer.svelte`
- `src/modules/nova/stores/nova-session.svelte.ts`
- `src/modules/nova/components/NovaMessageLog.svelte`
- `src/modules/nova/components/*Tool*.svelte`
- `tests/nova/tool-handlers.test.ts`
- `tests/nova/*`
- `tests/nova/no-mutation-imports.test.ts`

Plan artifacts to update:

- `dev-docs/plans/plan-031-nova-vscode-copilot-parity/stage-004-agentic-tool-loop/stage.md`
- `dev-docs/plans/plan-031-nova-vscode-copilot-parity/stage-004-agentic-tool-loop/checklist.md`
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

- `tests/nova/*`
- `tests/nova/agentic-loop.test.ts`
- `tests/nova/no-mutation-imports.test.ts`
- `tests/nova/tool-handlers.test.ts`

Run targeted tests during the stage and record output in the relevant evidence directory.

## 9. Criteria

Stage exit criteria:

- [ ] Agent mode advertises tools, parses `tool_use`, dispatches through `tool-router.ts`, feeds `tool_result`, and iterates up to a hard cap.
- [ ] Read tools are pure project-data queries; mutation-like tools return proposal envelopes only.
- [ ] User abort, max-step exhaustion, tool error, and non-tool final response states are visible and tested.
- [ ] Source-contract tests prove tool handlers do not import editor/manuscript mutation paths.

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
