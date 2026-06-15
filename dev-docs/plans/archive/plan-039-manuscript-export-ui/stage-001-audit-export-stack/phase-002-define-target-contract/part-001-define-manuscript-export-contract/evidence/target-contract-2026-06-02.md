# Target Contract — 2026-06-02

Implemented request shape:

```ts
interface ManuscriptExportRequest {
	exportOptions: ExportOptions;
	compileOptions: ManuscriptCompileOptions;
	deliveryPreference?: ExportDeliveryPreference;
}
```

Rules:

- `exportOptions.format` remains the driver dispatch field.
- `compileOptions.profileId`, `metadata`, `includeFrontMatter`, `includeBackMatter`, and `selectedChapterIds` are passed to `assembleManuscript()`.
- Missing/empty metadata title falls back to project title or `Untitled Manuscript`.
- Optional metadata fields are trimmed and omitted when blank.
- All-chapter export omits `selectedChapterIds`.
- Empty `selectedChapterIds` is rejected by `exportProject()` and never means "all chapters."
- `backup_zip` is treated as project backup output and bypasses manuscript assembly.
- Browser download is guaranteed; desktop save is attempted only through existing capability surface and cancellation is neutral.

Normalized failure states:

- Validation: handled in the dialog before service call.
- Generation: `ExportServiceError` where possible.
- Delivery: `ExportDeliveryError` where browser fallback fails.
- Cancel: `cancelled` delivery result, not an error.
