---
title: Settings AI-Key Flow
slug: phase-004-settings-ai-key-flow
phase_number: 4
status: complete
owner: Planner Agent
stage: stage-005-byok-security
parts:
  - part-001-ai-key-routes
  - part-002-api-settings-ui
estimated_duration: 1d
---

## Goal

Ship the user-facing flow for managing the OpenRouter API key: secure save / delete / test endpoints plus a Settings panel that displays a masked status and never re-reveals the key after save.

## Parts

| #   | Part                                                                | Status  | Assigned To | Est. Duration |
| --- | ------------------------------------------------------------------- | ------- | ----------- | ------------- |
| 001 | [AI Key Routes](part-001-ai-key-routes/part.md)                     | `draft` | backend     | 0.5d          |
| 002 | [ApiSettings UI](part-002-api-settings-ui/part.md)                  | `draft` | stylist     | 0.5d          |

## Acceptance Criteria

- [ ] `POST /api/settings/ai-key` accepts `{ providerId, apiKey, action: 'save' | 'delete' | 'test' }` and never echoes the key in any response.
- [ ] `GET /api/settings/ai-status` returns `{ configured, lastVerifiedAt, maskedHint }` only — never the raw key.
- [ ] `ApiSettings.svelte` renders only the masked status; the input is write-only and clears after submission.
- [ ] Tests cover save → status → test → delete via the routes; a redaction test asserts no response payload contains the key.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Notes

- Action `test` calls `OpenRouterProvider.validateKey` without persisting if the request includes a transient key, or with the stored key if absent.
