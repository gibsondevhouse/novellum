# Editor Choice Decision — 2026-04-12

## Decision

**TipTap** (ProseMirror-based) was chosen as the drafting editor.

## Rationale

ONLYOFFICE Document Server requires a running HTTP server process (typically Docker container), which is incompatible with the Novellum local-first, server-free architecture. Additionally:

1. ONLYOFFICE requires active internet or local Docker to start the document server
2. Tauri CSP policies restrict arbitrary iframe origins
3. ONLYOFFICE JS API (`window.DocsAPI.DocEditor`) requires a CORS-enabled server that serves editor assets

TipTap is a pure-web rich text editor built on ProseMirror — no server required, renders in any webview, and integrates natively with SvelteKit.

## ONLYOFFICE Failure Criteria Met

- ❌ Criterion 2: Tauri webview CSP blocks iframe to arbitrary localhost origins without `frame-src` config
- ❌ Criterion 3: ONLYOFFICE Document Editor JS API not accessible without the document server running

## TipTap Setup

- Package: `@tiptap/core`, `@tiptap/starter-kit`, `@tiptap/extension-document`, `@tiptap/extension-paragraph`, `@tiptap/extension-text`, `@tiptap/extension-history`
- Binding: `editor.getHTML()` on every transaction → `contentChange` event; `editor.commands.setContent()` to initialize
