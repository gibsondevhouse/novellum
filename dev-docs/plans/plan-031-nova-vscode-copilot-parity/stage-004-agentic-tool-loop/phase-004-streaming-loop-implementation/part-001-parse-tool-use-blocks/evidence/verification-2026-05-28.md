# Evidence — Parse Tool Use Blocks

**Date:** 2026-05-28
**Part:** phase-004 / part-001

## What was done

`/api/nova/agent` server endpoint (`src/routes/api/nova/agent/+server.ts`) accepts `{ model, messages, tools }` and returns `{ content, tool_calls, finish_reason }`. Tool calls use the OpenRouter/OpenAI tool-calling format.

`agent-loop.ts` parses the response:
- `AgentCompletionResult.tool_calls: OpenRouterToolCall[] | null`
- Each `OpenRouterToolCall` has `id`, `type: 'function'`, and `function: { name, arguments }`
- `tryParseJson(str)` safely parses tool arguments

## File evidence

- `src/routes/api/nova/agent/+server.ts` — endpoint and response type
- `src/modules/nova/services/agent-loop.ts` — `AgentCompletionResult`, `OpenRouterToolCall`, `tryParseJson`

## Test coverage

```
tests/nova/agent-loop.test.ts
  ✓ dispatches a tool call and feeds the result back
  ✓ stops at MAX_AGENT_STEPS and appends a cap-exhaustion message
```
