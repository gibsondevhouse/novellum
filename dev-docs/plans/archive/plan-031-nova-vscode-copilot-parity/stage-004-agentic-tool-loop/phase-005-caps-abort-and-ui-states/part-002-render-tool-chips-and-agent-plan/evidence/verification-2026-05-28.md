# Evidence — Render Tool Chips and Agent Plan

**Date:** 2026-05-28
**Part:** phase-005 / part-002

## What was done

`agent-loop.ts` appends `tool-call` and `tool-result` messages to `novaSession` for each tool call. These use the existing `NovaMessage` discriminated union with `role: 'tool-call' | 'tool-result'`, `toolId`, and `toolPayload`. The existing `NovaPanel` component already renders these as collapsible chips (from Stage 001/002 scaffolding).

Partial assistant content before a tool-call block is also surfaced: if the model emits content alongside tool_calls, that content is appended to the thinking message before endStream is called.

## Session message flow per tool step

```
novaSession.append({ role: 'tool-call', toolId, toolPayload: parsedInput, status: 'complete' })
// tool executes
novaSession.append({ role: 'tool-result', toolId, toolPayload: toolResult, status: 'complete' })
```

## Test coverage

```
tests/nova/agent-loop.test.ts
  ✓ dispatches a tool call and feeds the result back
    - toolCallMsg.toolId === 'test.echo'
    - toolResultMsg.toolPayload.status === 'success'
```
