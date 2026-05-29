---
part: part-002-add-no-mutation-import-source-contract
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

- [ ] Define forbidden import path patterns for editor mutation, manuscript persistence mutation, and direct SQLite access.
- [ ] Scan Nova tool handler files and registry/router implementation files.
- [ ] Fail with an actionable message naming the offending file and import.
- [ ] Document any allowed read-only repository imports if needed.

## Post-Implementation

- [ ] Test fails if a tool handler imports forbidden mutation paths.
- [ ] Proposal tools can still call proposal-generation helpers.
- [ ] Source-contract test is included in normal `pnpm test` coverage.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
