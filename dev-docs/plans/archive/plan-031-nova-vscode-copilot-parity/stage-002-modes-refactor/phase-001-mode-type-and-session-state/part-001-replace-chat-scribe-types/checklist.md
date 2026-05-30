---
part: part-001-replace-chat-scribe-types
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

- [ ] Add `NovaMode = 'ask' | 'write' | 'agent'` to Nova types.
- [ ] Search for old mode literals and replace with explicit mappings.
- [ ] Keep compatibility adapters local to this migration; do not preserve old UI language.
- [ ] Run typecheck and record failures before fixing downstream callers.

## Post-Implementation

- [ ] No user-facing Chat/Scribe mode labels remain in Nova UI.
- [ ] TypeScript catches invalid mode literals.
- [ ] All mode callsites use the canonical `NovaMode` type or an explicit migration adapter.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
