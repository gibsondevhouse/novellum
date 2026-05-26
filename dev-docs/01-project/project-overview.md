# Project Overview

> Last verified: 2026-05-07

## What Novellum is

Novellum is a **local-first, AI-assisted novel-writing workspace** for long-form fiction authors. It runs as a desktop application (Tauri 2) wrapping a SvelteKit 2 web app, with a server-side SQLite database as the single source of truth and OpenRouter as the LLM gateway (BYOK — bring your own key).

The product surface today covers:

- A **Project Hub** for each book: trust cards, word counts, recent activity, navigation into the work.
- A **structural outline** built on a strict Arc → Act → Chapter → Scene → Beat hierarchy ([data model](../02-architecture/data-model.md)).
- A **manuscript editor** powered by TipTap 3 with autosave, snapshots, version history, and a focused single-scene view.
- A **Nova AI sidebar** — a chat-style copilot with retrieval over project context and scaffolded agentic tools.
- A **World Building shell** consolidating Personae (characters), Atlas (locations), Archive (lore), Threads (plot), and Chronicles (timeline).
- A **Continuity** surface that runs the ContinuityAgent over scenes and surfaces structured issues for author review.
- A **Reader** for paginated read-through.
- **Exports** to DOCX, EPUB, Markdown, and TXT.
- **Backups** as `.novellum.zip` portable bundles, including project assets.
- **Settings** with categorized PillNav for Appearance, Defaults, Shortcuts, AI (BYOK), and Data.

## Principles

These are non-negotiable and enforced through code and reviews:

1. **Local-first.** All manuscripts persist to a single SQLite file the user owns. No remote storage. AI calls are the only outbound network traffic, and only when the author triggers them.
2. **Author-in-the-loop.** AI agents produce *suggestions* the author must explicitly accept. No silent edits to the manuscript ever.
3. **Modular by domain.** Features live in vertical slices under [src/modules/](../../src/modules/) with public barrel exports and ESLint-enforced boundaries. There is no global god-store.
4. **Strict typing.** Svelte 5 Runes (`$state`, `$derived`, `$effect`) only — no Svelte 4 reactivity. TypeScript strict mode.
5. **Token-driven design.** All visual values come from CSS custom properties in [src/styles/tokens.css](../../src/styles/tokens.css). The `pnpm check:tokens` lint forbids hardcoded pixels and colors.
6. **AI is constrained.** Every prompt follows ROLE → TASK → CONTEXT → CONSTRAINTS → OUTPUT. Context is *scoped*, not the full manuscript. Outputs are JSON-schema validated.

## What it is not

- Not a cloud SaaS. There is no Novellum server you can sign in to.
- Not a collaborative editor. Single-author by design.
- Not a generic chat client. Nova is purpose-built around fiction-writing context.
- Not finished. v0.0.1 is the current target; see [roadmap.md](./roadmap.md).

## Tech stack at a glance

- **Frontend:** Svelte 5 Runes, SvelteKit 2, Vite 8, Tailwind 3, Bits UI, TipTap 3, Lucide icons.
- **Server:** SvelteKit Node adapter, [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) WAL mode, single-file DB.
- **Desktop shell:** Tauri 2 (Rust 1.77.2+), Node.js sidecar pattern — see [02-architecture/tauri-shell.md](../02-architecture/tauri-shell.md).
- **AI:** OpenRouter HTTP, BYOK via OS keyring (`@napi-rs/keyring`).
- **Data portability:** Dexie 4 retained only for `.novellum.zip` import/export round-trip.
- **Quality:** ESLint with `eslint-plugin-boundaries`, Prettier, Stylelint, Vitest 4, Playwright 1.59, Storybook 10.
- **Package manager:** pnpm.

For the canonical list of dependencies and versions, read [package.json](../../package.json) directly. This page does not duplicate it.
