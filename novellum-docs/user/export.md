# Export

> Last verified: 2026-05-07

Novellum exports your manuscript to four formats. All exports run locally — no upload, no remote service.

## Supported formats

| Format | Use it for |
| --- | --- |
| **DOCX** | Submitting to editors, agents, beta readers. |
| **EPUB** | Sharing readable copies on e-readers. |
| **Markdown** | Working with version control or other markdown tools. |
| **TXT** | Plain text for archival or non-prose tools. |

## How to export

1. Open the project.
2. Go to **Settings → Data → Export**, or use the export button in the project hub (depending on the build).
3. Pick a format.
4. Configure options (front matter, scene breaks, chapter formatting).
5. Save the file to disk.

## What gets exported

- Manuscript prose: arcs → acts → chapters → scenes, in order.
- Scene breaks rendered per format conventions.
- Chapter titles and numbering as configured.

## What doesn't get exported

- World-building entries (these are reference material, not manuscript content).
- Beats (scene-internal structural notes).
- Snapshots and version history.
- Your AI key, your settings, your scratchpads.

If you want a complete portable copy of your project including world-building and history, use a `.novellum.zip` backup instead — see [backup-restore.md](./backup-restore.md).

## Per-project export settings

Your last-used export options are remembered per project. Adjust them in **Settings → Data**.

## Troubleshooting

- **"Export looks empty."** Confirm at least one scene has content. Empty scenes are skipped.
- **DOCX styles look wrong in Word.** Novellum applies its own minimal style set; you can re-style in Word after import.
- **EPUB rejected by e-reader.** Some older readers don't support EPUB 3 features. Try the DOCX or Markdown export instead.
