# Workstream — plan-024 Stage 006 Docs Rebaseline

## Objective

Bring docs back into alignment with actual shipped architecture and closeout state.

This is governance and operator-readiness work. It is not a roadmap rewrite.

## Acceptance Criteria

| Criterion | Required evidence | Confidence |
|---|---|---|
| Plan docs aligned | `ACTIVE-PLAN.md` and `MASTER-PLAN.md` reflect terminal status | High |
| Architecture docs aligned | `AGENTS.md`, `CLAUDE.md`, and plan docs match implementation | High |
| Release docs aligned | Build/release targets match workflows | High |
| Reader docs aligned | Pagination described as deterministic client-side page construction | High |
| Shortcut docs aligned | In-house dispatcher/registry documented | High |
| DB docs aligned | Raw `better-sqlite3`, `/api/db/*`, no ORM | High |
| Provider docs aligned | OpenRouter endpoints and Ollama provider path documented | High |

## Validation

```md
- [ ] Every deferred item has final disposition: completed, retired, or superseded.
- [ ] Every disposition has evidence and rationale.
- [ ] `ACTIVE-PLAN.md` and `MASTER-PLAN.md` agree.
- [ ] Stale non-terminal statuses are removed or explicitly justified.
- [ ] Docs reflect Svelte 5 runes.
- [ ] Docs reflect `/api/db/*` server SQLite access.
- [ ] Docs reflect raw `better-sqlite3` server DB layer.
- [ ] Docs reflect deterministic client-side reader pagination.
- [ ] Docs reflect in-house shortcut dispatcher/registry.
- [ ] Docs reflect OpenRouter provider abstraction and Ollama path.
- [ ] Docs reflect existing Tauri release workflows.
- [ ] Links and file references validated.
```

## Severity-Rated Risks

| Risk | Severity | Mitigation |
|---|---:|---|
| Marking complete without evidence | High | Require evidence link/rationale per item |
| Documenting target state as shipped state | High | Verify against repo before writing |
| Leaving non-terminal status drift | High | Reconcile ACTIVE and MASTER in same pass |
| Mixing future roadmap into closeout docs | Medium | Keep docs rebaseline scoped to shipped state |
