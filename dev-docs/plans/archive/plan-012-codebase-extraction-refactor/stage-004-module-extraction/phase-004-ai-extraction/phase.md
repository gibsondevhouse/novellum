---
title: AI Extraction
slug: phase-004-ai-extraction
phase_number: 4
status: complete
owner: Planner Agent
stage: stage-004-module-extraction
parts:
  - part-001-ai-config-constants
  - part-002-openrouter-retry-refactor
estimated_duration: 1.5d
---

## Goal

> Extract AI module constants (model configs, task constraints, prompt templates) into shared files and refactor the duplicated retry/error-handling logic in `openrouter.ts` into a reusable utility.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
|---|------|--------|-------------|---------------|
| 001 | [AI Config & Constants Extraction](part-001-ai-config-constants/part.md) | `review` | AI | 0.5d |
| 002 | [OpenRouter Retry Refactor](part-002-openrouter-retry-refactor/part.md) | `review` | AI | 1d |

## Acceptance Criteria

- [ ] All parts reach `complete` status
- [ ] AI constants in `src/lib/ai/constants.ts`
- [ ] Retry logic in a single reusable function
- [ ] AI test coverage >= 80% line coverage
