---
part: part-001-autosave-service
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] Read `src/lib/db/schema.ts` — note current Dexie version; plan coordinated version bump with `scene_snapshots` + `export_settings` if both are being added in the same coding session
- [ ] Read `src/modules/editor/stores/editor-store.ts` — confirm `pendingText` reactive field is present (from part-002-chapter-editor-binding)
- [ ] Read `@tauri-apps/api/window` `onCloseRequested` docs — understand async close cancellation pattern

## Post-Implementation

- [ ] `SceneSnapshot` interface in `schema.ts` matches spec
- [ ] Dexie version bumped; `scene_snapshots` table declared with correct index
- [ ] 2s debounce confirmed: type rapidly, observe a single write ≈2s after last keystroke (Dexie DevTools or log)
- [ ] Each save creates a snapshot row (query `db.scene_snapshots` in DevTools)
- [ ] After 21+ saves, oldest snapshots deleted; never more than 20 per scene
- [ ] Close Tauri window with unsaved (within 2s) text — content is persisted on reopen
- [ ] `pnpm run check` — zero errors; `pnpm run lint` — zero errors
