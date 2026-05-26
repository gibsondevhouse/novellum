---
part: part-002-version-history-ui
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] Confirm `autosaveService.flushNow()` is exported from part-001's autosave service
- [ ] Confirm `DocumentEditorFrame.svelte` exposes a `setContent(text)` method (bound via `bind:this` or Svelte 5 exposed function)
- [ ] Choose diff library: `diff` (npm) or `diff-match-patch`; install with `pnpm add <package>`

## Post-Implementation

- [ ] Panel renders list of snapshots with relative timestamps
- [ ] Diff view renders correctly: added lines green, deleted lines red
- [ ] "Restore" flow: editor content changes, Dexie record updated within ~100ms, new snapshot row appears in panel at top
- [ ] Panel closes cleanly on toggle (no memory leaks from diff lib subscriptions)
- [ ] `VersionHistoryPanel.svelte` ≤150 lines (attach `wc -l` output)
- [ ] `pnpm run check` — zero errors; `pnpm run lint` — zero errors
