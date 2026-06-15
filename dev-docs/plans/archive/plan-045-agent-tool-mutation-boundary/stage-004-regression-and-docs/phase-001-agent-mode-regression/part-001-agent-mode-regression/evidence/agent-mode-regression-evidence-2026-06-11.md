# Agent Mode Regression Evidence — 2026-06-11

## Scope

Verified that Nova Agent mode remains useful after separating model-callable tools from mutation commands.

## Code Coverage

- `tests/nova/agent-tool-mutation-boundary.test.ts` asserts model advertisement flows through `listModelCallableTools()` and that mutation commands are denied by the generic router.
- `tests/nova/tool-registry.test.ts` asserts `listModelCallableTools()` excludes `mutation_command` definitions while retaining read-only and review-artifact generation tools.
- `tests/nova/agent-loop.test.ts` and `tests/nova/chat-service.test.ts` assert advertised model payloads exclude `authorDraft.accept_checkpoint` and `authorDraft.reject_checkpoint`.

## Validation

- `pnpm check` — passed, `svelte-check found 0 errors and 0 warnings`.
- `pnpm lint` — passed.
- `pnpm lint:css` — passed.
- `pnpm test tests/nova/agent-tool-mutation-boundary.test.ts tests/nova/agent-source-contracts.test.ts tests/nova/tool-registry.test.ts tests/nova/tool-router.test.ts tests/nova/agent-loop.test.ts tests/nova/chat-service.test.ts tests/nova/checkpoint-card.contract.test.ts tests/nova/NovaOutlineDraftCheckpointCard.test.ts tests/nova/outline-checkpoint-actions.test.ts tests/world-building/worldbuild-proposal-canon-safety.test.ts tests/ai/pipeline/author-draft-checkpoint-service.test.ts tests/ai/pipeline/checkpoint-flow.test.ts` — passed, `12` files / `101` tests.
- `pnpm test` — passed, `240` files / `1756` tests.
- `pnpm check:tokens` — passed, `347` files scanned / `0` violations.

## Result

Agent mode can still call read-only and review-artifact generation tools. Mutation commands remain registered for trusted app callers, but are absent from model payloads and blocked by default in `dispatchTool()`.
