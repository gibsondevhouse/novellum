---
title: Outline AI Orchestration Entry Points
slug: part-003-outline-ai-orchestration-entry-points
part_number: 3
status: complete
owner: AI Agent
assigned_to: AI Agent
phase: phase-002-core-architecture-implementation
started_at: 2026-04-12
completed_at: 2026-04-12
estimated_duration: 1d
---

## Objective

Create the typed interfaces and stub implementations for the AI orchestration layer — the OpenRouter HTTP client and the context injection shape — so that all modules have a consistent, type-safe surface to call AI capabilities without being coupled to provider details.

## Scope

**In scope:**

- `AIRequestPayload` and `AIResponse` TypeScript interfaces (provider-agnostic)
- `ContextBundle` interface representing the context injected into every AI call (user prompt, chapter text, story bible slice, outline section)
- `OpenRouterClient` stub — a class with a typed `complete(payload)` method that throws `"Not implemented"` until a real key is wired in
- `Orchestrator` service that accepts a `ContextBundle`, builds a payload, and calls the client
- Environment variable plumbing: `VITE_OPENROUTER_API_KEY` read from `.env.local`

**Out of scope:**

- Live API calls or real OpenRouter integration (deferred to AI-specific plan parts)
- UI components for displaying AI output
- Streaming responses

## Implementation Steps

1. Create `src/lib/ai/types.ts` — define `AIRequestPayload`, `AIResponse`, `ContextBundle`
2. Create `src/lib/ai/openrouter.ts` — `OpenRouterClient` class; `complete()` reads `import.meta.env.VITE_OPENROUTER_API_KEY` and throws `"Not implemented"` if missing
3. Create `src/lib/ai/orchestrator.ts` — `Orchestrator` class with `run(context: ContextBundle): Promise<AIResponse>`; instantiates `OpenRouterClient` internally
4. Create `src/lib/ai/index.ts` — barrel re-exporting `Orchestrator`, `ContextBundle`, `AIResponse`
5. Add `VITE_OPENROUTER_API_KEY=` (empty) to `.env.example` at repo root
6. Add `.env.local` to `.gitignore` (if not already present)
7. Update `src/modules/ai/index.ts` to re-export from `$lib/ai`
8. Run `pnpm run check` — no errors

## Files

**Create:**

- `src/lib/ai/types.ts`
- `src/lib/ai/openrouter.ts`
- `src/lib/ai/orchestrator.ts`
- `src/lib/ai/index.ts`
- `.env.example`

**Update:**

- `.gitignore` — ensure `.env.local` is listed
- `src/modules/ai/index.ts` — re-export from `$lib/ai`

## Acceptance Criteria

- [ ] `ContextBundle` interface has: `userPrompt: string`, `chapterText?: string`, `bibleSummary?: string`, `outlineSection?: string`
- [ ] `OpenRouterClient.complete()` is typed and callable without TypeScript errors
- [ ] `Orchestrator.run()` accepts a `ContextBundle` and returns `Promise<AIResponse>`
- [ ] `.env.example` exists with `VITE_OPENROUTER_API_KEY=` documented
- [ ] `pnpm run check` exits with zero errors
- [ ] `pnpm run lint` exits with zero errors

## Edge Cases

- `import.meta.env` is only available in Vite/SvelteKit — do not use `process.env` in client-side code
- The `openrouter.ts` stub must not make any real HTTP calls; it should throw or return a mock `AIResponse` to prevent accidental API charges during development

## Notes

`AIResponse` shape (version 1):

```ts
export interface AIResponse {
	text: string;
	model: string;
	tokensUsed: number;
}
```

The `Orchestrator` is the only entry point modules should use. Direct instantiation of `OpenRouterClient` outside of `orchestrator.ts` is discouraged.
