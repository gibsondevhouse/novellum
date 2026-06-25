---
title: Dossier Hyperlink Resolver
slug: part-001-dossier-link-resolver
part_number: 1
status: complete
owner: Planner Agent
assigned_to: —
phase: phase-001-inline-hyperlinks
started_at: 2026-06-25
completed_at: 2026-06-25
estimated_duration: undefined
---

## Objective

Parse lore descriptions dynamically to replace entity markup tags with interactive navigation links.

## Scope

**In scope:**

- Parse tags like @character:id or #location:id inside markdown fields.
- Render them as active navigation anchors.

**Out of scope:**

- Text styling formats beyond standard markdown linking.

## Implementation Steps

1. Develop dossier-link-resolver.ts.
2. Integrate parser output inside dossier detail header layouts.

## Files

**Create:**

- `src/modules/story-bible/services/dossier-link-resolver.ts`
- `src/modules/story-bible/components/BiographyPanel.svelte`
- `tests/story-bible/dossier-link-resolver.test.ts`
- `tests/story-bible/biography-panel.svelte.test.ts`

**Update:**

- `src/modules/story-bible/components/StoryBibleWorkspacePage.svelte`
- `src/modules/story-bible/index.ts`

## Acceptance Criteria

- [x] Regex correctly matches entity markers.
- [x] Clicking navigates to targeted workspace view.

## Edge Cases

- Invalid IDs match: render tag as static text to prevent broken link clicks.

## Notes

> Part-level context for Dossier Hyperlink Resolver.
