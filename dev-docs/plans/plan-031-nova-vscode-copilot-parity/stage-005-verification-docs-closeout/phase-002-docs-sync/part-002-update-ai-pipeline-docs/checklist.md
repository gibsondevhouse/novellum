---
part: part-002-update-ai-pipeline-docs
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

- [ ] Document mode-to-resolver routing.
- [ ] Document `user-attached` context scope.
- [ ] Document Agent loop sequence, max-step cap, abort, and tool-result feed-back.
- [ ] Document OpenRouter-only constraint and server-side key boundary.

## Post-Implementation

- [ ] Pipeline docs describe the real implemented flow.
- [ ] Tool-calling docs include guardrails and source-contract testing.
- [ ] No direct provider SDK or client-key behavior is documented or implied.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
