---
title: Drafting Editor Integration
slug: stage-005-drafting-editor-integration
stage_number: 5
status: complete
owner: Frontend Agent
plan: plan-003-advanced-editing-and-feature-completion
phases:
  - phase-001-onlyoffice-integration
  - phase-002-autosave-and-version-history
estimated_duration: 4d
---

## Goal

Embed ONLYOFFICE Document Server as the primary prose editor for chapter-scoped drafting. Implement debounced autosave of editor content back to the Dexie `scenes` table, and a snapshot-based version history that lets users browse and restore prior drafts.

## Phases

| #   | Phase                                                                         | Status  |
| --- | ----------------------------------------------------------------------------- | ------- |
| 001 | [ONLYOFFICE Integration](phase-001-onlyoffice-integration/phase.md)           | `draft` |
| 002 | [Autosave & Version History](phase-002-autosave-and-version-history/phase.md) | `draft` |

## Entry Criteria

- stage-001 complete: Editor module has a `+page.svelte` with a scene text display stub
- Tauri desktop context confirmed: Tauri shell API available for spawning the ONLYOFFICE local server process
- Scene repository write methods tested (from plan-002)

## Exit Criteria

- ONLYOFFICE Document Server loads inside a Tauri webview iframe when a chapter is opened
- Document content is two-way bound to `scene.text` in Dexie: loading opens the stored text; saving writes it back
- Autosave fires 2 seconds after the last keystroke (debounced) with a visual "Saved" indicator
- Version history: user can open a history panel, see timestamped snapshots, and restore any prior version
- No content is lost on Tauri window close (autosave must flush before close)

## Technical Notes

- ONLYOFFICE Document Server: run as a local Docker container or use the ONLYOFFICE Desktop Editors SDK — evaluate feasibility in Tauri context during part-001
- If ONLYOFFICE proves non-viable in Tauri, fall back to ProseMirror or TipTap as a native web editor — document the decision in `evidence/`
- Autosave: `src/modules/editor/services/autosave-service.ts` — 2 s debounce, Svelte 5 `$effect` listener on editor content
- Version snapshots: new Dexie table `scene_snapshots { id, sceneId, projectId, text, createdAt }` — add in a new version bump; no migration data needed
- Version history UI: panel in editor module, max 20 snapshots per scene (oldest pruned on write)
- Security: ONLYOFFICE server must be localhost-only (`127.0.0.1`); no external network access
