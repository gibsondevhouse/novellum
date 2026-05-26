---
title: OpenRouter Hardening
phase_number: 1
status: draft
owner: engineering
parts:
  - part-001-error-handling
  - part-002-streaming-support
estimated_duration: 2 days
acceptance_criteria_count: 2
edge_cases_count: 1
---

# Phase 001: OpenRouter Hardening

## Strategy
Enhance the existing `OpenRouterClient` stub to be robust enough for production use, handling API rate limits, model fallbacks, and supporting response streaming.

## Acceptance Criteria
1. The client handles `429 Too Many Requests` gracefully.
2. The client supports a streaming API for typing effects in the UI.

## Edge Cases
- Network disconnects mid-stream.
