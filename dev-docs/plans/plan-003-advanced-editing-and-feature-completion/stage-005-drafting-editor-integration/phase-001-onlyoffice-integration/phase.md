---
title: ONLYOFFICE Integration
slug: phase-001-onlyoffice-integration
phase_number: 1
status: complete
owner: Frontend Agent
stage: stage-005-drafting-editor-integration
parts:
  - part-001-onlyoffice-document-server-setup
  - part-002-chapter-editor-binding
estimated_duration: 2d
---

## Goal

Embed ONLYOFFICE Document Server as the drafting editor. Establish the local server setup, verify viability in the Tauri desktop context, and bind document content bidirectionally to the `scene.text` field in Dexie.

## Parts

| #   | Part                                                                                  | Status  |
| --- | ------------------------------------------------------------------------------------- | ------- |
| 001 | [ONLYOFFICE Document Server Setup](part-001-onlyoffice-document-server-setup/part.md) | `draft` |
| 002 | [Chapter Editor Binding](part-002-chapter-editor-binding/part.md)                     | `draft` |

## Entry Criteria

- stage-001 complete: Editor module has a scene text view stub at `/projects/[id]/editor/[sceneId]`
- Tauri environment confirmed; `@tauri-apps/api` available

## Exit Criteria

- ONLYOFFICE Document Server running locally and reachable from Tauri webview at `http://127.0.0.1:<port>`
- Editor route loads the ONLYOFFICE iframe; document pre-populated with `scene.text` from Dexie
- Document edits are captured via ONLYOFFICE Document API callback or polling; text extracted and staged for autosave
- If ONLYOFFICE is not viable in Tauri context: TipTap editor installed and bound instead; decision documented in `evidence/editor-choice-2026-04-12.md`
- `pnpm run check` exits clean; no TypeScript errors in editor module
