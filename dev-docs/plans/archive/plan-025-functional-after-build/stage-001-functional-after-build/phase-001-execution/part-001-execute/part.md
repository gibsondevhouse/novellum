---
title: Execute
slug: part-001-execute
status: complete
---

## Scope

Apply every fix scoped in `plan-025-functional-after-build/plan.md`,
gate it with `pnpm check && pnpm lint && pnpm lint:css && pnpm test &&
pnpm check:tokens && pnpm build && pnpm smoke:built`, then commit and
push.

## Touched surfaces

### Phase A — Server-side correctness

- `src/modules/world-building/services/character-dossier-files.ts` —
  `WORKSPACE_ROOT` switched to `resolveAppDataDir()`; scratchpads now
  land in the OS app-data dir in production, not next to the sidecar.
- `src/lib/server/db/snapshot.ts` — snapshot-root fallback uses
  `resolveAppDataDir()` instead of `process.cwd()`.
- `src/routes/api/ai/models/+server.ts` — cache entry now stores a
  SHA-256 of the API key; rotation naturally misses the cache.
- `?raw` legal-doc imports were verified to land in
  `build/server/chunks/`; no code change needed.

### Phase B — Cut 4 unimplemented agents

- `src/lib/ai/types.ts` — `TaskType` union reduced to `continue`,
  `rewrite`, `continuity_check`, `edit`, `style_check`.
- `src/lib/ai/task-resolver.ts` — TASK_MAP entries for the cut agents
  removed; default falls back to `continue`.
- `src/lib/ai/constants.ts` — MODEL_MAP keys aligned with the new union.
- `src/modules/nova/services/stub-tools.ts` — emptied (no STUB_TOOLS).
- `src/modules/nova/services/chat-service.ts` — legacy callers route to
  `continue` action.
- Tests deleted: `tests/ai/summary-agent.test.ts`, `tests/nova/stub-tools.test.ts`.
- Tests rewritten: `tests/ai/task-resolver.test.ts`,
  `tests/ai/prompt-builder.test.ts`, `tests/nova/chat-service.test.ts`.

### Phase C — Hide actionable stubs

- `src/modules/editor/components/EditorToolbar.svelte` — removed
  Find & Replace pill + unused `SVG_SEARCH` constant.
- `src/routes/settings/updates/+page.svelte` — replaced disabled
  "Check for updates" button with a link to GitHub releases.
- `src/lib/components/AppSidebar.svelte` — removed locked
  "Recent sessions" sidebar item.
- `src/modules/nova/components/NovaComposer.svelte` — removed
  Research-mode dropdown + isResearchMode plumbing + dead CSS.
- `src/lib/components/ui/PillToolbar.stories.svelte` — dropped
  Find & Replace pill from the Storybook story.
- `src/modules/story-bible/components/StoryBiblePlaceholder.svelte` —
  non-Labs branch now renders nothing (was "coming soon").

### Phase D — Console hygiene

- `src/modules/project/components/BackupStatusCard.svelte` — removed
  `console.log` from `handleBackup` (no-op until the project backup
  pipeline routes through this card).

### Phase E — Verification surface

- `scripts/smoke-built-server.mjs` — added 3 probes:
  `/api/local-files/normalize`, `/api/ai/models` (no creds → 401),
  `/api/settings/storage-location` (appDataDirectory present).
- `dev-docs/qa-docs/manual-smoke-checklist-v1.md` — new 9-step manual
  checklist for the packaged `.app`.
- `.github/workflows/ci.yml` — `pnpm smoke:built` runs after build.

### Phase F — Misc lint debt cleared while gating

- `src/modules/editor/components/SceneSignalNudge.svelte` — `Set` →
  `SvelteSet`; `hsl(38 …)` → `hsl(38deg …)`.
- `src/modules/outline/components/SceneClarityPanel.svelte` —
  `#fff` → `var(--color-text-on-accent)`.

### Docs

- `dev-docs/03-ai/agents-map.md` — Planned section replaced with a
  "Cut from V1 (2026-05-13)" note.
- `AGENTS.md` — Runtime Agents table trimmed; added cut note.

## Verification

See `evidence/gate-output-2026-05-13.md`.
