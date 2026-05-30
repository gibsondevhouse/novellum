---
stage: stage-002-modes-refactor
last_updated: 2026-05-28
status: draft
---

# Stage Checklist

## Pre-Implementation

- [ ] Stage 001 compact action row is merged or available locally.
- [ ] Plan-030 stage 001 context grounding behavior remains intact.
- [ ] No agentic tool loop is enabled yet; this stage prepares the mode contract.

## Implementation

- [ ] Complete `phase-001-mode-type-and-session-state` — Mode Type and Session State
- [ ] Complete `phase-002-mode-ui-and-keyboard` — Mode UI and Keyboard Contract
- [ ] Complete `phase-003-prompt-and-resolver-routing` — Prompt and Resolver Routing
- [ ] Complete `phase-004-write-mode-pipeline-migration` — Write Mode Pipeline Migration
- [ ] Complete `phase-005-mode-regression-tests` — Mode Regression Tests

## Post-Implementation

- [ ] `NovaMode = 'ask' | 'write' | 'agent'` replaces `chat | scribe` across Nova types, store, UI, and resolver routing.
- [ ] Each mode has distinct placeholder copy, system prompt behavior, and acceptance-tested route behavior.
- [ ] Write mode preserves existing Scribe outline capability but reframes it as proposal generation.
- [ ] Last-used mode persists per project without leaking between projects.
- [ ] Stage `impl.log.md` entries, if any, are append-only.
- [ ] Reviewer Agent has reviewed all child phases.
