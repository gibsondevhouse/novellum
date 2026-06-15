# Author Draft Actions Evidence — 2026-06-11

## Boundary Result

- `authorDraft.accept_checkpoint` and `authorDraft.reject_checkpoint` are no longer present in the model-callable `agent-tools.ts` module.
- The mutation command registrations live in `agent-mutation-tools.ts` with `capability: 'mutation_command'`.
- `listModelCallableTools()` excludes those commands from Agent-mode payloads.
- `dispatchTool()` rejects mutation commands by default, so an unadvertised model tool call cannot apply scene prose through the generic model loop.

## UI Ownership

`NovaAuthorDraftCheckpointCard.svelte` remains the explicit UI owner for author-draft accept/reject:

- Accept starts through `handleBeginAccept`.
- Existing content and dirty editor state still require confirmation.
- Stale-target API errors still move to the force-overwrite confirmation state.
- Reject starts through `handleBeginReject` and requires a reason before calling the reject API.

No server stale guard or transaction guard was changed.

## Validation

- `pnpm check` passed with 0 errors / 0 warnings.
- `pnpm lint` passed.
- `pnpm test tests/nova/agent-tool-mutation-boundary.test.ts tests/nova/checkpoint-card.contract.test.ts tests/ai/pipeline/author-draft-checkpoint-service.test.ts tests/nova/tool-router.test.ts tests/nova/agent-loop.test.ts tests/nova/chat-service.test.ts` passed (6 files / 45 tests).
