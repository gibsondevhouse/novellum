---
part: part-002-implement-server-attachment-validation
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

- [ ] Validate kind, label, payload size, declared extension, and plain-text content at the service/server boundary.
- [ ] Reject unknown attachment kinds and malformed payloads.
- [ ] Return structured errors the UI can render without losing the user prompt.
- [ ] Add tests for spoofed file type, oversize payload, unknown kind, and valid markdown/text.

## Post-Implementation

- [ ] Server-side validation rejects invalid payloads even if client checks are bypassed.
- [ ] Valid `.md/.txt` attachments are accepted as plain text only.
- [ ] Error path does not send invalid content to OpenRouter.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
