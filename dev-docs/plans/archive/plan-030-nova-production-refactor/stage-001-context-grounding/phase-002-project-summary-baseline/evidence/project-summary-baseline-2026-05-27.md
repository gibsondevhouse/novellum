# Project Summary Baseline Evidence (2026-05-27)

## Files changed
- `src/lib/ai/types.ts`
- `src/lib/ai/task-resolver.ts`
- `src/lib/ai/context-engine.ts`
- `src/lib/ai/prompt-builder.ts`
- `src/modules/nova/services/context-hooks.ts`
- `tests/nova/context-hooks.test.ts`
- `tests/ai/prompt-builder.test.ts`

## Implemented behavior
- Added `project_summary` context policy.
- Added `projectCounts` to `AiContext` to carry compact project-level counts.
- Added baseline count fetch in `context-engine` without sending manuscript scene content by default.
- `buildRagContext()` now always builds project baseline when `projectId` exists.
- Scene/outline requests merge baseline context with additional scopes.
- Missing `logline`/`synopsis` fields are surfaced as explicit warnings.
- Prompt serialization now includes project status/type/target/style/updatedAt and `PROJECT COUNTS`.
- Context truncation notice updated to explicitly state lower-priority context may be omitted.

## Commands run
- `pnpm exec vitest run tests/nova/context-hooks.test.ts tests/ai/prompt-builder.test.ts`
- `pnpm run check`
- `pnpm run lint`
- `pnpm run lint:css`
- `pnpm run test`

## Test summary
- Focused tests: pass
- Full vitest: `188` files / `1279` tests passing

## Known limitations
- Compression/truncation flags in disclosure currently depend on warning strings and are not yet sourced from a dedicated truncation report contract in the sidepanel path.
