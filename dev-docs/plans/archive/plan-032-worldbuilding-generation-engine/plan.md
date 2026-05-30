# Plan 032 — Worldbuilding Generation Engine + Help Disclosure

**Status:** `complete`  
**Closed:** 2026-05-29

## Summary

Two features shipped together:

### Part 1 — Automated Worldbuilding Generation Engine

Evolved Novellum from a reactive chat-assistant into a proactive generation engine for worldbuilding entities. Users can one-click generate individual entities or batches of 3 from any worldbuilding workspace page. Generated drafts land in a review modal — never auto-applied to the DB.

**New files:**
- `src/routes/api/worldbuilding/generate/+server.ts` — POST endpoint; loads project context (logline, synopsis, genre) from DB, queries existing entity names to prevent duplicates, builds entity-kind–specific prompt, calls OpenRouter, returns typed draft array.
- `src/modules/world-building/services/worldbuilding-generation-service.ts` — thin client wrapper around the endpoint.
- `src/modules/world-building/stores/generation-draft.svelte.ts` — Svelte 5 runes state machine (`idle → generating → reviewing → error`), `SvelteSet` for batch checkboxes, abort support.
- `src/modules/world-building/components/GenerateButton.svelte` — ✦ Generate / ✦ Suggest 3 ghost button; disabled while any generation in-flight.
- `src/modules/world-building/components/GeneratedEntityModal.svelte` — review overlay; single vs batch mode; Save / Discard / Abort; calls `/api/db/*` directly then `invalidateAll()`.

**Modified files:**
- `WorldBuildingWorkspacePage.svelte` — `generateEntityKind` prop; mounts GeneratedEntityModal + passes GenerateButton as snippet to IndividualsWorkspaceShell.
- `EmptyCharacterState.svelte`, `EmptyFactionState.svelte`, `EmptyLineageState.svelte`, `RealmEmptyState.svelte`, `LandmarkEmptyState.svelte` — `projectId` prop + GenerateButton wired to each.
- All worldbuilding route pages updated with `generateEntityKind` and `projectId` props.
- `src/modules/world-building/index.ts` — barrel exports for all new public symbols.

### Part 2 — Help Disclosure

All orientation/explanation text on worldbuilding pages collapsed behind `?` toggles. Local `$state` — no persistence.

**Modified files:**
- `WorldBuildingTopSectionLanding.svelte` — manifesto prose behind `showOrientation` toggle.
- `src/routes/projects/[id]/world-building/+page.svelte` — manifesto + per-domain guide lanes behind `showManifesto` / `expandedSection` toggles.
- `NarrativeLocationEmptyState.svelte` — `note` prop behind `showNote` toggle.

### Part 3 — AppShell transition fix (Track A)

Fixed broken `--duration-standard` token (doesn't exist) in `AppShell.svelte` → `--duration-enter var(--ease-decelerate)`.

## Quality gates (closed)

```
pnpm check        0 errors, 0 warnings  (1704 files)
pnpm lint         0 errors
pnpm lint:css     0 errors
pnpm check:tokens 0 violations (328 files)
pnpm test         194 files / 1359 tests ✓
```

## Security constraints satisfied

- OpenRouter only (no direct provider SDK calls)
- Server-side keys only (`loadKeyOrRespond()` pattern)
- No manuscript auto-mutation (all generated drafts require explicit Save)
- Svelte 5 Runes only
- Token-driven styling throughout
- Module boundary rules respected
