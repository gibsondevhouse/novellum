# Workstream — plan-024 Stage 003 Ollama + Shortcuts Finish

## Objective

Finish deferred Ollama and shortcut work without replacing existing architecture.

## Existing Systems

| Area | Existing implementation | Confidence |
|---|---|---|
| Shortcut root install | Root `+layout.svelte` installs dispatcher | High |
| Shortcut dispatcher | `global-handler.ts` | High |
| Shortcut map/registry/persistence | `keymap-registry.ts` | High |
| Shortcut editing UI | settings `+page.svelte`; exact route needs repo verification | Medium |
| Ollama provider | `ollama-provider.ts` | High |
| OpenRouter provider | `openrouter-provider.ts` | High |
| Provider orchestration | `+server.ts`; exact route needs repo verification | Medium |

## Acceptance Criteria

- Global shortcut dispatcher is installed once.
- Dispatcher ignores `input`, `textarea`, `select`, and `contenteditable` targets.
- Shortcut recording/editing UI handles recording, conflicts, save, cancel.
- Shortcut persistence follows existing registry/persistence path.
- Ollama provider path works through the same provider abstraction/API surface.
- OpenRouter behavior remains intact.
- Provider/API keys are not client-visible.

## Validation

```md
- [ ] Root layout installs shortcut dispatcher once.
- [ ] Dispatcher ignores editable targets.
- [ ] Shortcut conflicts are detected or blocked.
- [ ] Recording state is visible and cancelable.
- [ ] Saved bindings persist if persistence is supported.
- [ ] Ollama unavailable state is controlled and actionable.
- [ ] OpenRouter key validation still works or fails gracefully.
- [ ] OpenRouter model listing still works or fails gracefully.
- [ ] OpenRouter chat/completions still works or fails gracefully.
- [ ] No provider keys in client bundle or client-visible state.
- [ ] Run `pnpm lint`.
- [ ] Run `pnpm lint:css`.
- [ ] Run `pnpm check`.
- [ ] Run `pnpm test`.
```

## Severity-Rated Risks

| Risk | Severity | Mitigation |
|---|---:|---|
| Replacing in-house shortcut system | High | Use existing dispatcher/registry only |
| Global shortcut fires while typing | High | Add editable-target guard |
| Duplicate shortcut silently overwrites | Medium | Add conflict state or block save |
| API keys exposed client-side | Critical | Preserve server-side provider/key boundary |
| Parallel Ollama API surface added | High | Route through existing provider abstraction |
