---
title: Naming Consistency Refactor
slug: plan-019-naming-consistency
version: 1.0.0
status: deferred-to-v1.1
owner: Planner Agent
created: 2026-05-02
last_updated: 2026-05-26
target_completion: 2026-05-09
stages:
  - stage-001-audit-and-canonical-name-map
  - stage-002-documentation-alignment
  - stage-003-route-renames
  - stage-004-module-renames
  - stage-005-component-renames
  - stage-006-verification-and-cleanup
dependencies:
  - plan-017-v1-trust-foundation
quality_gates:
  - lint
  - typecheck
  - tests
  - boundaries
  - docs_sync
---

## Objective

Rationalize file and route names across the application so that every
`+page.svelte`, every module folder, and every prominent component
clearly reflects the page or interface it powers. The current tree
has drifted: routes and modules sometimes share a name with different
spelling (`outline/` route vs `outliner/` module), legacy and new
names coexist in parallel (`bible/` and `world-building/`,
`consistency/` and `continuity/`), and the editor area exposes two
sibling routes with the same `editor/` segment but radically
different surfaces — none of which is signposted by file names.

The deliverable is a single, documented naming convention applied
end-to-end: route segment matches module folder, module folder
matches doc terminology, and component file names match the screens
they render. URLs that have ever been linked from anywhere user-
facing must remain reachable (redirects) so existing bookmarks, in-
app links, and `goto()` calls do not silently break.

## Scope

**In scope:**

- All folders under `src/routes/projects/[id]/` and any other route
  area where the segment name and module/component names disagree
  (top-level routes: `books/`, `stories/`, `nova/`, `settings/`,
  `styles/`, `images/`).
- All module folders under `src/modules/`.
- All Svelte components and `.ts` files inside those modules whose
  names do not clearly map to the screen/section they render.
- All `goto()` calls, `<a href>`s, breadcrumbs, and navigation
  components that reference the old paths.
- All `$lib`/`$modules` import paths.
- All authoritative docs in `dev-docs/` that currently encode the
  old names: `repo-structure.md`, `routing-context.md`,
  `frontend-context.md`, `modular-boundaries.md`, `architecture.md`,
  `agents-map.md`, the per-module docs in `dev-docs/modules/`, and
  the AGENTS.md / GEMINI.md root files where they reference paths.
- ESLint `eslint-plugin-boundaries` element-rule patterns, which
  encode module names in regex form and will break the second a
  folder is renamed.
- Test paths under `tests/` that mirror the module tree.
- Stale artifacts blocking the rename
  (`src/routes/projects/[id]/+layout.svelte.bak`).

**Out of scope:**

- Any *behavioural* change to the renamed surfaces. This plan is
  pure-rename + path/import update; if a screen is buggy, it stays
  buggy and gets a follow-up plan reference (e.g. RecoveryPrompt
  only mounted on `/editor/[sceneId]` — fixed by plan-018, not
  here).
- Database schema / API route renames (`/api/db/*`). Server-side
  resource names are not part of the user-facing UI vocabulary and
  changing them would invalidate existing user data.
- The `dev-docs/plans/` artefact tree — old plans keep their
  historical names.

## Stages

| #   | Stage                                                                                            | Status  | Est. Duration |
| --- | ------------------------------------------------------------------------------------------------ | ------- | ------------- |
| 001 | [Audit & canonical name map](stage-001-audit-and-canonical-name-map/stage.md)                    | `draft` | 1d            |
| 002 | [Documentation alignment](stage-002-documentation-alignment/stage.md)                            | `draft` | 1d            |
| 003 | [Route renames](stage-003-route-renames/stage.md)                                                | `draft` | 1d            |
| 004 | [Module renames](stage-004-module-renames/stage.md)                                              | `draft` | 1d            |
| 005 | [Component renames](stage-005-component-renames/stage.md)                                        | `draft` | 1d            |
| 006 | [Verification & cleanup](stage-006-verification-and-cleanup/stage.md)                            | `draft` | 0.5d          |

## Quality Gates

All stages must pass the following gates before the plan is marked `complete`:

- [ ] **lint** — `pnpm run lint` passes with zero errors, including
      `eslint-plugin-boundaries` after pattern updates.
- [ ] **typecheck** — `pnpm run check` passes with zero errors;
      `tsconfig.json` `paths` block reflects renamed `$modules/*`
      aliases.
- [ ] **tests** — `pnpm run test` passes; affected suites updated
      for new import paths only, no behavioural assertions changed.
- [ ] **boundaries** — `eslint-plugin-boundaries` element regexes
      in `eslint.config.js` updated; `pnpm run lint` proves no
      cross-module leakage was masked by the rename.
- [ ] **docs_sync** — `dev-docs/repo-structure.md`,
      `dev-docs/routing-context.md`,
      `dev-docs/modular-boundaries.md`,
      `dev-docs/frontend-context.md`,
      `dev-docs/architecture.md`,
      `dev-docs/agents-map.md`,
      `dev-docs/modules/*.md`,
      `AGENTS.md`, `GEMINI.md` all reflect the new names.
- [ ] **manual smoke** — every route reachable from the sidebar +
      any in-page navigation lands on the expected screen.

## Risks & Mitigations

| Risk                                                              | Likelihood | Mitigation                                                                                                                                                  |
| ----------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Broken in-app links after route rename                            | high       | Stage 003 produces a redirect map; every old segment ships a `+page.ts` `redirect(308, …)` for at least one minor version.                                  |
| Boundary lint silently passes because regexes still match old paths | medium   | Stage 004 part-001 updates `eslint.config.js` first, then renames; lint must fail before the rename and pass after to prove the rule is wired.              |
| Tests pass on stale import paths because Vitest caches module aliases | medium | Stage 006 includes a clean reinstall + test run to ensure no `.vite/` or `node_modules/.vite` cache hides the rename.                                       |
| Docs and code drift again immediately after the rename            | medium     | Stage 002 lands docs *before* code so docs are the source of truth; Stage 006 enforces docs_sync as a quality gate.                                         |
| User confusion if `bible/` and `world-building/` map to the same screen | low    | Stage 001 explicitly forces a binary decision — keep one, redirect the other — and records the rationale in the canonical name map.                         |
| Editor `/editor` vs `/editor/[sceneId]` rename leaks into plan-018 RecoveryPrompt scope | low | Stage 003 phase covering editor leaves the route shape intact (still nested), only renames file/component names; behavioural fixes stay in plan-018. |

## Notes

- This plan is structural / cosmetic only. No surface should change
  what it does — only what it is called.
- Stage 001's name map is the single source of truth all other
  stages read from. Do not start Stage 002 until the name map has
  user sign-off.
- The stale `+layout.svelte.bak` is removed as part of Stage 006
  (cleanup), not earlier, in case it turns out to be load-bearing
  context for one of the rename diffs.
- Plan-017 closure (V1 trust foundation) is a soft prereq: the
  recovery / autosave / packaging surfaces it touched are now
  stable, so renames here won't collide with mid-flight feature
  work.
- After this plan completes, **plan-018-v1-product-experience**
  should pick up the RecoveryPrompt-only-mounted-on-secondary-route
  bug as a separate concern.
