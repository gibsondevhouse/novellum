# Export UI and Delivery Inventory — 2026-06-02

Inspected source:

- `src/modules/export/components/ExportModal.svelte`
- `src/routes/projects/[id]/+layout.svelte`
- `src/routes/projects/[id]/+page.svelte`
- `src/modules/project/components/ExportReadinessCard.svelte`
- `src/lib/desktop/index.ts`
- `src/lib/desktop/tauri-impl.ts`

Findings:

- Existing `ExportModal.svelte` is a JSON portability modal with `loading`, `exporting`, `copying`, `actionError`, and `actionSuccess` state.
- Existing browser download logic was inline anchor/object-URL code inside `ExportModal.svelte`.
- `src/lib/desktop` exposes `pickSaveLocation()`, but Tauri implementation currently throws controlled "not implemented" errors.
- Web fallback must remain first-class because desktop writing is not implemented.

Decision:

- Keep JSON portability in `ExportModal.svelte`.
- Add dedicated `ManuscriptExportDialog.svelte`.
- Move browser download behavior to `export-delivery.ts` and call it from both JSON and manuscript export paths.
