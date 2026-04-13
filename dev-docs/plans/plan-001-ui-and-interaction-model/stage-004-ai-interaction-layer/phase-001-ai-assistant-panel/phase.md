---
title: AI Assistant Panel
slug: phase-001-ai-assistant-panel
phase_number: 1
status: complete
owner: Frontend Agent
stage: stage-004-ai-interaction-layer
parts:
  - part-001-panel-component-and-state
  - part-002-openrouter-server-proxy
estimated_duration: 1.5d
---

## Goal

Build the `AiPanel.svelte` component and the server-side OpenRouter proxy endpoint. After this phase, clicking "Ask AI" in the editor opens the panel, sends a request to the proxy, and displays the raw response. No context assembly or accept/reject UI yet — that is stage-004 phase-002.

## Parts

| #   | Part                                                                  | Status     | Assigned To    | Est. Duration |
| --- | --------------------------------------------------------------------- | ---------- | -------------- | ------------- |
| 001 | [Panel Component & State](part-001-panel-component-and-state/part.md) | `complete` | Frontend Agent | 0.75d         |
| 002 | [OpenRouter Server Proxy](part-002-openrouter-server-proxy/part.md)   | `complete` | Backend Agent  | 0.75d         |

## Acceptance Criteria

- [ ] `AiPanel.svelte` component opens/closes via the editor toolbar toggle
- [ ] AI panel state (open/closed, loading, response) managed in `src/lib/stores/ai.svelte.ts`
- [ ] Pressing "Ask AI" fires a `fetch` POST to `/api/ai` with a plain text prompt
- [ ] `src/routes/api/ai/+server.ts` forwards the request to OpenRouter and streams or returns the response
- [ ] API key (`OPENROUTER_API_KEY`) is read only from `$env/static/private` — never exposed to client
- [ ] Panel displays the raw model response text
- [ ] `pnpm run check` and `pnpm run lint` pass
