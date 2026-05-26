---
title: localStorage Audit
slug: part-001-localstorage-audit
part_number: 1
status: complete
owner: backend
assigned_to: backend
phase: phase-002-localstorage-audit-and-migration
started_at: 2025-01-09
completed_at: 2025-01-09
estimated_duration: 0.5d
---

## Objective

Produce a definitive map of every `localStorage` (and `window.localStorage`) call site under `src/`, classify each, and propose its destination so parts 002 and 003 can be implemented mechanically.

## Scope

**In scope:**

- Enumerate all `localStorage.{getItem,setItem,removeItem}` and `window.localStorage.*` call sites in `src/**`.
- Classify each as: `project-data` (move to SQLite), `app-preference` (move to preferences store), or `legacy-portability` (keep — only the portability snapshot/restore services).
- For each `project-data` site, name the target SQLite table/column (existing or proposed).
- For each `app-preference` site, name the target preference key.
- Write the audit at `dev-docs/plans/plan-017-v1-trust-foundation/stage-002-sqlite-source-of-truth/phase-002-localstorage-audit-and-migration/LOCALSTORAGE-AUDIT.md`.

**Out of scope:**

- Implementation — that's parts 002 and 003.

## Implementation Steps

1. Run a workspace search for `localStorage` and `window.localStorage` under `src/**`.
2. For each match, capture: file path, line, key pattern (e.g. `clarity:${projectId}:${sceneId}`), value shape (string vs JSON), classification, target.
3. Tabulate in `LOCALSTORAGE-AUDIT.md`.
4. Note any value shapes that exceed plausible localStorage size limits (5MB) or that contain sensitive material.

## Files

**Create:**

- `dev-docs/plans/plan-017-v1-trust-foundation/stage-002-sqlite-source-of-truth/phase-002-localstorage-audit-and-migration/LOCALSTORAGE-AUDIT.md`

## Acceptance Criteria

- [ ] Audit lists every call site with classification and target.
- [ ] At least the following files are addressed: `SceneClarityPanel.svelte`, `ChapterClarityPanel.svelte`, `ChapterOutlinePanel.svelte`, `SceneOutlineForm.svelte`, `ChapterOutlineForm.svelte`, `routes/projects/[id]/editor/+page.svelte`, `world-building/lineages/+page.svelte`, `world-building/factions/+page.svelte`.
- [ ] Portability snapshot/restore services are listed as `legacy-portability` and explicitly excluded from migration.

## Edge Cases

- Some keys are namespaced by `${projectId}` and `${sceneId}` — the audit must capture key shape, not just the literal string.
- A site may both read and write — list both with the same target.

## Notes

- Migration UI for IndexedDB → SQLite is phase-004; this part is localStorage only.
