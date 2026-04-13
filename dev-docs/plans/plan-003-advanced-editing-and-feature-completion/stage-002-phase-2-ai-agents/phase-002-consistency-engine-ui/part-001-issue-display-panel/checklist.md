---
part: part-001-issue-display-panel
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] Read `src/modules/consistency/services/consistency-repository.ts` — confirm `getByProject(projectId)` method exists
- [ ] Confirm `ConsistencyIssue` schema in `src/lib/db/schema.ts` matches part-001-continuity-agent spec
- [ ] Read `dev-docs/modular-boundaries.md` §Module Boundary Rules — confirm consistency module placement

## Post-Implementation

- [ ] Consistency panel renders all open issues for active project on load
- [ ] Issues grouped by type; groups collapse/expand correctly
- [ ] Severity badges visually distinct as specified
- [ ] Count badge in sidebar nav updates reactively when issue list changes
- [ ] Empty state shown when no open issues
- [ ] `pnpm run check` — zero errors
- [ ] `pnpm run lint` — zero errors
- [ ] `ConsistencyPanel.svelte` ≤150 lines (attach `wc -l` output)
