# Plan-015 Seed Fixture Specification

Date: 2026-04-20

## Goal

Provide a repeatable fixture that makes project-level cinematic UI validation deterministic for screenshots and manual QA.

## Minimum Seed Data

### Project set

- 1 novel project with uploaded cover image.
- 1 novel project without cover image (placeholder path).
- 1 short story project.

### Narrative structure

- At least 2 arcs.
- At least 3 acts (with arc linkage via `acts.arcId`).
- At least 6 chapters distributed across acts.
- At least 12 scenes with varied word counts (very short, medium, long).
- At least 20 beats across multiple scenes.

### World-building entities

- Characters: 8+ (mixed with and without portrait assets).
- Character relationships: 6+.
- Locations: 6+.
- Lore entries: 8+.
- Plot threads: 6+.
- Timeline events: 10+.
- Continuity/consistency issues: 6+ with mixed severities.

### Media assets

- 10+ uploaded images in global gallery.
- 4+ images linked to project entities.
- At least one entity of each major type without image to verify deterministic fallback visuals.

## Required Validation States

Capture screenshot-ready states for each family:

- App-level: populated and empty libraries.
- Hub: cover-present and cover-missing variants.
- Outline: dense and sparse hierarchy.
- Editor: no active scene, active scene, and scene history visible.
- World-building: each top section with both populated and empty examples.
- Continuity: no issues and mixed-issue state.
- Images: filled gallery and near-empty gallery.
- Settings/migrate: idle, in-progress, and failure-visible state.

## Reproducibility Notes

- Use stable fixture IDs where possible.
- Do not rely on random ordering; ensure deterministic `order` fields.
- Record asset filenames used for key hero/poster examples.
- Ensure fixture can be recreated after DB reset without manual styling edits.

## Data Sources

- Primary: SQLite via `/api/db/*`.
- Portability verification only: Dexie `.novellum.zip` flow.
