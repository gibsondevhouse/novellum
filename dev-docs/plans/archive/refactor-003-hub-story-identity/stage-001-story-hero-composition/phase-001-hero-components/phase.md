---
title: Hero Components
slug: phase-001-hero-components
phase_number: 1
status: complete
owner: Frontend Agent
stage: stage-001-story-hero-composition
parts:
  - part-001-project-hub-hero-component
  - part-002-hero-edit-mode
estimated_duration: 1d
---

## Goal

Create all the hero component files: `ProjectHubHero`, `ProjectHeroCover`, `ProjectHeroContent`, and `ProjectHeroSynopsis`. Each component is a focused, single-responsibility Svelte 5 file using design-system tokens exclusively. The hero edit mode moves the edit trigger to a quiet secondary action — the hero surface is never an always-open form.

## Parts

| #   | Part                                                                                        | Status  | Assigned To      | Est. Duration |
| --- | ------------------------------------------------------------------------------------------- | ------- | ---------------- | ------------- |
| 001 | [ProjectHubHero Component Suite](part-001-project-hub-hero-component/part.md)              | `draft` | Frontend Agent   | 0.75d         |
| 002 | [Hero Edit Mode](part-002-hero-edit-mode/part.md)                                           | `draft` | Frontend Agent   | 0.25d         |

## Acceptance Criteria

- [ ] `ProjectHubHero.svelte`, `ProjectHeroCover.svelte`, `ProjectHeroContent.svelte`, `ProjectHeroSynopsis.svelte` all created
- [ ] Hero accepts `project: Project` and `onEdit: () => void` props
- [ ] Cover renders as a 2:3 aspect-ratio placeholder with a quiet "Add Cover" affordance
- [ ] Synopsis renders the full `project.synopsis` without truncation
- [ ] Edit trigger is a subtle secondary action (ghost button or pencil icon) — not a form field
- [ ] `pnpm run check` exits clean

## Notes

- Components live in `src/modules/project/components/` and must be exported via `src/modules/project/index.ts`
- Logline must be visually stronger than synopsis (use `--font-display` + larger text-size for logline; `--font-sans` + `--text-sm` for synopsis)
