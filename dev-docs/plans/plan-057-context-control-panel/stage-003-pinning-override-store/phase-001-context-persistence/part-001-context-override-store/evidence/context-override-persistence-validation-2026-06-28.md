---
part: part-001-context-override-store
captured_at: 2026-06-28
captured_by: Codex
---

# Context Override Persistence Validation Evidence

## Scope

Stage 003 added scene-scoped persistence for Nova context pin/exclude overrides through
`project_metadata` key `nova-context-overrides.v1`. The Nova panel loads overrides for the active
scene, saves changes after pin/exclude toggles, and applies overrides to chat prompt construction.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `pnpm vitest run tests/nova/context-control-store.test.ts tests/lib/project-metadata-client.test.ts tests/nova/context-sidebar-drawer.test.ts tests/nova/chat-service.test.ts --reporter=dot` | PASS | 4 files / 21 tests |
| `pnpm check` | PASS | 0 errors / 0 warnings |
| `pnpm lint` | PASS | No ESLint failures |

## Coverage Notes

- Store loads scene-scoped override metadata and clears values when no scene is active.
- Store persists pin/exclude changes to the active scene metadata target.
- Metadata normalization trims and dedupes ids; exclusions win over pins.
- Chat prompt construction filters excluded structured context rows and includes registered pinned
  entity summaries in a dedicated override block.
