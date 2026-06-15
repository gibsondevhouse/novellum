# Design System Cleanup Evidence — 2026-06-15

## Scope

- Consolidated route/workspace context derivation into `src/lib/navigation-state.ts`.
- Consolidated review-gate status/action labels into `src/lib/review-gate-labels.ts`.
- Reused the shared labels across Nova author-draft cards, Nova outline cards, worldbuilding proposal cards, and worldbuilding generation status copy.
- Kept module-specific card structures in place where their domain semantics differ.

## Validation

- `pnpm check` — passed, 0 errors and 0 warnings.
- `pnpm lint` — passed.
- `pnpm lint:css` — passed.
- `pnpm check:tokens` — passed, 348 files scanned, 0 violations.
- `pnpm test` — passed, 262 files / 1898 tests.
- `pnpm build` — passed.

## Notes

The cleanup intentionally avoided a broad visual rewrite. It targeted repeated
status language and route-context behavior because those were the pieces that
created visible workflow inconsistency across drafting, planning, and
worldbuilding review surfaces.
