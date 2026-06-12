# Advertisement Filter Evidence — 2026-06-11

## Filter Added

- Added `listModelCallableTools()` to `src/modules/nova/services/tool-registry.ts`.
- Kept `listTools()` as the full internal registry for UI/app usage and test hygiene.
- `listModelCallableTools()` excludes definitions with `capability: 'mutation_command'`.

## Advertisement Surfaces Updated

- `src/modules/nova/services/agent-loop.ts` now sends only `listModelCallableTools()` results to `/api/nova/agent`.
- `src/modules/nova/services/chat-service.ts` now uses the same filtered selector for the experimental agentic `payload.tools` field.
- `src/modules/nova/index.ts` re-exports `listModelCallableTools()` for module consumers and tests.

## Tests Added

- `tests/nova/tool-registry.test.ts` asserts model-callable listing keeps read/review-artifact tools and excludes mutation commands.
- `tests/nova/agent-loop.test.ts` inspects the `/api/nova/agent` request body and verifies `authorDraft.accept_checkpoint` and `authorDraft.reject_checkpoint` are absent by name.
- `tests/nova/chat-service.test.ts` verifies the experimental agentic tools payload excludes `authorDraft.accept_checkpoint`.

## Validation

- `pnpm check` passed with 0 errors / 0 warnings.
- `pnpm lint` passed.
- `pnpm test tests/nova/tool-registry.test.ts tests/nova/tool-router.test.ts tests/nova/agent-loop.test.ts tests/nova/chat-service.test.ts` passed (4 files / 33 tests).
