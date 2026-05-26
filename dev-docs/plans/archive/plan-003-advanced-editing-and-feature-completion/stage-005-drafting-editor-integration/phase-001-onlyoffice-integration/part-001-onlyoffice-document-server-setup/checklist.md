---
part: part-001-onlyoffice-document-server-setup
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] Read Tauri content security policy docs — know how to loosen `connect-src` / `frame-src` for localhost
- [ ] Check if Docker is available in CI/dev environment — if not, ONLYOFFICE Docker approach is automatically ruled out
- [ ] Read TipTap quick-start — have fallback approach ready if ONLYOFFICE fails Evaluation step 3 or 4

## Post-Implementation

- [ ] `evidence/editor-choice-2026-04-12.md` file created with editor decision and rationale
- [ ] `DocumentEditorFrame.svelte` renders the chosen editor inside Tauri (screenshot to evidence)
- [ ] No CSP errors in Tauri console (attach console log snippet to evidence)
- [ ] `pnpm run check` — zero errors
- [ ] `pnpm run lint` — zero errors
