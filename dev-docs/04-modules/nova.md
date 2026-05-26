# Module: `nova`

> Last verified: 2026-05-25
> Source: [src/modules/nova/](../../src/modules/nova/)

## Purpose

Dedicated conversational copilot surface and panel state for Nova, including retrieval-context disclosure, message streaming, and tool-call/result rendering.

## v2 Surface Contract

- Panel is styled as **Muse marginalia** on the right edge.
- Brass-tinted border-left and candle resize handle are canonical.
- Suggestion/action controls use candle-on-ink emphasis.
- Existing Nova naming is retained in code for compatibility.

## Structure

```text
src/modules/nova/
├── components/    # NovaPanel, message log, composer, model picker
├── stores/        # panel open/close, session messages
├── services/      # chat streaming, context hooks, tool registry/router
├── utils/
├── types.ts
└── index.ts
```

## Routes

- `/nova` full-screen workspace
- Embedded panel in app layout

## Key Tests

- `tests/nova/*`
- `tests/visual/editor-nova-panel*.test.ts`
