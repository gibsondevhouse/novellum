# AI Controller Contract Types Evidence

Date: 2026-06-15
Part: `part-001-define-ai-contract-types`

## Implementation

- Created `src/lib/server/ai/controller/contracts.ts`.
- Added status, request source, target kind, artifact status, and error code taxonomies.
- Added request/response envelope interfaces with `ok` discrimination and runtime/artifact references.
- Added `isTerminalAiControllerTaskStatus()` for the terminal status subset.
- Added focused coverage in `tests/ai/controller/contracts.test.ts`.

## Dependency Waiver

- `plan-049-agent-runtime-stack-hardening` is complete.
- `plan-047-worldbuilding-canon-merge-diff` is complete.
- `plan-048-frontend-experience-coherence` remains in `review`, but this part is server-side contract work only and does not depend on frontend coherence sign-off. The waiver is limited to this part.

## Verification

```text
pnpm test tests/ai/controller/contracts.test.ts

Test Files  1 passed (1)
Tests       4 passed (4)
```

```text
pnpm check

svelte-check found 0 errors and 0 warnings
```

```text
pnpm lint

eslint .
```

## Not Run

- `pnpm lint:css`: no UI or stylesheet files changed.
- `pnpm check:tokens`: no UI or style-token-bearing files changed.
