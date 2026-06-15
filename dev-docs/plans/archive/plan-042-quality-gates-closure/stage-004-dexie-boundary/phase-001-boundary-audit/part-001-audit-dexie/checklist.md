---
part: part-001-audit-dexie
last_updated: 2026-06-04
---

# Implementation Checklist

## Pre-Implementation

- [ ] Parent phase and stage are `in-progress`
- [ ] `part.md` has been reviewed and accepted
- [ ] Dev environment is ready
- [ ] Portability boundary documentation reviewed

## Implementation

- [ ] All Dexie imports identified (grep/semantic search)
- [ ] Each import classified (in-scope / out-of-scope)
- [ ] Out-of-scope imports relocated or removed
- [ ] Boundary mapping created in `evidence/`
- [ ] No unintended Dexie usage in live app code

## Post-Implementation

- [ ] Audit mapping and findings saved to `evidence/`
- [ ] At least one artifact added to `evidence/`
- [ ] `impl.log.md` updated with final entry
- [ ] Part `status` updated to `review` in `part.md` frontmatter
- [ ] Reviewer notified / Reviewer Agent invoked
