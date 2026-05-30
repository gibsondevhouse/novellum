# Plan: Fix GeneratedEntityModal Double-Encoding + JSON Hardening

## Problem

`GeneratedEntityModal.saveDraft` pre-encodes array fields with `JSON.stringify()` before posting to the API. The POST handler (`createPostHandler`) also encodes `json: true` fields via `encodeJson`, producing double-encoded strings in SQLite (e.g., `'"[]"'` instead of `'[]'`). When decoded on GET, these come back as **strings** instead of arrays, causing `TypeError: (values ?? []).join is not a function` crashes in consumers and a frozen UI on the Realms page.

13 instances across 5 entity types. 3 additional unguarded crash sites exist elsewhere.

---

## Phase 1 — Remove pre-encoding at the source (UNBLOCKS THE FREEZE)

**File:** `src/modules/world-building/components/GeneratedEntityModal.svelte`

In `saveDraft()`, strip all inner `JSON.stringify()` wrappers on array fields. Send raw arrays — `createPostHandler` encodes them.

| Entity branch | Fields to fix |
|---|---|
| `character` | `traits`, `goals`, `flaws`, `tags`, `aliases`, `anomalies`, `arcs` |
| `realm` / `landmark` | `tags` |
| `lore-entry` | `tags` |
| `plot-thread` | `relatedSceneIds`, `relatedCharacterIds` |
| `timeline-event` | `relatedCharacterIds`, `relatedSceneIds` |

`faction` is clean — no array fields, no changes needed.

**Example change (realm branch):**
```ts
// Before
tags: JSON.stringify(loc.tags || []),

// After
tags: loc.tags || [],
```

---

## Phase 2 — Guard all crash-prone array consumers (parallel with Phase 1)

### 2a. `src/modules/world-building/narrative-locations.ts` — `joinCommaSeparated` (line 68)

Add `Array.isArray` guard. Protects `RealmForm`'s 5 join calls (`tags`, `landmarkIds`, `factionIds`, `characterIds`, `threadIds`):

```ts
export function joinCommaSeparated(values: string[] | undefined): string {
    if (!Array.isArray(values)) return '';
    return values.join(', ');
}
```

### 2b. `src/modules/world-building/components/IndividualsDossier.svelte` (~line 238)

`selectedCharacter.aliases.join(', ')` has no guard. Change to:
```ts
(Array.isArray(selectedCharacter.aliases) ? selectedCharacter.aliases : []).join(', ')
```

### 2c. `src/modules/world-building/components/LoreEntryDetailHeader.svelte` (line 71)

`entry.tags.slice(0, 2).join(', ')` — the `entry.tags.length > 0` if-guard does NOT protect against a non-empty string. Change to:
```ts
(Array.isArray(entry.tags) ? entry.tags : []).slice(0, 2).join(', ')
```

### 2d. `src/lib/ai/prompt-builder.ts` (line 120)

`c.traits.join(', ')` has no guard. Change to:
```ts
(Array.isArray(c.traits) ? c.traits : []).join(', ')
```

---

## Phase 3 — Harden the server POST handler (defense-in-depth)

**File:** `src/lib/server/api-helpers.ts` — `createPostHandler`

For `json: true` fields, detect pre-stringified values and skip re-encoding:

```ts
// Before
entity[name] = encodeJson(body[name] ?? def.default ?? []);

// After
const val = body[name] ?? def.default ?? [];
entity[name] = typeof val === 'string' ? val : encodeJson(val);
```

Raw arrays still get encoded; already-stringified strings pass through untouched (they're already valid SQLite JSON). Prevents future double-encoding from any caller.

---

## Phase 4 — Repair existing corrupt DB rows (one-time script)

**File:** new `scripts/repair-json-fields.mjs`

Open the project's SQLite DB via `better-sqlite3`. For each affected table and column, detect double-encoded rows where `typeof JSON.parse(stored_value) === 'string'`, then double-decode and UPDATE.

Tables and columns to repair:

| Table | Columns |
|---|---|
| `locations` | `tags`, `notableFeatures`, `landmarkIds`, `factionIds`, `characterIds`, `threadIds` |
| `characters` | `aliases`, `anomalies`, `traits`, `goals`, `flaws`, `arcs`, `tags` |
| `lore_entries` | `tags` |
| `plot_threads` | `relatedSceneIds`, `relatedCharacterIds` |
| `timeline_events` | `relatedCharacterIds`, `relatedSceneIds` |

Repair logic per column:
```js
const inner = JSON.parse(row[col]); // e.g. "[]" — the stored double-encoded string
if (typeof inner === 'string') {
    const actual = JSON.parse(inner); // e.g. [] — the real value
    db.prepare(`UPDATE ${table} SET ${col} = ? WHERE id = ?`)
      .run(JSON.stringify(actual), row.id);
}
```

Log a summary of how many rows were repaired per table.

---

## Phase 5 — Regression tests

**File:** new `tests/db/json-encoding.test.ts`

1. **POST → GET round-trip:** post an entity with array fields as raw arrays → verify GET returns proper arrays (not strings)
2. **POST with pre-stringified arrays (Phase 3 validation):** post with `tags: JSON.stringify([])` → verify server tolerates it and GET returns `[]` (array, not string)
3. **`joinCommaSeparated` unit tests:**
   - string input → returns `''`
   - `undefined` → returns `''`
   - `string[]` → returns correctly joined string
4. **`encodeJson`/`decodeJson` round-trip:** edge cases including `null`, `[]`, pre-stringified values

---

## Files Changed

| File | Phase | Change |
|---|---|---|
| `src/modules/world-building/components/GeneratedEntityModal.svelte` | 1 | Remove 13 pre-encoding `JSON.stringify()` calls |
| `src/modules/world-building/narrative-locations.ts` | 2a | Add `Array.isArray` guard to `joinCommaSeparated` |
| `src/modules/world-building/components/IndividualsDossier.svelte` | 2b | Guard `aliases.join` |
| `src/modules/world-building/components/LoreEntryDetailHeader.svelte` | 2c | Guard `tags.slice().join` |
| `src/lib/ai/prompt-builder.ts` | 2d | Guard `traits.join` |
| `src/lib/server/api-helpers.ts` | 3 | Tolerate pre-stringified values in `createPostHandler` |
| `scripts/repair-json-fields.mjs` | 4 | New — one-time DB repair script |
| `tests/db/json-encoding.test.ts` | 5 | New — regression tests |

---

## Verification Checklist

- [ ] Run `node scripts/repair-json-fields.mjs` — reports repaired rows, exits 0
- [ ] Navigate to Realms page → no freeze, renders correctly
- [ ] Open Individuals Dossier for a character created via GeneratedEntityModal → no crash
- [ ] Open a lore entry created via GeneratedEntityModal → no crash
- [ ] `pnpm test` — all existing + new tests pass
- [ ] `pnpm check && pnpm lint` — clean

---

## Decisions

- Phase 1 + Phase 2 are independent — can be implemented in parallel
- Phase 4 (DB repair) should run before or alongside Phase 1 to clean existing corrupt data immediately
- No schema migrations needed — all changes are application code + a one-time script
- `faction` entity confirmed unaffected — no JSON array fields
