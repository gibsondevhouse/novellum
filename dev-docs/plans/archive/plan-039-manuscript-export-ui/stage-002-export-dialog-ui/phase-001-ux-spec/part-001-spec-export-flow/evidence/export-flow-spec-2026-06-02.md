# Export Flow Spec — 2026-06-02

Implemented dialog sections:

1. Header: title, project title, destination selector.
2. Format: radio-card grid from `EXPORT_FORMAT_OPTIONS`; no PDF.
3. Profile: radio-card grid from `MANUSCRIPT_PROFILES`.
4. Metadata: title, author, optional metadata details.
5. Chapters: all/range/selected selector with count and validation.
6. Formatting: font, size, line spacing, chapter heading style, front/back matter toggles.
7. Footer: selected chapter summary, status/alert messages, close/retry/export actions.

Coexistence:

- Project hub `Export manuscript` opens the manuscript dialog.
- `Project JSON` opens the existing JSON portability modal.

Validation:

- Empty manuscript blocks export before service call.
- Selected/range modes resolving to zero chapters block export.
- Backup ZIP disables manuscript-specific controls and uses project backup labeling.

Responsive behavior:

- Dialog width is constrained to `min(960px, 92vw)`.
- Format/profile grids collapse on narrower viewports.
- Footer actions wrap instead of overflowing.
