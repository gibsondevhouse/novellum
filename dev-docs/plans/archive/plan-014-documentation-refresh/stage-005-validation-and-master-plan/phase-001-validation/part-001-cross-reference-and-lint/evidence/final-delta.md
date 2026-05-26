# Final Delta — plan-014-documentation-refresh

**Date:** 2026-04-20

## Files Updated

- `dev-docs/frontend-context.md` — rewritten: Svelte 5 Runes, current module list, `IndividualsWorkspaceShell` note, dropped `workspace/` module ghost.
- `dev-docs/backend-context.md` — already accurate; no content changes required this pass.
- `dev-docs/routing-context.md` — rewritten: shipped route tree for `/projects/[id]/…` and `/api/*`.
- `dev-docs/project-context.md` — replaced feature sub-route list (dropped `/workspace`, added `/outline`, `/arcs`, `/bible`, `/continuity`).
- `dev-docs/project-overview.md` — dropped legacy "formerly X" wording for World Building / Workspace / Consistency.
- `dev-docs/architecture.md` — schema version bumped from v8 to v11.
- `dev-docs/data-model.md` — added authoritative "Current Shipped Tables" section covering all 18 Dexie entities plus server-only SQLite resources.
- `dev-docs/agents-map.md` — rewritten: marks 4 shipped agents (Continuity/Edit/Rewrite/Style) vs 4 planned (Brainstorm/Outline/Draft/Summary); aligned with `src/lib/ai/types.ts`.
- `dev-docs/modules/story-bible.md` — rewritten: canonical Personae/Atlas/Archive/Threads/Chronicles naming with `IndividualsWorkspaceShell`.
- `dev-docs/modules/consistency-engine.md` — rewritten: differentiates `src/modules/consistency/` (engine) vs `src/modules/continuity/` (UI).
- `novellum-docs/docs/user-manual.md` — World Building description updated to current section names.

## Evidence Created

- `stage-001-audit-and-inventory/.../evidence/doc-inventory.md`
- `stage-001-audit-and-inventory/.../evidence/terminology-glossary.md`
- `stage-005-validation-and-master-plan/.../evidence/lint-2026-04-20.txt`

## Validation

- `pnpm run lint` → **EXIT: 0**
- Ground truth verified against: `src/modules/`, `src/lib/ai/`, `src/lib/db/schema.ts` (v11), `src/routes/`, `eslint.config.js`, `package.json`, `AGENTS.md`.

## Key Corrections vs Prior State

1. **Schema version** — docs previously said v8; actual shipped version is v11.
2. **Agent roster** — docs previously implied 8 shipped agents; only 4 are implemented. Remaining 4 now labeled "planned".
3. **Module naming** — dropped ghost references to `src/modules/workspace/` (does not exist; `eslint.config.js` retains a `module-workspace` boundary type for historical reasons).
4. **Route tree** — project-scoped routes: `/hub`, `/outline`, `/arcs`, `/world-building`, `/bible`, `/consistency`, `/continuity`, `/editor`. No `/workspace`.
5. **World-building sub-sections** — Personae / Atlas / Archive / Threads / Chronicles (legacy names deprecated).
6. **Data model** — added `assets` (v9), `milestones` (v10), `acts.arcId` index (v11), and the full current entity list.
