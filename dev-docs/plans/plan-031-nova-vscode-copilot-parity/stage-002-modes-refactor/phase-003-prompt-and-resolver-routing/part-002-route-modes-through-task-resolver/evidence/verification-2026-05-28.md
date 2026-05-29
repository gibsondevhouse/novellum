# Route Modes Through Task Resolver — 2026-05-28

## Routing Table

| Mode | Prompt Pattern | Route |
|------|----------------|-------|
| ask / omitted | any | `resolveTask('ask', uiCtx)` → stream |
| write | outline build intent | `runAuthorPipelineTask(AUTHOR_OUTLINE)` |
| write | concrete non-outline | `appendUnsupportedWriteAction` |
| write | conversational | `resolveTask('write', uiCtx)` → stream |
| agent | any | guarded stub message |

## Test Coverage (`tests/nova/mode-routing.test.ts`)

- ask mode streams through chat path ✓
- ask mode defaults when mode omitted ✓
- write + outline → pipeline runner ✓
- write + unsupported → unsupported-action state ✓
- write + outline without projectId → error ✓
- agent → guarded stub ✓

## Quality Gates

```
pnpm check → 0 errors
pnpm test → 1310 tests passed
```
