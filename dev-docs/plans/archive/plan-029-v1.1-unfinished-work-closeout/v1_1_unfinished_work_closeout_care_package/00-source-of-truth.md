# 00 — Source of Truth and Non-Negotiable Rules

## Canonical Closeout Umbrella

Primary source: `source-context/plan.md`

- Plan: `plan-029-v1.1-unfinished-work-closeout`
- Status: `in-progress`
- Target completion: `2026-06-12`
- Required end state: unfinished V1/V1.1 commitments are either shipped, retired, or superseded with evidence.
- Tracker end state: `ACTIVE-PLAN.md` and `MASTER-PLAN.md` reconcile to one terminal state with no ambiguous carry-over.

## In-Scope Workstreams

| Workstream | Required outcome | Confidence |
|---|---|---|
| `plan-019-naming-consistency` | Canonical route/module/component naming alignment, redirects, docs/tests updated | High |
| `plan-021-reader-pagination` | Reader empty state + deterministic client-side pagination + visual/manual verification | High |
| `plan-024` stage-002 | Release engineering closeout | High |
| `plan-024` stage-003 | Ollama + shortcuts finish | High |
| `plan-024` stage-006 | Docs rebaseline | High |
| Governance reconciliation | `ACTIVE-PLAN.md` and `MASTER-PLAN.md` aligned to final state | High |

## Hard Delivery Rules

| Rule | Instruction | Confidence |
|---|---|---|
| Svelte 5 runes only | Use `$state`, `$derived`, `$effect`; do not introduce legacy Svelte 4 reactivity | High |
| SQLite access | Client work must continue through `/api/db/*`; server DB remains raw `better-sqlite3` | High |
| API DB path protection | Do not rename API resource paths under `/api/db` | High |
| Pure rename discipline | Naming work must not include behavior changes | High |
| Reader pagination strategy | Deterministic client-side page-box chunking; not offset/cursor backend pagination | High |
| Provider/key boundary | Provider keys must not be client-visible | High |
| Existing shortcut system | Use `global-handler.ts` and `keymap-registry.ts`; do not replace with Mousetrap/svelte-use | High |
| Coverage floor | Service/AI areas touched must retain `>=80%` line coverage | High |
| Closeout discipline | Ship, retire, or supersede every deferred item with evidence | High |

## Primary Repo References

| Area | Source | Verify |
|---|---|---|
| Closeout scope | `plan.md` | In-scope plans, stages, quality gates |
| Plan trackers | `dev-docs/plans/ACTIVE-PLAN.md`, `dev-docs/plans/MASTER-PLAN.md` | Status drift, final disposition |
| Naming rules | `plan.md`, `plan-019-naming-consistency` | Canonical vocabulary, redirects, rename scope |
| Stack versions | `package.json` | SvelteKit `^2.57.0`, Svelte `^5.55.2` |
| Runes policy | `CLAUDE.md`, `+layout.svelte` examples | Project-wide Svelte 5 patterns |
| Reader strategy | `strategy-spike.md` | Deterministic page-box chunking |
| Reader route | `src/routes/books/[id]/+page.svelte` | Route entry |
| Reader loader | `src/routes/books/[id]/+page.ts` | Loader behavior |
| Reader engine | `reader-pages.ts` | Page model/chunking algorithm |
| Reader UI | `BookReaderView.svelte` | Prev/next/page index |
| Desktop build | `desktop-build.yml` | macOS aarch64 DMG, Windows x64 MSI |
| Release workflow | `release.yml` | macOS universal, Windows, Ubuntu Linux |
| Tauri config | `tauri.conf.json` | Bundle targets |
| Shortcut root install | root `+layout.svelte` | Dispatcher installation |
| Shortcut dispatcher | `global-handler.ts` | Global keydown handling |
| Shortcut registry | `keymap-registry.ts` | Map/registry/persistence |
| SQLite client | `client.ts` | `better-sqlite3`, pragmas, migrations |
| OpenRouter provider | `openrouter-provider.ts` | `/auth/key`, `/models`, `/chat/completions` |
| Ollama provider | `ollama-provider.ts` | Local daemon provider path |
| Provider orchestration | `+server.ts` | Routing/provider boundary; exact route needs repo verification |

## Global Pitfalls

| Pitfall | Severity | Why |
|---|---:|---|
| Invent APIs, routes, function names, or test helpers | Critical | Creates hallucinated implementation work |
| Rename `/api/db/*` | Critical | Violates explicit repo boundary |
| Move keys client-side | Critical | Security boundary violation |
| Introduce backend reader pagination | Critical | Contradicts reader strategy |
| Replace shortcut system | High | Breaks established architecture |
| Mix net-new feature work into closeout | High | Violates closeout scope |
| Mark trackers complete without evidence | High | Creates false governance closure |
| Use Svelte 4 reactivity | High | Violates project-wide Svelte 5 rule |
