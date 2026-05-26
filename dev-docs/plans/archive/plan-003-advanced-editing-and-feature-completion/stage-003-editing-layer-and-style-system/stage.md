---
title: Editing Layer & Style System
slug: stage-003-editing-layer-and-style-system
stage_number: 3
status: complete
owner: AI Agent
plan: plan-003-advanced-editing-and-feature-completion
phases:
  - phase-001-multi-pass-editing
  - phase-002-style-and-rewrite-system
estimated_duration: 6d
---

## Goal

Implement the Phase 3 manuscript-refinement capabilities: multi-pass editing through EditAgent, style analysis and presets through StyleAgent, and controlled rewrites through RewriteAgent. Each agent feeds into a shared inline suggestion UI that lets the author accept, reject, or re-request output without leaving the editor.

## Phases

| #   | Phase                                                                 | Status  |
| --- | --------------------------------------------------------------------- | ------- |
| 001 | [Multi-Pass Editing](phase-001-multi-pass-editing/phase.md)           | `draft` |
| 002 | [Style & Rewrite System](phase-002-style-and-rewrite-system/phase.md) | `draft` |

## Entry Criteria

- stage-001 complete: Editor module scaffolded; scene text is accessible and editable
- plan-002 AI pipeline tested end-to-end: full pipeline integration part complete
- `EditAgent` listed in `agents-map.md`; inputs/outputs documented

## Exit Criteria

- User can invoke EditAgent in developmental, line editing, or proofreading mode from the editor
- Edit suggestions are shown inline with accept/reject controls
- User can apply a style preset (e.g., "literary fiction", "thriller", "YA") to get StyleAgent feedback
- StyleAgent deviations are highlighted per sentence with explanations
- User can request a rewrite at scene or paragraph scope; RewriteAgent returns 2–3 options
- User selects one option or discards all; no auto-apply

## Technical Notes

- EditAgent, StyleAgent, RewriteAgent all routed through existing Model Router (`src/lib/ai/model-router.ts`)
- Add `edit`, `style_check`, `rewrite` to `TaskType` union in `src/lib/ai/types.ts`
- Style presets stored as config in `src/lib/ai/style-presets.ts` (no DB; static config)
- Inline suggestion UI: shared component `src/lib/components/ai-suggestion-overlay/` — do not duplicate per-module
- Rewrite options state lives in editor module store; cleared on scene navigation
