---
title: Error Handling & Fallbacks
part_number: 1
status: draft
files_to_create: []
files_to_update:
  - src/lib/ai/openrouter.ts
estimated_duration: 1 day
acceptance_criteria_count: 2
edge_cases_count: 1
qa_sign_off: null
---

# Part 001: Error Handling & Fallbacks

## Checklist
- [ ] Implement retry logic with exponential backoff for 429 and 5xx errors.
- [ ] Add model fallback logic (e.g., if Claude 3 Opus fails, fallback to Claude 3 Sonnet).

## Acceptance Criteria
1. Unit tests simulate 429s and verify the backoff logic.
2. Fallbacks correctly attempt a secondary model on specific error codes.

## Edge Cases
- All fallback models fail.
