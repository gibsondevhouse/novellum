---
title: ONLYOFFICE Document Server Setup
slug: part-001-onlyoffice-document-server-setup
part_number: 1
status: complete
owner: Frontend Agent
phase: phase-001-onlyoffice-integration
estimated_duration: 1d
---

## Objective

Evaluate ONLYOFFICE Document Server viability in the Tauri desktop context, establish the local server setup, and verify that the Document Editor API iframe loads and comunicates from within a Tauri webview. Document the outcome — if ONLYOFFICE is not viable, fall back to TipTap.

## Context

- Tauri v2 context; `@tauri-apps/api` available
- ONLYOFFICE Document Server can run as a local Docker container or via ONLYOFFICE Desktop Editors SDK
- TipTap (`@tiptap/core`, `@tiptap/starter-kit`) as fallback rich-text editor — pure web, no server required

## Target Files

| File                                                       | Action                                                                                |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `src/modules/editor/services/editor-server.ts`             | Create — manages ONLYOFFICE server lifecycle (start/stop via Tauri sidecar or Docker) |
| `src/modules/editor/components/DocumentEditorFrame.svelte` | Create — iframe or component for editor embed                                         |
| `evidence/editor-choice-2026-04-12.md`                     | Create — records the final editor decision and rationale                              |

## Evaluation Criteria

Viability check (complete during this part):

1. Can ONLYOFFICE Document Server run as a localhost Docker container on macOS/Linux/Windows?
2. Can Tauri's webview load an iframe pointing to `http://127.0.0.1:8080`?
3. Does the ONLYOFFICE Document Editor JS API (`window.DocsAPI.DocEditor`) work inside a Tauri webview?
4. Is the content security policy compatible with ONLYOFFICE's iframe requirements?

If all 4 pass → proceed with ONLYOFFICE.
If any fail → use TipTap as the fallback.

## ONLYOFFICE Setup (if viable)

- Tauri sidecar or shell command to start `docker run -i -t -d -p 8080:80 onlyoffice/documentserver`
- Editor iframe: `<iframe src="http://127.0.0.1:8080/web-apps/apps/documenteditor/main/...">` with correct config JSON

## TipTap Fallback (if ONLYOFFICE not viable)

```sh
pnpm add @tiptap/core @tiptap/starter-kit @tiptap/extension-document @tiptap/extension-paragraph
```

Bind `editor.getHTML()` / `editor.setContent()` bidirectionally to `scene.text`.

## Acceptance Criteria

- [ ] `evidence/editor-choice-2026-04-12.md` records: chosen editor, reason, failed checks if ONLYOFFICE rejected
- [ ] Chosen editor renders in `DocumentEditorFrame.svelte` inside the Tauri app
- [ ] Editor loads with content (even placeholder text at this stage)
- [ ] No CSP errors in Tauri console when editor iframe/component mounts
- [ ] `pnpm run check` exits clean

## Out of Scope

- Scene text binding (→ part-002)
- Autosave (→ phase-002)
