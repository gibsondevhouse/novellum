---
part: part-001-register-project-summary-tool
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

- [ ] Define `read_project_summary` tool schema.
- [ ] Route implementation through existing project/context services, not direct client DB access.
- [ ] Return compact metadata and missing-field indicators.
- [ ] Add tests for project with logline/synopsis and zero scenes.

## Post-Implementation

- [ ] Tool returns project baseline context without requiring active scene.
- [ ] Tool is read-only and side-effect free.
- [ ] Result includes missing-field metadata instead of fabricating absent values.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
