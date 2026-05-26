---
part: part-001-outline-to-workspace-rename
last_updated: 2026-04-13
---

# Implementation Checklist

## Pre-Implementation

- [ ] Parent phase and stage are `in-progress`
- [ ] Stage 001 complete; Hub route updated to `/hub`
- [ ] `src/modules/outliner/index.ts` exists and has been reviewed
- [ ] `part.md` reviewed and accepted

## Implementation

- [ ] `src/routes/projects/[id]/workspace/+page.svelte` created (≤150 lines)
- [ ] `src/routes/projects/[id]/workspace/+page.ts` created
- [ ] `src/modules/workspace/index.ts` proxy barrel created
- [ ] Old `outline/+page.ts` replaced with redirect to `/workspace`
- [ ] Old `outline/+page.svelte` emptied
- [ ] User-visible "Outline" labels updated to "Workspace" in new page
- [ ] All acceptance criteria in `part.md` satisfied

## Post-Implementation

- [ ] `pnpm run lint` passes with zero errors
- [ ] `pnpm run check` passes with zero errors
- [ ] At least one artifact in `evidence/` (screenshot of Workspace surface at new URL with sidebar Workspace item active)
- [ ] `impl.log.md` updated with final entry
- [ ] Part `status` updated to `review` in `part.md` frontmatter
- [ ] Reviewer notified / Reviewer Agent invoked
