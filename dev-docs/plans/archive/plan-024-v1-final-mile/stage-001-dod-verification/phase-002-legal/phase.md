---
title: Legal — `/settings/legal` route + about-page link
slug: phase-002-legal
phase_number: 2
status: complete
owner: Stylist Agent
stage: stage-001-dod-verification
parts: []
estimated_duration: 0.1d
closed: 2026-05-26
---

## Goal

Close DoD failures **F1** and **F2** identified in the phase-001
triage:

- **F1** — `/settings/legal` route does not exist.
- **F2** — `/settings/about` does not link to `/settings/legal`.

Close the loop on the existing **F6** drift risk (privacy text
duplicated inline diverging from `PRIVACY.md`) by sourcing the legal
content directly from the canonical `EULA.md` and `NOTICE.md` at the
repo root via Vite `?raw` import — no inline duplication, no future
drift.

## Acceptance Criteria

- [x] `src/routes/settings/legal/+page.svelte` exists and renders both
      the End User License Agreement and the Third-Party Notices.
- [x] Legal content is sourced from the root `EULA.md` and `NOTICE.md`
      via `?raw` import — no inline copy.
- [x] Settings PillNav includes a `Legal` tab pointing to
      `/settings/legal`.
- [x] `/settings/about` shows a link to `/settings/legal` in a new
      "Legal" detail row.
- [x] `pnpm check` passes against the worktree (1598 files, 0 errors).
- [x] `pnpm build` passes; build artifact for the legal page is at
      `.svelte-kit/output/server/entries/pages/settings/legal/_page.svelte.js`
      and contains the bundled EULA + NOTICE strings (verified by grep).
- [x] Per-file `eslint` and `stylelint` invocations on the changed
      files exit clean.
- [x] `pnpm check:tokens` passes (312 files, 0 violations).

## Files Changed

**Created:**
- `src/routes/settings/legal/+page.svelte` — new route, ~75 LOC.

**Updated:**
- `src/routes/settings/+layout.svelte` — added `{ id: 'legal', label: 'Legal' }` to PillNav items (1 LOC).
- `src/routes/settings/about/+page.svelte` — added "Legal" detail row with `<a href="/settings/legal">` link + `.about__link` style (~10 LOC).

## Notes

- Drift mitigation: by importing `EULA.md` and `NOTICE.md` via Vite
  `?raw`, the legal page is **structurally guaranteed** to match the
  canonical files — no parity check or sync script needed. This same
  pattern is the recommended fix for F6 (privacy drift).
- Rendering: the legal documents are shown as `<pre class="legal__doc">`
  with `white-space: pre-wrap` and `overflow-wrap: break-word`. No
  markdown library was added (none was previously in deps). The text
  is readable as-is; a richer renderer can be added later without
  changing the data flow.
- Initial bundle impact: the legal route is a separate chunk
  (`.svelte-kit/output/.../settings/legal/_page.svelte.js`, ~7.2 KB
  uncompressed including both bundled .md files). Loaded only when
  the user navigates to `/settings/legal`.
- Pre-existing gate noise (eslint config + 2 SceneCompassPanel
  stylelint nits + worktree-derived vitest discovery) is unchanged
  by this phase. Tracked under stage-001 follow-up.
