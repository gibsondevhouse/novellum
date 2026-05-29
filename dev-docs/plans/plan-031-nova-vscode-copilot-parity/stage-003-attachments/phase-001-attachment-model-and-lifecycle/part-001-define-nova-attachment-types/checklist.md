---
part: part-001-define-nova-attachment-types
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

- [ ] Define `NovaAttachment` with `id`, `kind`, `label`, `payload`, and enough metadata for disclosure and truncation.
- [ ] Separate entity payloads from file payloads; do not store raw File objects in durable state.
- [ ] Add type guards or validators for attachment payloads crossing service boundaries.

## Post-Implementation

- [ ] Entity and file attachments have explicit typed payloads.
- [ ] Attachment IDs are stable within a conversation and collision-resistant enough for chip dismissal.
- [ ] Types do not expose client-only File objects to server routes.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
