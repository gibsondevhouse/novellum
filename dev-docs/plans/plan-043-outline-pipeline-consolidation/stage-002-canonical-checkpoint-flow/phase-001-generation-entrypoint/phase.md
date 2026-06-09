---
title: Generation Entrypoint
slug: phase-001-generation-entrypoint
phase_number: 1
status: draft
owner: Planner Agent
stage: stage-002-canonical-checkpoint-flow
parts:
  - part-001-generation-entrypoint
estimated_duration: TBD
---

## Goal

Route every supported outline generation request to the checkpoint generation service.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Generation Entrypoint](part-001-generation-entrypoint/part.md) | `draft` | — | TBD |

## Acceptance Criteria

- [ ] Supported outline generation requests produce checkpoint-backed review artifacts.
- [ ] No supported path creates a legacy `author-outline` artifact for application.
- [ ] Existing outline generation review e2e remains meaningful.

## Notes

Ensure all supported outline generation UX uses `/api/ai/outline/generate` and the outline generation state store.
