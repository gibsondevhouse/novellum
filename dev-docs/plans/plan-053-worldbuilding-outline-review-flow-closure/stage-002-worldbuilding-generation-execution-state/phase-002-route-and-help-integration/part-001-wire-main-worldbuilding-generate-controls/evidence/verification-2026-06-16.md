# Verification - 2026-06-16

## Scope

Implemented the main worldbuilding Generate control wiring:

- Replaced the main `/world-building` route redirect with the same domain-count data contract used by the help route, making the landing controls reachable.
- Added a shared generate-control state helper for disabled labels, accessibility copy, and review-ready state.
- Disabled main route Generate buttons while queued, running, or review-ready to prevent blocked/no-op clicks.
- Mounted `GeneratedEntityModal` on the main route so real generated drafts have a review gate.
- Added a review-ready status action that focuses the generated draft modal.
- Reset stale `review-ready` domain state after the draft modal returns to idle from discard/save.
- Added unit/component and Playwright coverage for the main route control contract.

## Commands

```sh
pnpm test tests/world-building/worldbuilding-generate-controls.test.ts tests/world-building/worldbuilding-generation-actions.test.ts tests/world-building/worldbuilding-generation-state-errors.test.ts tests/world-building/worldbuild-generation-state.test.ts tests/world-building/worldbuild-generation.test.ts
```

Result: passed, 5 files / 72 tests.

```sh
pnpm check
```

Result: passed, 0 errors and 0 warnings.

```sh
pnpm run build
```

Result: passed. Existing Lightning CSS `@theme` / `@utility` warnings and plugin timing warning remain unrelated baseline noise.

```sh
pnpm exec playwright test tests/e2e/worldbuilding-generation-actions.spec.ts --project=chromium
```

Result after rebuilding the preview bundle: passed, 3 tests:

- `main landing generate opens draft review and resets after discard`
- `landing generate calls the real generation route and reaches pending review`
- `failed landing generation shows retry copy and retries only after user action`

An earlier run timed out because the preview server was serving the stale pre-build bundle where `/world-building` still redirected to `/world-building/characters`.

```sh
pnpm exec eslint src/modules/world-building/worldbuilding-generate-actions.ts src/modules/world-building/components/WorldbuildingGenerationStatus.svelte src/modules/world-building/components/GeneratedEntityModal.svelte 'src/routes/projects/[id]/world-building/+page.ts' 'src/routes/projects/[id]/world-building/+page.svelte' tests/world-building/worldbuilding-generate-controls.test.ts tests/e2e/worldbuilding-generation-actions.spec.ts
```

Result: passed.

```sh
pnpm lint:css
```

Result: passed.

```sh
pnpm check:tokens
```

Result: passed, 349 files scanned, 0 violations.

```sh
pnpm lint
```

Result: failed on unrelated pre-existing baseline:

```text
src/routes/api/author-draft/checkpoints/stage-inline/+server.ts
  36:10  error  'usedCanonRefsValue' is defined but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
```

`git diff -- src/routes/api/author-draft/checkpoints/stage-inline/+server.ts` is empty, so this part did not introduce or modify the failing file.

## Review State

Part status is `review`. Reviewer Agent sign-off remains pending and has not been simulated.
