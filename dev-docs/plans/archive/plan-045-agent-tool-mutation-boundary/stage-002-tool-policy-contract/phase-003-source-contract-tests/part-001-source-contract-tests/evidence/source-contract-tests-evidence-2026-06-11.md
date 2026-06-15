# Source Contract Tests Evidence — 2026-06-11

## Boundary Hardening

- Split `authorDraft.accept_checkpoint` and `authorDraft.reject_checkpoint` into `src/modules/nova/services/agent-mutation-tools.ts`.
- Kept `src/modules/nova/services/agent-tools.ts` limited to read-only and review-artifact generation registrations.
- Added a default mutation guard to `dispatchTool()`. Mutation commands require `{ allowMutationCommands: true }`, so an unadvertised model tool call cannot apply or reject a checkpoint through the generic dispatcher.

## Source Tests

- Added `tests/nova/agent-tool-mutation-boundary.test.ts`.
- Updated `tests/nova/agent-source-contracts.test.ts` to fail if the model-callable tool module imports author-draft accept/reject helpers or contains the denied author-draft mutation tool IDs.

## Runtime Tests

- Added `tests/nova/tool-router.test.ts` coverage proving mutation commands are blocked by default and only dispatch when explicitly allowed.
- Existing advertisement tests still prove `authorDraft.accept_checkpoint` and `authorDraft.reject_checkpoint` are absent from model tool payloads.

## Validation

- `pnpm check` passed with 0 errors / 0 warnings.
- `pnpm lint` passed.
- `pnpm test tests/nova/agent-tool-mutation-boundary.test.ts tests/nova/agent-source-contracts.test.ts tests/nova/tool-registry.test.ts tests/nova/tool-router.test.ts tests/nova/agent-loop.test.ts tests/nova/chat-service.test.ts` passed (6 files / 60 tests).
