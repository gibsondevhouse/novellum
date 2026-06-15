---
title: Add Outline Regression and E2E Coverage
slug: part-001-add-outline-regression-and-e2e-coverage
part_number: 1
status: complete
owner: QA Agent
assigned_to: QA Agent
phase: phase-001-automated-and-manual-verification
started_at: 2026-06-04T12:09:00-04:00
completed_at: 2026-06-04T11:51:00-04:00
estimated_duration: 0.5d
---

## Objective

Add targeted regression and e2e tests for generation, review, reject, accept, and conflict-blocked flows.

## Scope

**In scope:**

- Implement only the behavior described in this part.
- Keep changes bounded to the listed files unless source inspection proves a different path is required.
- Add or update tests that directly verify this part's acceptance criteria.
- Record implementation decisions and deviations in `impl.log.md`.

**Out of scope:**

- Broad UI redesign outside the affected Nova/outline surfaces.
- Direct provider SDK calls, client-side API keys, telemetry, sync, or auth.
- Silent manuscript/hierarchy mutation outside the explicit accept path.
- Opportunistic refactors unrelated to this part.

## Implementation Steps

1. Create deterministic fixtures for project/worldbuilding context.
2. Test successful generate → checkpoint → accept flow.
3. Test reject leaves hierarchy untouched.
4. Test populated outline conflict blocks accept.
5. Add regression assertion that generation alone writes no hierarchy rows.

## Files

**Create:**

- `tests/e2e/outline-generation-review.spec.ts`
- `tests/routes/outline-no-silent-write-regression.test.ts`

**Update:**

- `playwright.config.ts`

## Data / Contract Notes

- Preserve local-first behavior: client code talks to SvelteKit endpoints or typed client wrappers; server code owns DB access.
- Preserve AI pipeline behavior: structured outputs, scoped context, OpenRouter routing, no raw provider output leakage.
- Preserve review-gated semantics: generated outline data is proposed until accepted.

## Acceptance Criteria

- [x] E2E covers happy path and conflict path.
- [x] Regression route/unit test proves no silent hierarchy mutation.
- [x] Tests are deterministic and do not require live provider calls.
- [x] Provider calls are mocked or fixture-backed.

## Edge Cases

- Playwright environment lacks desktop/Tauri shell.
- Mocked provider response drifts from JSON schema.
- Fixture project has stale hierarchy rows from prior test.

## Verification

- Run the smallest relevant test first, then the applicable plan gates.
- Add a dated artifact under `evidence/` before moving this part to `review`.
- Do not mark this part `complete` until Reviewer Agent sign-off is appended to `impl.log.md`.

## Notes

If the listed file path does not exist, inspect the current repo tree, choose the nearest canonical module path, and document the path change in the implementation log and evidence.
