# Novellum UI kit

A high-fidelity interactive recreation of the Novellum app — the same surfaces a real user moves through.

## What's in here

| File | Mirrors in `novellum/` |
| --- | --- |
| `index.html` | Boots React + the kit |
| `app.jsx` | Click-thru navigation state |
| `AppShell.jsx` | `src/lib/components/AppShell.svelte` |
| `Sidebar.jsx` | `src/lib/components/AppSidebar.svelte` + `sidebar/*` |
| `Header.jsx` | `src/lib/components/AppHeader.svelte` |
| `LibraryScreen.jsx` | `src/routes/+page.svelte` + `modules/project/components/HomeLibraryShell.svelte` + `LibraryHeroCard.svelte` |
| `ProjectHubScreen.jsx` | `src/routes/projects/[id]/+page.svelte` + `ProjectHubHero.svelte` |
| `EditorScreen.jsx` | `src/modules/editor/components/EditorShell.svelte` + `ManuscriptEditorPane.svelte` |
| `ReaderScreen.jsx` | `src/modules/reader/components/BookReaderView.svelte` + `BookSpread.svelte` |
| `NovaPanel.jsx` | `src/modules/nova/components/NovaPanel.svelte` + composer + message log |
| `primitives.jsx` | `src/lib/components/ui/*` (Button, Input, StatusBadge, PillNav, EmptyState, SurfaceCard, BookCover) |
| `styles.css` | Compositional CSS using tokens from `../../colors_and_type.css` |

## Click-through

1. **Library** (default): a "Continue Reading" hero card on top, three stacked book cards below. Click any card → Project Hub.
2. **Project Hub**: title + cover + logline, six workspace tiles (Editor / Outline / World Building / Reader / Continuity / Export). Click *Continue Writing* → Editor. Click *Open Reader* → Reader.
3. **Editor**: chapter pill nav in the header, scene pills in the subheader, editable manuscript page (contentEditable) on a raised surface at the editor measure (65ch). Footer save-status bar.
4. **Reader**: paginated book spread (3:2 aspect, parchment surface, gutter, deep shadow). Pagination via `‹ 5 / 142 ›`.
5. **Nova panel**: toggle from the header star icon (or sidebar Nova). Greeting → quick prompt → conversation log with scripted scene-aware replies. The panel docks fixed at top: 48, right: 0, width 360px with a 10px resize handle on the left.

## Fidelity notes

- Uses the same token names as production (`--surface-raised`, `--accent-nova-blue`, `--ease-editorial`, …) via `colors_and_type.css`.
- The library card animation uses the production `novellum-enter` keyframe with the 50ms stagger.
- The book cover treatment (160° linear gradient + foil overlay + serif initial + spine label) is a direct port of `LibraryHeroCard.svelte`.
- The Reader's parchment page color (#f5f3ee) matches the production light-theme surface-base.
- The editor's contentEditable lets you actually type into the manuscript — useful for screenshot mockups.

## Known shortcuts

- **No real outline / world-building / continuity views** — those workspace tiles on the hub are decorative for now. If you need those screens mocked, ask and we'll add them.
- The Nova model picker dropdown is a static chip; the real one is a full menu (`ModelPickerDropdown.svelte`).
- No light-mode toggle wired up; the system supports it via `<html data-theme="light">` but the toggle UI is stubbed.
