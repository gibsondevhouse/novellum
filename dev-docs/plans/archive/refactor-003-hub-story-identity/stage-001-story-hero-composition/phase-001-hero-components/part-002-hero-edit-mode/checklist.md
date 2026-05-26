---
part: part-002-hero-edit-mode
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] Read `+layout.svelte` for `projects/[id]` — confirm `openEdit` is injected via `setContext('projectActions', { openEdit })`
- [ ] Confirm `EditProjectForm.svelte` is triggered by that `openEdit` call
- [ ] Ensure part-001-project-hub-hero-component is complete (all 4 components created)

## Post-Implementation

- [ ] Grep hero component tree for `<input`, `<textarea`, `<form` — zero matches
- [ ] "Edit details" button present in `ProjectHeroContent` below synopsis
- [ ] Clicking it opens the edit modal — test in browser
- [ ] "Add Cover" button calls `onEdit()` — test in browser
- [ ] "Add a logline" and "Add a synopsis" ghost buttons call `onEdit()` — test in browser
- [ ] Edit button is keyboard-reachable via Tab
- [ ] Edit contract JSDoc comment present in `ProjectHubHero.svelte`
- [ ] `pnpm run check` — zero errors
