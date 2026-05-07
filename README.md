# Novellum

> Local-first, AI-assisted novel production workspace for serious fiction writers.

![License](https://img.shields.io/badge/license-Proprietary-red)

## Features

- **Manuscript editor** — TipTap scene editor with continuous autosave, snapshot history, and crash recovery.
- **Structural outline** — Arc → Act → Chapter → Scene → Beat hierarchy with drilldown workspaces.
- **World Building** — Personae, Atlas, Archive, Threads, and Chronicles in a unified shell.
- **Nova AI copilot** — chat-style assistant grounded in your project; bring your own OpenRouter key (no subscription).
- **Continuity checks** — agentic consistency review across scenes, characters, locations, and timeline.
- **Reader** — paginated, distraction-free read-through view.
- **Exports** — DOCX, EPUB, Markdown, and TXT.
- **Portability** — `.novellum.zip` backup/restore round-trip; standard SQLite under the hood.
- **Local-first and private** — data lives on your device; no cloud sync, no telemetry, no account.

## Get started

- [Install Guide](novellum-docs/user/install.md)
- [Quick Start](novellum-docs/user/quick-start.md)
- [AI Setup (BYOK)](novellum-docs/user/ai-setup.md)

## Documentation

- [User Docs](novellum-docs/user/) — for authors using Novellum.
- [Developer Docs](novellum-docs/developer/) — for contributors.
- [Dev Reference (`dev-docs/`)](dev-docs/) — architecture, modules, AI pipeline, plans, and the project journey.

## Contributing

Start with [novellum-docs/developer/getting-started.md](novellum-docs/developer/getting-started.md) and [novellum-docs/developer/contributing.md](novellum-docs/developer/contributing.md). Non-trivial changes follow the 4-tier planning system in [dev-docs/05-workflow/planning-conventions.md](dev-docs/05-workflow/planning-conventions.md).

## Tech at a glance

Svelte 5 (Runes) · SvelteKit 2 · Tauri 2 (Node sidecar) · better-sqlite3 · OpenRouter (BYOK) · Vitest · Playwright

## License

Proprietary. All Rights Reserved. © 2026 Gibson Dev House.
