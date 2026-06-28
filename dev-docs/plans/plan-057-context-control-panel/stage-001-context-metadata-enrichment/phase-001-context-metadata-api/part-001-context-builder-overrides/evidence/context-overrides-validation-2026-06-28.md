# Context Override API Validation — 2026-06-28

## Implementation Evidence

- Extended `NovaContextRequestPayload` with `pinnedEntityIds` and `excludedEntityIds`.
- Added route normalization for both arrays in `/api/nova/context`; invalid override arrays
  return `400`.
- Applied exclusion filtering before Nova context rendering so supported project graph rows
  and structured id references are removed from the context payload.
- Added pinned entity rendering in a dedicated `# Pinned Context` block before implicit project
  context.
- Added pinned entity disclosure through `includedItems` with `kind: "entity"` and
  `inclusion: "pinned"`.
- Preserved no-throw behavior for stale pinned ids by silently dropping ids that do not match
  the attached project graph.
- Documented the request override contract in `dev-docs/03-ai/context-engine.md`.

## Validation

| Command                                                                                                | Result                                              |
| ------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| `pnpm vitest run tests/ai/nova-context.test.ts tests/sqlite/nova-context-route.test.ts --reporter=dot` | PASS — 2 files, 18 tests                            |
| `pnpm check`                                                                                           | PASS — `svelte-check found 0 errors and 0 warnings` |
| `pnpm lint`                                                                                            | PASS — exited 0                                     |

## Notes

Exclusion takes precedence over pinning. When the same id is submitted in both arrays, the
response omits the entity and returns a warning explaining that excluded overrides took
precedence.
