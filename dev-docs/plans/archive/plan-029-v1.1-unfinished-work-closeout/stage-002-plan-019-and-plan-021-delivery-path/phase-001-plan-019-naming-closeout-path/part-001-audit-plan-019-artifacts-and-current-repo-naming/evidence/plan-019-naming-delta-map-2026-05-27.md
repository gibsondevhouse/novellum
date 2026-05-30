# plan-019 Naming Delta Map

> Generated: 2026-05-27
> Method: comparison of plan-019 intent vs current repo state

## Original plan-019 Pain Points vs Current State

| Original Issue | plan-019 Intent | Current State | Delta |
|---------------|----------------|---------------|-------|
| `outline/` route vs `outliner/` module | Align to single name | Both are `outline/` | **resolved** |
| `bible/` and `world-building/` coexist | Pick one, redirect other | Both route and module are `story-bible/` and `world-building/` (separate features) | **resolved** |
| `consistency/` and `continuity/` coexist | Pick one, redirect other | Both route and module are `continuity/` | **resolved** |
| Editor sibling routes unsignposted | Rename to clarify | `editor/` route with `[sceneId]` nesting | **resolved** |
| `+layout.svelte.bak` stale artifact | Remove in stage-006 | No `.bak` files found in `src/` | **resolved** |

## Route/Module Alignment Matrix

### Project sub-routes (`src/routes/projects/[id]/…`)

| Route | Module | ESLint Boundary | Docs | Status |
|-------|--------|----------------|------|--------|
| `arcs/` | (outline sub-feature) | — | — | **intentional** — arc navigation within outline |
| `continuity/` | `continuity/` | `module-continuity` | `04-modules/continuity.md` | aligned |
| `editor/` | `editor/` | `module-editor` | `04-modules/editor.md` | aligned |
| `outline/` | `outline/` | `module-outline` | `04-modules/outline.md` | aligned |
| `services/` | (cross-cutting) | — | — | **intentional** — shared project services page |
| `story-bible/` | `story-bible/` | `module-story-bible` | `04-modules/story-bible.md` | aligned |
| `world-building/` | `world-building/` | `module-world-building` | `04-modules/world-building.md` | aligned |

### Top-level routes (`src/routes/…`)

| Route | Module | Status | Rationale |
|-------|--------|--------|-----------|
| `books/` | `reader/` | **intentional mismatch** | User-facing URL uses "books" (domain language); module uses "reader" (technical function) |
| `images/` | `assets/` | **intentional mismatch** | User-facing URL uses "images" (what they see); module uses "assets" (technical scope) |
| `nova/` | `nova/` | aligned | |
| `onboarding/` | — | **standalone** | First-run flow, no module needed |
| `projects/` | `project/` | **minor** | Plural route for listing, singular module for data |
| `settings/` | `settings/` | aligned | |
| `stories/` | — | **standalone** | Listing page, uses `project/` module internally |
| `styles/` | — | **standalone** | Writing style management, uses `project/` module |

### Documentation alignment

| Doc | Naming Status |
|-----|---------------|
| `dev-docs/04-modules/*.md` | All match current module names |
| `dev-docs/02-architecture/routing.md` | References current route names |
| `dev-docs/02-architecture/modular-boundaries.md` | References current module names |
| `eslint.config.js` boundary patterns | Match current module dirs (lines 59-145) |

### `/api/db/*` exclusion

Confirmed: no `/api/db/*` routes were renamed or are in scope. All API resource paths are intact.

## Summary

- **5 of 5 original pain points** from plan-019 are resolved (organic evolution through plans 020-028)
- **7 of 7 project sub-routes** are aligned or intentionally structured
- **Top-level route/module mismatches** (`books/reader`, `images/assets`, `projects/project`) are intentional domain-vs-technical naming splits, not bugs
- **No stale `.bak` files** exist
- **No redirect stubs** needed (old routes were never live in production)
- **ESLint boundary patterns** are current
- **Documentation** reflects current names

**Conclusion:** plan-019's original scope is fully addressed by organic evolution. No code renames are needed.
