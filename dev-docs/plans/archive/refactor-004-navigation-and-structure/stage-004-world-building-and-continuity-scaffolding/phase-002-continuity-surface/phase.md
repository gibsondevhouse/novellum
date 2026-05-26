---
title: Continuity Surface
slug: phase-002-continuity-surface
phase_number: 2
status: draft
owner: Frontend Agent
stage: stage-004-world-building-and-continuity-scaffolding
parts:
  - part-001-continuity-route-scaffold
  - part-002-continuity-scope-extension
estimated_duration: 1d
---

## Goal

Create the `/projects/[id]/continuity` route. Redirect old `/consistency` to `/continuity`. Render existing `ConsistencyPanel` content under the new surface name. Extend the Continuity page scope with stub sections for Writing Styles and Prompts.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Continuity Route Scaffold](part-001-continuity-route-scaffold/part.md) | `draft` | Frontend Agent | 0.5d |
| 002 | [Continuity Scope Extension](part-002-continuity-scope-extension/part.md) | `draft` | Frontend Agent | 0.5d |

## Acceptance Criteria

- [ ] Route `src/routes/projects/[id]/continuity/+page.svelte` exists and renders consistency issues
- [ ] `src/routes/projects/[id]/consistency/+page.ts` redirects to `/continuity`
- [ ] `src/modules/continuity/index.ts` exists and re-exports from `src/modules/consistency/`
- [ ] Continuity page displays: Issues tab (functional) + Writing Styles stub + Prompts stub
- [ ] Writing Styles and Prompts stubs are visually distinct from active sections (locked / coming-soon treatment)
- [ ] Continuity sidebar item shows active state on `/continuity` route
- [ ] `pnpm run check` exits clean

## Notes

- `src/modules/consistency/` is not deleted — the proxy module `src/modules/continuity/index.ts` re-exports from it
- Writing Styles stub: a card-sized placeholder with title "Writing Styles" and "Coming soon" text — no interactive elements
- Prompts stub: two placeholder cards labeled "System Prompt" and "Negative Prompt" — lock icon, reduced opacity
- A lightweight tab or section switcher can be used to organise Issues vs Styles vs Prompts within the Continuity page
