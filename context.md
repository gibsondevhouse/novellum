# Novellum — Agent Context Brief

> One-page orientation for any coding agent (Copilot, Claude Code, Codex,
> Gemini, ChatGPT) joining the repo. Read this first. Everything below is
> verified against the working tree; if a path doesn't exist, prefer the
> tree over this file and open a PR fixing the doc.

---

## What this product is

Novellum is a **local-first, AI-assisted novel-writing desktop app**. A
SvelteKit 2 web app wrapped in **Tauri 2**, backed by a single
**SQLite** file the user owns. LLM calls go to **OpenRouter** (BYOK).

- No cloud sync. No accounts. Single-author.
- AI emits **suggestions** — the manuscript is never mutated silently.
- See [dev-docs/01-project/project-overview.md](dev-docs/01-project/project-overview.md) for the long version.

---

## Tech stack (canonical)

| Layer | Choice |
|---|---|
| UI | Svelte 5 **Runes only** (`$state`, `$derived`, `$effect`) — no `$:` |
| Framework | SvelteKit 2 (Node adapter), Vite 8 |
| Styling | Tailwind 3 + design tokens in [src/styles/tokens.css](src/styles/tokens.css). **No hardcoded colors/spacing.** |
| Components | Bits UI, TipTap 3 (editor), Lucide icons |
| Server | SvelteKit endpoints + `better-sqlite3` (WAL) under `/api/db/*` |
| Desktop | Tauri 2, Rust, Node.js sidecar (see [src-tauri/](src-tauri/)) |
| AI | OpenRouter HTTP, keys in OS keyring via `@napi-rs/keyring` |
| Data portability | Dexie 4 — only for `.novellum.zip` import/export |
| Tests | Vitest 4 (unit), Playwright 1.59 (e2e + visual), Storybook 10 |
| Package mgr | **pnpm** |

Strict TypeScript. Modular boundaries enforced by `eslint-plugin-boundaries`.

---

## Repo map — where things live

```
src/
  app.css, app.html, hooks.server.ts, service-worker.ts
  lib/                 Shared primitives. Cross-module utilities.
    ai/                AI scaffolding: PromptBuilder, ContextEngine, agents
    components/        Design-system primitives
    db/                better-sqlite3 client + schema
    keyboard/          Global keyboard registry
    server/            Server-only services
    settings/          App-wide settings store
    stores/            Cross-module Svelte stores (use sparingly)
    desktop/, platform/, migration/, factories/, ...
  modules/<domain>/    Vertical feature slices. Public barrel `index.ts`.
    ai/                Nova copilot internals
    assets/            Image gallery, media handling
    continuity/        ContinuityAgent surface
    editor/            Manuscript editor (TipTap)
    export/            DOCX / EPUB / Markdown / TXT
    nova/              Nova chat sidebar
    outline/           Arc → Act → Chapter → Scene → Beat
    project/           Project hub
    reader/            Paginated read-through
    settings/          Settings UI (PillNav)
    story-bible/, world-building/
  routes/              SvelteKit routes. Names mirror modules.
    api/               Server endpoints, incl. /api/db/*
    onboarding/, projects/, stories/, books/, images/,
    nova/, settings/
  stores/              Legacy / root-level stores (prefer module-local)
  styles/              tokens.css and global styles
  app/                 SvelteKit internals

src-tauri/             Rust desktop shell. Touch only for packaging work.
  src/                 Rust source (small)
  binaries/            Bundled Node sidecar (downloaded, gitignored)
  capabilities/        Tauri capability manifests
  tauri.conf.json      App config

tests/                 Vitest + Playwright, mirrors src tree
  ai/, editor/, nova/, reader/, settings/, sqlite/, db/,
  e2e/, visual/, components/, ...

dev-docs/              Internal docs (now tracked — see Sec. below)
  01-project/          Vision, roadmap, journey
  02-architecture/     System, data-model, routing, backend, frontend, tauri
  03-ai/               Pipeline, prompt-system, context-engine, agents-map
  04-modules/          Per-module docs
  05-workflow/         Dev workflows
  plans/               Active and archived plans (see plan-method.md)
  audits/, checklists/, qa-docs/, release/, implementation-logs/

novellum-docs/         User-facing product docs
scripts/               Build / maintenance scripts (Node ESM)
static/                Public static assets
```

Detailed system map: [dev-docs/02-architecture/system.md](dev-docs/02-architecture/system.md).
Detailed module map: [dev-docs/04-modules/](dev-docs/04-modules/).

---

## Non-negotiable rules

