---
part: part-002-openrouter-server-proxy
phase: phase-001-ai-assistant-panel
stage: stage-004-ai-interaction-layer
---

# Checklist — OpenRouter Server Proxy

## Pre-Implementation

- [ ] `OPENROUTER_API_KEY` obtained and stored in `.env.local`
- [ ] `.env.local` confirmed in `.gitignore`
- [ ] [OpenRouter API docs](https://openrouter.ai/docs/requests) reviewed — chat completions format confirmed
- [ ] [SvelteKit `$env/static/private` docs](https://svelte.dev/docs/kit/modules#$env-static-private) reviewed

## Post-Implementation

- [x] `src/routes/api/ai/+server.ts` replaces the stage-002 stub
- [x] POST with valid `prompt` body returns `{ content: string }`
- [x] POST with missing `prompt` returns HTTP 400
- [x] OpenRouter errors return the upstream status code without leaking the API key or upstream body
- [x] `OPENROUTER_API_KEY` appears **only** in `$env/static/private` import — not in any client-accessible file
- [x] `.env.local` is not in git history (`git status` confirms untracked/ignored)
- [ ] Live end-to-end test via POST to `http://localhost:5173/api/ai` passes
- [x] `pnpm run check` exits with zero errors
- [x] `pnpm run lint` exits with zero errors
- [x] `impl.log.md` updated with completion entry
