---
title: AI / Consistency / Export Surface Alignment
slug: stage-007-ai-consistency-export-alignment
stage_number: 7
status: complete
owner: Stylist Agent
plan: plan-016-visual-consistency
phases:
  - phase-001-ai-assistant
  - phase-002-consistency-engine
  - phase-003-export
estimated_duration: 3d
risk_level: low
closed_at: 2026-04-28
---

## Goal

Make the AI Assistant, Consistency Engine, and Export surfaces feel like connected rooms inside the writing product — not separate admin tools or developer consoles.

## Phases

| #   | Phase                                                               | Status                   | Est. Duration |
| --- | ------------------------------------------------------------------- | ------------------------ | ------------- |
| 001 | [AI Assistant Panel](phase-001-ai-assistant/phase.md)               | `complete (transferred)` | 1d            |
| 002 | [Consistency Engine Surface](phase-002-consistency-engine/phase.md) | `complete`               | 1d            |
| 003 | [Export Surface](phase-003-export/phase.md)                         | `complete (transferred)` | 1d            |

## Entry Criteria

- Stage 003 complete; shared primitives (panels, section headers, empty states) in place.

## Exit Criteria

- AI Assistant panel (`src/modules/ai/**`) uses canonical panel rhythm, typography, and empty/loading treatment.
- Consistency Engine surface uses the review-archetype rules (structured issue lists, calm dense data, inspector parity).
- Export surface uses the production-archetype rules and reads as a finishing room, not a settings tab.
- No silent edits to AI pipeline or consistency logic — cosmetic/structural changes only.

## Notes

- Stylist-led with AI Agent consulted on AI Assistant copy tone.
- Follow `.github/skills/ai-context/SKILL.md` and `.github/skills/openrouter-ai/SKILL.md` for any context-related touches.

## Status Note

Closed 2026-04-28 via a hybrid path:

- **phase-001 (AI Assistant Panel)** — transferred to [plan-018 stage-005 — AI Assistant V1 Scope](../../plan-018-v1-product-experience/stage-005-ai-assistant-v1-scope/stage.md). The substantive rebuild defined there will land the canonical panel rhythm; an isolated cosmetic pass would have been redone.
- **phase-002 (Consistency Engine Surface)** — executed in-place. The consistency surface adopted `EmptyStatePanel`, removed `:global(.btn-*)` overrides on `IssueRow`, and now reads as a calm review surface using canonical primitives. Token, lint, and svelte-check (consistency module only) are clean. See phase evidence.
- **phase-003 (Export Surface)** — transferred to [plan-018 stage-001 — Export Quality](../../plan-018-v1-product-experience/stage-001-export-quality/stage.md). That stage replaces the entire ExportModal surface; cosmetic-only work would have been thrown away.
