---
part: part-002-persist-last-mode-per-project
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

- [ ] Add per-project mode persistence using the existing session persistence pattern.
- [ ] Default unknown or missing mode to Ask.
- [ ] Clear or separate mode state when project context changes.
- [ ] Add regression tests for two project IDs with different last-used modes.

## Post-Implementation

- [ ] Mode selection survives panel close/reopen for the same project.
- [ ] Mode selection does not leak from one project to another.
- [ ] Invalid persisted values are safely normalized to Ask.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
