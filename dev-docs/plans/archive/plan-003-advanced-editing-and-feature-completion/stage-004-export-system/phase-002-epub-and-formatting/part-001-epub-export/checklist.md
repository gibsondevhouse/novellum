---
part: part-001-epub-export
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] Install `epub-gen-memory`: `pnpm add epub-gen-memory`; verify it runs in a browser/Tauri context (no Node-only dependencies that break in a webview)
- [ ] If `epub-gen-memory` is Node-only, evaluate alternative: `epub` package or `jszip`-based manual assembly; document decision in `evidence/`
- [ ] Read `assembler.ts` — confirm `AssembledProject` shape

## Post-Implementation

- [ ] `epub-driver.ts` produces a Blob
- [ ] `.epub` opens in Calibre with no validation errors (attach Calibre check output as evidence)
- [ ] `.epub` opens in Apple Books (or Readium if on Linux) — screenshot to evidence
- [ ] NCX table of contents lists all chapters
- [ ] Cover page renders
- [ ] Font/size CSS applied in chapter HTML
- [ ] EPUB export button in Project Hub works end-to-end
- [ ] `pnpm run check` — zero errors; `pnpm run lint` — zero errors
