# Evidence — Implement Agent Step Cap and Abort

**Date:** 2026-05-28
**Part:** phase-005 / part-001

## What was done

`MAX_AGENT_STEPS = 8` enforced via a cap check at the TOP of the `while(true)` loop in `agent-loop.ts`. After exactly 8 tool-call steps, the loop appends a cap-exhaustion nova message and returns.

Abort: each iteration calls `novaSession.beginStream('nova')` to hold the AbortSignal. The signal is threaded to the fetch. `AbortError` exits the loop cleanly without surfacing an error message.

## Cap logic

```typescript
while (true) {
    if (stepCount >= MAX_AGENT_STEPS) {
        novaSession.append({ role: 'nova', content: `Agent reached the ${MAX_AGENT_STEPS}-step limit...`, status: 'complete' });
        return;
    }
    // ... fetch, dispatch, stepCount++
}
```

## Test coverage

```
tests/nova/agent-loop.test.ts
  ✓ stops at MAX_AGENT_STEPS and appends a cap-exhaustion message
    - toolCalls.length === 8 (exactly MAX_AGENT_STEPS)
    - cap message contains 'step limit'
  ✓ exits cleanly when the fetch rejects with AbortError
  ✓ MAX_AGENT_STEPS is 8
```
