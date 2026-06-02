---
part: part-001-unresolved-threads
last_updated: ~
---

# Implementation Checklist

## Pre-Implementation

- [ ] `plot_threads` table schema confirmed in migration files
- [ ] `part.md` has been reviewed and accepted

## Implementation

- [ ] SQL query written to fetch unresolved threads by project_id
- [ ] Result mapped to `string[]`
- [ ] `unresolvedThreads: []` hardcode replaced

## Post-Implementation

- [ ] Lint passes
- [ ] Type-check passes
- [ ] Tests pass (context test un-skipped)
- [ ] `impl.log.md` updated
- [ ] Part `status` updated to `review`
