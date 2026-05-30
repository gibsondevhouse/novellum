---
part: part-001-wire-project-entity-querying
last_updated: 2026-05-28
---

# Implementation Checklist

## Pre-Implementation

- [ ] Parent phase and stage are `in-progress`.
- [ ] All declared dependencies are `complete` or intentionally waived.
- [ ] `part.md` has been reviewed and accepted.
- [ ] Dev environment is ready.
- [ ] Stop conditions from `agent-handoff.md` have been reviewed.

## Implementation

- [ ] Inventory existing repository/API access for scenes, characters, locations, and outline nodes.
- [ ] Use existing `/api/db/*` resource paths; do not add client SQLite access.
- [ ] Normalize returned entities into attachment candidates.
- [ ] Add search/filter behavior scoped to loaded candidates.

## Post-Implementation

- [ ] Project tab lists available entities for an active project.
- [ ] Selection creates typed entity attachments with enough payload for context construction.
- [ ] No direct sibling-module internal imports are introduced.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
