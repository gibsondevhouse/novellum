---
title: Suggestion Flow
slug: phase-002-suggestion-flow
phase_number: 2
status: complete
owner: AI Agent
stage: stage-004-ai-interaction-layer
parts:
  - part-001-context-builder-integration
  - part-002-accept-reject-flow
estimated_duration: 1.5d
---

## Goal

Upgrade the raw AI panel from phase-001 into a full suggestion flow. Context is assembled from the active scene and related story bible entries before being sent to the proxy. The returned suggestion is shown in the panel with Accept / Reject / Regenerate controls that update application state.

## Parts

| #   | Part                                                                        | Status     | Assigned To    | Est. Duration |
| --- | --------------------------------------------------------------------------- | ---------- | -------------- | ------------- |
| 001 | [Context Builder Integration](part-001-context-builder-integration/part.md) | `complete` | AI Agent       | 0.75d         |
| 002 | [Accept / Reject Flow](part-002-accept-reject-flow/part.md)                 | `complete` | Frontend Agent | 0.75d         |

## Acceptance Criteria

- [ ] AI request includes structured context: active scene text, relevant characters, story bible summary
- [ ] Context is assembled by `src/lib/ai/context-builder.ts` and serialized to the OpenRouter message format
- [ ] Accept: appends suggestion text to the active scene's content and saves to Dexie
- [ ] Reject: clears the suggestion from the panel without modifying scene content
- [ ] Regenerate: fires a new AI request with the same context
- [ ] `pnpm run check` and `pnpm run lint` pass
- [ ] `dev-docs/ai-pipeline.md` updated with the implemented context payload shape
