---
title: Harden Server POST Handler Against Pre-Stringified Values
slug: part-001-harden-createPostHandler
part_number: 1
status: review
owner: Planner Agent
phase: phase-002-harden-server
target_file: src/lib/server/api-helpers.ts
---

## Task

Update `createPostHandler` to detect and tolerate pre-stringified JSON values for `json: true` fields. If a client sends an already-stringified array (e.g., `tags: "[]"`), skip re-encoding and store as-is. This is a defense-in-depth measure to prevent future double-encoding bugs.

## Changes Required

File: `src/lib/server/api-helpers.ts` — `createPostHandler` function (lines ~101–103)

**Before:**
```ts
if (def.json) {
    entity[name] = encodeJson(body[name] ?? def.default ?? []);
}
```

**After:**
```ts
if (def.json) {
    const val = body[name] ?? def.default ?? [];
    entity[name] = typeof val === 'string' ? val : encodeJson(val);
}
```

**Effect:**
- Raw arrays (normal case): `encodeJson([...])` → `"[...]"` ✓
- Pre-stringified strings (edge case): `"[...]"` → stored as-is ✓
- Prevents double-encoding: `encodeJson("[...]")` is not called ✓

## Acceptance Criteria

- [ ] `createPostHandler` updated with pre-stringified value check
- [ ] No syntax errors
- [ ] TypeScript strict mode: no errors
- [ ] `pnpm lint` passes
- [ ] Behavior is backward-compatible (raw arrays still work)
- [ ] Integration test (from Phase 3): POST with pre-stringified array → GET returns proper array
- [ ] Part marked `complete`

## Notes

- Small, focused change with minimal risk
- Can be implemented in parallel with Phase 1
- Makes the server more robust against future bugs
- Does not affect any existing behavior for correct callers
