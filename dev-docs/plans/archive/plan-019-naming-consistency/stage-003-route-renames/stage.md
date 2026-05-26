---
title: Route Renames
slug: stage-003-route-renames
stage_number: 3
status: draft
owner: Architect Agent
plan: plan-019-naming-consistency
phases:
  - phase-001-rename-route-folders
  - phase-002-redirect-legacy-paths
  - phase-003-update-internal-links
estimated_duration: 1d
risk_level: medium
---

## Goal

Move every `src/routes/**` folder into its canonical name and
ensure every old URL still resolves (via SvelteKit `redirect()`
in a thin `+page.ts`) so existing links and `goto()` calls do
not break.

## Phases

| #   | Phase                                                                                       | Status  | Est. Duration |
| --- | ------------------------------------------------------------------------------------------- | ------- | ------------- |
| 001 | [Rename route folders](phase-001-rename-route-folders/phase.md)                             | `draft` | 0.5d          |
| 002 | [Redirect legacy paths](phase-002-redirect-legacy-paths/phase.md)                           | `draft` | 0.25d         |
| 003 | [Update internal links](phase-003-update-internal-links/phase.md)                           | `draft` | 0.25d         |

## Entry Criteria

- Stages 001 and 002 complete.

## Exit Criteria

- Every URL listed in the canonical name map resolves to its
  intended page.
- Every retired URL emits a 308 redirect to its canonical
  successor.
- All `goto()` calls, `<a href>`s, sidebar config, and
  breadcrumb data use canonical paths.
- `pnpm run check` and `pnpm run lint` pass.

## Notes

- Use `git mv` so history is preserved.
- The dynamic editor route shape (`/editor` and
  `/editor/[sceneId]`) stays nested; only file/folder names may
  change inside, not the URL hierarchy.
- Do not delete legacy folders before adding the redirect
  `+page.ts`; do them in the same commit so no commit leaves the
  app with broken URLs.
