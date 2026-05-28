# Module: `nova`

> Last verified: 2026-05-27
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

## plan-030 Runtime Decision

- Canonical runtime for plan-030 is the embedded editor sidepanel (`src/modules/nova/*`).
- `/nova` remains a legacy fullscreen surface backed by `src/modules/ai/components/ChatInterface.svelte`.
- The `/nova` route must display an explicit legacy-status notice so this divergence is never silent.
- Fullscreen migration is deferred; sidepanel capabilities are the source of truth for Nova behavior until a dedicated migration plan is approved.

## Ownership Guardrails

- New Nova capability work should land in `src/modules/nova/*` first.
- Do not add sidepanel-only features directly to `ChatInterface.svelte` unless the same capability is intentionally deferred for `/nova` and documented.
- Route-level drift between `/nova` and the embedded sidepanel must be called out in tests or docs within the same change.

## Context Grounding Contract

- When `projectId` exists, Nova includes a compact project summary baseline before scene/outline/world scopes.
- Baseline grounding is present even when `activeSceneId` is null (no-scene fallback).
- Baseline fields include project title, genre, status, project type, target word count, logline, synopsis, style preset id, updated timestamp, entity counts, and first story-frame summary when available.
- Full manuscript text is never sent by default.

## Mode and Review-Gate Boundaries

- `chat` mode is conversational and grounded; prose is treated as a proposal.
- `scribe` mode only routes supported outline-generation actions into `runAuthorPipelineTask`.
- Unsupported concrete Scribe requests render explicit limitation state (`Scribe limitation`) rather than silently executing.
- Scene draft and revision-pack artifacts remain proposal-only review cards with explicit user actions; no direct editor/manuscript mutation path is allowed.

## Key Tests

- `tests/nova/*`
- `tests/visual/editor-nova-panel*.test.ts`
