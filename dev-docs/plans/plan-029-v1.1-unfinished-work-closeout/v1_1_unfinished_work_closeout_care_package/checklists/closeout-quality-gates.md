# Closeout Quality Gates

## Static Checks

```md
- [ ] `pnpm lint`
- [ ] `pnpm lint:css`
- [ ] `pnpm check`
- [ ] `pnpm test`
- [ ] boundaries check
- [ ] affected service/AI coverage remains >=80% line coverage
```

## Naming Smoke

```md
- [ ] Canonical routes load.
- [ ] Legacy routes redirect.
- [ ] Navigation uses canonical links.
- [ ] No stale import paths.
- [ ] `/api/db/*` paths unchanged.
```

## Reader Smoke

```md
- [ ] Empty book renders intentional empty state.
- [ ] Short book renders at least one page.
- [ ] Long book creates multiple deterministic pages.
- [ ] Prev/next controls disable at bounds.
- [ ] Page index never shows invalid count.
```

## Release Smoke

```md
- [ ] Web build succeeds.
- [ ] Desktop build workflow target list matches docs.
- [ ] Release workflow target list matches docs.
- [ ] Tauri bundle targets match docs/workflows.
- [ ] Packaged/prod-like app launches.
```

## Shortcuts Smoke

```md
- [ ] Global shortcut fires outside editable fields.
- [ ] Global shortcut does not fire inside `input`, `textarea`, `select`, or `contenteditable`.
- [ ] Shortcut recording can save valid binding.
- [ ] Conflict is detected or blocked.
- [ ] Persistence survives reload if supported.
```

## Provider Smoke

```md
- [ ] OpenRouter model listing works or fails gracefully.
- [ ] OpenRouter key validation works or fails gracefully.
- [ ] OpenRouter chat/completions works or fails gracefully.
- [ ] Ollama unavailable state is controlled.
- [ ] No API keys appear in client bundle or client-visible state.
```

## Governance Closeout

```md
- [ ] `ACTIVE-PLAN.md` updated.
- [ ] `MASTER-PLAN.md` updated.
- [ ] Each deferred item is completed, retired, or superseded.
- [ ] Evidence and rationale recorded.
- [ ] No non-terminal carry-over remains unless explicitly justified.
```
