---
title: Type Safety Hardening
slug: part-002-type-safety
part_number: 2
status: complete
owner: frontend
assigned_to: frontend
phase: phase-001-error-infrastructure
started_at: 2026-04-14
completed_at: 2026-04-14
estimated_duration: 0.5d
---

## Objective

Remove all `as unknown as T` double-cast patterns from `src/` that bypass the TypeScript type system, replacing them with proper type guards or narrowed types to prevent silent runtime failures.

## Scope

**In scope:**

- `src/modules/outliner/services/pacing-telemetry.ts` — `as unknown as { beats: unknown[] }` cast
- `src/lib/server/db/serialize.ts` — `[] as unknown as T` generic cast
- Any additional `as unknown as` occurrences found by grep in `src/`

**Out of scope:**

- Refactoring correctly typed code
- Adding types to external library call-sites already covered by `@types/*`

## Implementation Steps

1. Run `grep -rn "as unknown as" src/` to produce the full list of violations.
2. For `pacing-telemetry.ts`: replace the cast with a proper runtime type guard function (e.g., `function hasBeatArray(v: unknown): v is { beats: unknown[] }`) and use it to narrow before accessing `.beats`.
3. For `serialize.ts`: replace `[] as unknown as T` with the correct typed initialiser. If the generic needs a default, constrain it properly (e.g., `T extends unknown[] = unknown[]`) rather than casting an empty array.
4. Re-run `pnpm run check` and confirm zero new type errors.
5. Verify `grep -rn "as unknown as" src/` returns empty.

## Files

**Update:**

- `src/modules/outliner/services/pacing-telemetry.ts`
- `src/lib/server/db/serialize.ts`
- Any additional files identified by grep in step 1

## Acceptance Criteria

- [ ] `grep -rn "as unknown as" src/` returns empty output.
- [ ] `pnpm run check` exits 0 after changes.
- [ ] `pnpm run test` exits 0 — no regressions from narrowed types.

## Edge Cases

- Some cast sites may require updating callers if the narrowed return type is more specific. Update all affected callers.

## Notes

Prefer type guards over type assertions. If a cast is genuinely unavoidable (e.g., deserialized JSON), document why with an inline comment.