1. **Svelte 5 Runes only.** If you see `$:` in new code, reject it.
2. **Token-driven styling.** Every color, spacing, radius, shadow comes
   from `src/styles/tokens.css`. `pnpm check:tokens` enforces this.
3. **Modular boundaries.** Cross-module imports go through the module's
   public barrel `src/modules/<domain>/index.ts`. Never reach into a
   sibling module's internals.
4. **AI prompts follow ROLE → TASK → CONTEXT → CONSTRAINTS → OUTPUT.**
   Output schemas are JSON-validated. Context is scoped — never the
   full manuscript.
5. **No silent edits to the manuscript.** Agents emit suggestions; the
   author accepts them.
6. **Local-first.** Only outbound network traffic is AI calls the user
   triggered. No telemetry, no remote storage.
7. **TypeScript strict mode.** No `any` without justification.

---

## Quality gates (run before claiming "done")

```bash
pnpm check        # svelte-check + tsc
pnpm lint         # eslint (incl. boundaries)
pnpm lint:css     # stylelint
pnpm test         # vitest run
pnpm check:tokens # forbid hardcoded design values
```

Optional but expected for UI work:

```bash
pnpm test:e2e
pnpm test:visual
```

---

## Common commands

| Task | Command |
|---|---|
| Web dev server | `pnpm dev` |
| Desktop dev (Tauri) | `pnpm desktop:dev` |
| Desktop build | `pnpm desktop:build` |
| Run a single Vitest file | `pnpm test path/to/file.test.ts` |
| Storybook | `pnpm storybook` |
| Generate changelog | `pnpm changelog` |

Full script list: [package.json](package.json) (`scripts` section).

---

## Runtime AI agents (shipped in V1)

Located in [src/lib/ai/](src/lib/ai/):

- **ContinuityAgent** — detects timeline / lore / trait inconsistencies.
- **EditAgent** — line-level prose polish.
- **RewriteAgent** — alternative phrasings, tone/pacing shifts.
- **StyleAgent** — tone & voice consistency.

V1 cut: `BrainstormAgent`, `OutlineAgent`, `DraftAgent`, `SummaryAgent`
(see plan-025 in archive). Re-adding any of them is a new plan.

The pipeline:
`User → ContextEngine → PromptBuilder → ModelRouter → OpenRouter`.

Details: [dev-docs/03-ai/](dev-docs/03-ai/).

---

## Development meta-agents

There are also **planning/coding agents** defined in `.github/agents/`
(Planner, Architect, Stylist, Backend, AI, Reviewer). They're invoked
through Gemini CLI / Copilot subagents. See [AGENTS.md](AGENTS.md).

---

## Resuming work without an explicit task

1. Read [dev-docs/plans/ACTIVE-PLAN.md](dev-docs/plans/ACTIVE-PLAN.md) —
   its `Current` section names the active plan slug.
2. Open that plan's `plan.md` and walk down to the first
   stage/phase/part whose `status` is not `complete`.
3. Follow [.github/instructions/plan-conventions.instructions.md](.github/instructions/plan-conventions.instructions.md):
   pre-impl checklist → implementation → post-impl checklist → append
   to `impl.log.md` → drop at least one file into `evidence/`.
4. Roll status up the tree only when all children are `complete`.
5. When a plan completes, update both `ACTIVE-PLAN.md` and `MASTER-PLAN.md`.

---

## Key files to skim before non-trivial work

- [AGENTS.md](AGENTS.md) — full agent ecosystem.
- [CLAUDE.md](CLAUDE.md) — Claude-specific entry point (mirrors AGENTS).
- [dev-docs/02-architecture/system.md](dev-docs/02-architecture/system.md)
- [dev-docs/02-architecture/data-model.md](dev-docs/02-architecture/data-model.md)
- [dev-docs/02-architecture/modular-boundaries.md](dev-docs/02-architecture/modular-boundaries.md)
- [dev-docs/03-ai/pipeline.md](dev-docs/03-ai/pipeline.md)
- [src/styles/tokens.css](src/styles/tokens.css) — the visual contract.
- [eslint.config.js](eslint.config.js) — boundary rules.

---

## What NOT to do

- Don't add a global store for something a single module needs.
- Don't hardcode pixel / hex values — use tokens.
- Don't bypass `/api/db/*` to touch SQLite from the client.
- Don't send the whole manuscript to an LLM. Scope via ContextEngine.
- Don't auto-apply AI output to the manuscript.
- Don't edit existing `impl.log.md` entries. Append only.
- Don't edit templates in `dev-docs/plans/_templates/` directly — copy.
