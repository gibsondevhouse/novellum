---
phase: phase-002-legal
last_updated: 2026-05-10
---

# Implementation Checklist

## Pre-Implementation

- [x] Parent stage and plan are `in-progress`
- [x] Phase-001 triage identifies F1 + F2 as in-scope hard failures
- [x] Sourcing approach decided: Vite `?raw` import from root .md
      files (rejects inline duplication to avoid F6-style drift)

## Implementation

- [x] `src/routes/settings/legal/+page.svelte` created
- [x] `src/routes/settings/+layout.svelte` PillNav updated
- [x] `src/routes/settings/about/+page.svelte` link added
- [x] All token references use existing CSS custom properties

## Post-Implementation

- [x] `pnpm check` clean (1598 files, 0 errors)
- [x] `pnpm build` succeeds; legal page chunk built; bundled markdown
      verified by grep on the output JS
- [x] `pnpm check:tokens` clean (312 files, 0 violations)
- [x] Per-file `eslint` clean on the 3 changed files
- [x] Per-file `stylelint` clean on the 3 changed files (after fixing
      one `word-wrap` → `overflow-wrap` deprecation)
- [x] Evidence file created (`evidence/legal-2026-05-10.md`)
- [x] `impl.log.md` updated with final entry
- [x] Phase status set to `review` in `phase.md` frontmatter
- [x] Reviewer notified / Reviewer Agent invoked  <!-- closed 2026-05-26: signed off in impl.log.md -->
