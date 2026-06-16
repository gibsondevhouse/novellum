# Verification - 2026-06-16

## Implementation Summary

- Added `src/modules/world-building/services/worldbuilding-generation-actions.ts`.
- Moved the domain-level generation guard into that service and kept `worldbuilding-generate-actions.ts` as the compatibility export layer.
- Mapped worldbuilding domains to conservative primary entity kinds:
  - Personae -> `character`
  - Atlas -> `realm`
  - The Archive -> `lore-entry`
  - Threads -> `plot-thread`
  - Chronicles -> `timeline-event`
- Added `markMissingContext` to `worldbuilding-generation-state.svelte.ts`.
- Changed landing/help route Generate buttons to pass real domain counts into the generation action and removed `with Nova` from the Generate button aria-labels.
- Kept `openNovaGenerationHelp` as the explicit Nova-help path; generation exports now execute real generation instead of only seeding a Nova prompt.

## Behavior Notes

- Allowed generation transitions domain state `idle -> queued -> running -> review-ready`.
- Missing dependencies set `missing-context` and preserve the readable reason.
- Successful generation leaves drafts in the existing `generation-draft` store for the review modal path and shows `Pending review` through `WorldbuildingGenerationStatus`.
- Provider failures transition the domain state to `failed`.
- Existing `generateDomainWithNova`/domain-specific exports remain for route compatibility but now delegate to `runWorldbuildingDomainGeneration`.

## Commands

### Unit

Command:

```sh
pnpm test tests/world-building/worldbuilding-generation-actions.test.ts tests/world-building/worldbuild-generation-state.test.ts tests/world-building/worldbuild-generation.test.ts
```

Result:

```text
Test Files  3 passed (3)
Tests       62 passed (62)
```

### Typecheck

Command:

```sh
pnpm check
```

Result:

```text
svelte-check found 0 errors and 0 warnings
```

### Lint

Command:

```sh
pnpm lint
```

Result:

```text
src/routes/api/author-draft/checkpoints/stage-inline/+server.ts
  36:10  error  'usedCanonRefsValue' is defined but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
```

Notes:

- This is the known unrelated baseline lint failure; `git diff -- src/routes/api/author-draft/checkpoints/stage-inline/+server.ts` is empty.
- Changed-file ESLint passed:

```sh
pnpm exec eslint src/modules/world-building/services/worldbuilding-generation-actions.ts src/modules/world-building/worldbuilding-generate-actions.ts src/modules/world-building/stores/worldbuilding-generation-state.svelte.ts src/modules/world-building/index.ts 'src/routes/projects/[id]/world-building/+page.svelte' 'src/routes/projects/[id]/world-building/help/+page.svelte' tests/world-building/worldbuilding-generation-actions.test.ts tests/world-building/worldbuild-generation-state.test.ts tests/e2e/worldbuilding-generation-actions.spec.ts
```

### CSS and tokens

Commands:

```sh
pnpm lint:css
pnpm check:tokens
```

Result:

```text
lint:css passed
Token enforcement: 349 files scanned, 0 violations.
```

### Build

Command:

```sh
pnpm run build
```

Result:

```text
build passed
```

Notes:

- Existing Lightning CSS warnings for `@theme` and `@utility` rules were emitted during build.

### E2E

Command:

```sh
pnpm exec playwright test tests/e2e/worldbuilding-generation-actions.spec.ts --project=chromium
```

Result:

```text
1 passed
```

Coverage:

- The worldbuilding help route Generate control posts to `/api/worldbuilding/generate` with `entityKind: character` and `count: 3`.
- A successful generation response transitions the domain status to `Pending review`.

## Reviewer Notes

- The E2E fulfills `/api/worldbuilding/generate` at the browser network boundary to keep provider credentials/preferences out of UI verification while still proving the route action is called.
- Retry/failure UI semantics are intentionally left to the next part.
- Reviewer Agent sign-off is still pending. Do not mark this part or parent plan artifacts `complete` until that review is real.
