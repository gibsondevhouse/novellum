---
part: part-002-migrate-utility-actions
last_updated: 2026-04-13
---

# Implementation Checklist

## Pre-Implementation

- [ ] Parent phase and stage are `in-progress`
- [ ] `part-001-remove-project-header` is `complete`
- [ ] `part.md` has been reviewed and accepted
- [ ] Dev environment ready; Hub page inspected to understand current context usage

## Implementation

- [ ] `hub-actions` area added to Hub `+page.svelte`
- [ ] Edit button wired to `openEdit()` from `projectActions` context
- [ ] Delete button wired to delete dialog
- [ ] Export button wired to export flow
- [ ] Actions styled as ghost/secondary buttons — not primary CTAs
- [ ] Hub page stays ≤150 lines
- [ ] All acceptance criteria in `part.md` satisfied

## Post-Implementation

- [ ] `pnpm run lint` passes with zero errors
- [ ] `pnpm run check` passes with zero errors
- [ ] At least one artifact in `evidence/` (screenshot of Hub page showing action row)
- [ ] `impl.log.md` updated with final entry
- [ ] Part `status` updated to `review` in `part.md` frontmatter
- [ ] Reviewer notified / Reviewer Agent invoked
