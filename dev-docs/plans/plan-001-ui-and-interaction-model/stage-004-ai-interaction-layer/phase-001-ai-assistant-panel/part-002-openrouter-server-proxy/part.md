---
title: OpenRouter Server Proxy
slug: part-002-openrouter-server-proxy
part_number: 2
status: complete
completed_at: 2026-04-12
owner: Backend Agent
phase: phase-001-ai-assistant-panel
stage: stage-004-ai-interaction-layer
estimated_duration: 0.75d
---

## Objective

Implement `src/routes/api/ai/+server.ts` — the SvelteKit server route that acts as a secure proxy between the SvelteKit client and the OpenRouter API. The API key must never appear in client-side bundle; all communication with OpenRouter happens only in this server endpoint.

## Reference Docs

- [SvelteKit server routes](https://svelte.dev/docs/kit/routing#server)
- [SvelteKit `$env/static/private`](https://svelte.dev/docs/kit/modules#$env-static-private)
- [OpenRouter API — chat completions](https://openrouter.ai/docs/requests)
- Security: never log or expose `OPENROUTER_API_KEY` in error messages or response bodies

## Implementation Steps

1. Update `src/routes/api/ai/+server.ts` (replaces the stub from stage-002):

```ts
// src/routes/api/ai/+server.ts
import { OPENROUTER_API_KEY } from '$env/static/private';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);
	if (!body?.prompt || typeof body.prompt !== 'string') {
		error(400, 'Missing or invalid "prompt" field');
	}

	const response = await fetch(OPENROUTER_URL, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${OPENROUTER_API_KEY}`,
			'Content-Type': 'application/json',
			'HTTP-Referer': 'http://localhost:5173',
			'X-Title': 'Novellum',
		},
		body: JSON.stringify({
			model: 'openai/gpt-4o-mini',
			messages: [{ role: 'user', content: body.prompt }],
		}),
	});

	if (!response.ok) {
		const msg = await response.text().catch(() => 'Upstream error');
		error(response.status, `OpenRouter error: ${response.status}`);
	}

	const data = await response.json();
	return json({ content: data.choices?.[0]?.message?.content ?? null });
};
```

**Security notes:**

- The error message does NOT include the upstream response body (which could contain metadata revealing API internals)
- `OPENROUTER_API_KEY` is imported from `$env/static/private` and is **build-time only** — it is never included in the client bundle
- Input is validated: `prompt` must be a non-empty string

1. Add `OPENROUTER_API_KEY=your_key_here` to `.env.local` (gitignored)

1. Verify `.gitignore` contains `.env.local` — do NOT commit API keys

## Environment Variable Setup

```sh
# .env.local  (never commit this file)
OPENROUTER_API_KEY=sk-or-v1-...
```

The `.env.local` file must already be listed in `.gitignore`. If not, add it.

## Acceptance Criteria

- [ ] `src/routes/api/ai/+server.ts` handles POST requests and returns `{ content: string }`
- [ ] Returns 400 if `prompt` is missing or not a string
- [ ] Returns 502 (or passes upstream status code) on OpenRouter errors — without leaking API key or upstream body
- [ ] `OPENROUTER_API_KEY` is imported only from `$env/static/private`, never from client-side code
- [ ] `.env.local` is listed in `.gitignore`
- [ ] Manual test: POST to `http://localhost:5173/api/ai` with body `{"prompt":"Hello"}` returns `{ content: string }`
- [ ] `pnpm run check` and `pnpm run lint` pass
