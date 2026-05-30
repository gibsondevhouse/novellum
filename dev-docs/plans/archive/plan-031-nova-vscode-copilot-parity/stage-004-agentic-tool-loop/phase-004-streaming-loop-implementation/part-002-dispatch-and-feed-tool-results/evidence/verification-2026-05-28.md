# Evidence — Dispatch and Feed Tool Results

**Date:** 2026-05-28
**Part:** phase-004 / part-002

## What was done

`agent-loop.ts` dispatches each tool call through `dispatchTool(invocation)` and appends both a `tool-call` chip and `tool-result` chip to `novaSession`. The tool result is serialized and pushed back into the message history as a `{ role: 'tool', tool_call_id, content }` message for the next OpenRouter call.

## Tool call flow

```
for (const toolCall of tool_calls) {
  novaSession.append({ role: 'tool-call', toolId, toolPayload: parsedInput })
  const toolResult = await dispatchTool(invocation)
  novaSession.append({ role: 'tool-result', toolId, toolPayload: toolResult })
  messages.push({ role: 'tool', tool_call_id, content: JSON.stringify(toolResult.output) })
}
stepCount++
```

## Test coverage

```
tests/nova/agent-loop.test.ts
  ✓ dispatches a tool call and feeds the result back
    - tool-call chip present with correct toolId
    - tool-result chip present with status: 'success'
    - final nova message contains 'Echo: ping'
```
