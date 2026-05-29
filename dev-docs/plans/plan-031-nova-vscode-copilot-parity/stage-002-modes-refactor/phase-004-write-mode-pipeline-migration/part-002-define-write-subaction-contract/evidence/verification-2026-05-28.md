# Define Write Sub-Action Contract — 2026-05-28

## Contract

`WriteSubAction = 'outline' | 'scene' | 'revision'` (src/modules/nova/types.ts)

| Sub-action | Status | Route |
|------------|--------|-------|
| outline | enabled | `runAuthorPipelineTask(AUTHOR_OUTLINE)` |
| scene | stub | routes to `appendUnsupportedWriteAction` |
| revision | stub | routes to `appendUnsupportedWriteAction` |

Unsupported generation requests return explicit unsupported-action state, not silent chat fallback.

Documented in `dev-docs/04-modules/nova.md` under "Mode and Review-Gate Boundaries".

## Quality Gates

```
pnpm check → 0 errors
pnpm test → 1310 tests passed
```
