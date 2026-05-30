---
stage: stage-003-attachments
last_updated: 2026-05-28
status: draft
---

# Stage Checklist

## Pre-Implementation

- [ ] Stage 001 compact composer includes the attach affordance.
- [ ] Stage 002 mode routing is in place so attachment behavior can be verified per mode.
- [ ] Project repository access patterns for scenes, characters, locations, and outline nodes are identified before UI wiring.

## Implementation

- [ ] Complete `phase-001-attachment-model-and-lifecycle` — Attachment Model and Lifecycle
- [ ] Complete `phase-002-attach-popover-ui` — Attach Popover UI
- [ ] Complete `phase-003-project-entity-attachments` — Project Entity Attachments
- [ ] Complete `phase-004-file-upload-validation` — File Upload Validation
- [ ] Complete `phase-005-attachment-context-disclosure` — Attachment Context and Disclosure
- [ ] Complete `phase-006-attachment-tests-and-evidence` — Attachment Tests and Evidence

## Post-Implementation

- [ ] Attach popover has project and upload tabs with keyboard-accessible navigation.
- [ ] Project entities and `.md/.txt` files ≤100KB attach as chips and clear on new chat.
- [ ] Attachments are validated client-side and server-side and counted as `'user-attached'` context.
- [ ] Invalid files are rejected at the boundary with actionable UI copy and tests.
- [ ] Stage `impl.log.md` entries, if any, are append-only.
- [ ] Reviewer Agent has reviewed all child phases.
