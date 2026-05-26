---
title: Implement OpenRouter HTTP Client
part_number: '001'
status: draft
files_to_create: []
files_to_update:
  - src/lib/ai/openrouter.ts
  - src/lib/ai/orchestrator.ts
estimated_duration: 4 days
acceptance_criteria_count: 3
edge_cases_count: 2
qa_sign_off: false
---

# Part 001: Implement OpenRouter HTTP Client

## Implementation Checklist
- [x] Remove stub error in `src/lib/ai/openrouter.ts`.
- [x] Implement `fetch` call to `https://openrouter.ai/api/v1/chat/completions`.
- [x] Pass `Authorization: Bearer VITE_OPENROUTER_API_KEY`.
- [x] Pass `HTTP-Referer` and `X-Title` headers for OpenRouter identification.
- [x] Update `Orchestrator` to handle the response payload and map it back to `AIResponse`.

## Acceptance Criteria
1. `client.complete()` returns a valid string response from an actual LLM.
2. The payload structure precisely matches the OpenRouter spec (OpenAI compatible).
3. If `VITE_OPENROUTER_API_KEY` is missing, the method throws a controlled `MissingCredentialsError`.

## Edge Cases
- Malformed JSON returned by the LLM (when JSON mode is not enforced) should be caught by the respective agent parsers, but the HTTP layer must not crash.
- Network timeouts must be handled gracefully.
