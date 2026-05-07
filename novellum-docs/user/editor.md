# The Editor

> Last verified: 2026-05-07

Novellum's editor is a **scene-focused** rich-text editor built on TipTap. It is designed for long-form fiction — quiet UI, autosave, and snapshot history so you never lose a draft.

## Anatomy

- **Editor pane** — the writing surface itself. Standard formatting (bold, italic, headings, lists). Block quotes for letters, dialogue, etc.
- **Toolbar** — a thin pill-style bar at the top with the formatting controls. Hidden in focus modes.
- **Save status** — small indicator showing `Saved`, `Saving…`, or last-saved time.
- **Snapshot history** — periodic full-scene snapshots. Open the panel from the toolbar to restore an earlier version.
- **Version history** — diff-style view of changes within the current session.

## Two ways to open

- **Multi-pane:** `/projects/<id>/editor` — see multiple scenes side-by-side. Useful for comparing or moving content.
- **Focused:** click a scene in the outline to open `/projects/<id>/editor/<sceneId>` — single scene, full attention.

## Autosave

Autosave runs continuously while you type, debounced to avoid overhead. If the app or your machine crashes, the recovery service rehydrates unsaved edits when you reopen. You will see a small "Recovered draft" indicator.

## Snapshots

A scene snapshot is a full point-in-time copy of the scene content. Snapshots are taken automatically and on demand. Restore from the snapshot history panel; the current scene is itself snapshotted before the restore so nothing is destroyed.

## Beats

Each scene can carry **beats** — short structural notes ("character X confronts Y", "twist reveal"). Beats are stored separately from prose and are AI-friendly: agents can use them to summarise or rewrite.

## What the editor does **not** do

- **No AI auto-edits.** Any AI suggestion must be explicitly accepted. See [nova.md](./nova.md).
- **No collaboration.** Single-author by design.
- **No cloud sync.** Your scenes live in your local SQLite file.

## Keyboard shortcuts

See [keyboard-shortcuts.md](./keyboard-shortcuts.md).

## Troubleshooting

- **Save status stuck on "Saving…":** open Settings → Data → Storage location and confirm the path is writable.
- **Lost scene content:** open the snapshot history for that scene and pick the most recent good snapshot.
- **Editor feels slow:** very long single scenes (50k+ words) may benefit from being split. Novellum is tuned for typical scene sizes.
