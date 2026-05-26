---
title: OpenRouter Integration
phase_number: '001'
status: draft
owner: ai-agent
parts:
  - part-001-http-layer
estimated_duration: 4 days
acceptance_criteria_count: 3
edge_cases_count: 2
---

# Phase 001: OpenRouter Integration

## Strategy
Implement the HTTP layer to communicate with the OpenRouter API. This includes passing the API key, formatting the prompt structures correctly according to the Novellum Prompt System, and handling rate limits.

## Acceptance Criteria
1. `OpenRouterClient` successfully makes requests to external models.
2. AI generation streams back to the client UI.
3. Missing API keys trigger a graceful UI warning, not an application crash.

## Edge Cases
- Rate limits (HTTP 429) from OpenRouter must be caught and retried or passed to the user as a friendly message.
- Context window overflow (sending too much text to a small model) must be pre-calculated and prevented.
