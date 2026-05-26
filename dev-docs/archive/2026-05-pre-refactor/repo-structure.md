# Repo Structure

SvelteKit project rooted at the repo root. All application source lives under `src/`.

```text
/novellum
├── src/
│   ├── app.html                     # SvelteKit HTML shell
│   ├── app.d.ts                     # Global TS declarations (App namespace)
│   ├── app.css                      # Global stylesheet (design system tokens import)
│   ├── routes/                      # SvelteKit file-based routing
│   │   ├── +layout.svelte           # Root layout (sidebar + main content slot)
│   │   ├── +layout.ts               # Root layout load function
│   │   ├── +page.svelte             # Home / project list
│   │   ├── projects/
│   │   │   └── [id]/
│   │   │       ├── +layout.svelte   # Per-project layout (project nav)
│   │   │       ├── +page.svelte     # Project landing redirect
│   │   │       ├── hub/             # Project Hub dashboard
│   │   │       │   └── +page.svelte
│   │   │       ├── outline/         # Outline surface (renders $modules/outline)
│   │   │       │   └── +page.svelte
│   │   │       ├── arcs/            # Arc → Act → Chapter drilldown
│   │   │       │   └── ...
│   │   │       ├── editor/          # Manuscript Editor (multi-pane writing surface)
│   │   │       │   ├── +page.svelte
│   │   │       │   └── [sceneId]/   # Scene Editor (focused single-scene route)
│   │   │       │       └── +page.svelte
│   │   │       ├── world-building/  # Worldbuilding shell (Personae/Atlas/etc.)
│   │   │       │   └── +page.svelte
│   │   │       ├── continuity/      # Continuity Command (consistency-pass results)
│   │   │       │   └── +page.svelte
│   │   │       ├── bible/           # Legacy 307 → world-building/
│   │   │       │   └── +page.ts
│   │   │       └── consistency/     # Legacy 307 → continuity/
│   │   │           └── +page.ts
│   │   └── api/                     # SvelteKit server routes (API endpoints)
│   ├── lib/
│   │   ├── components/              # Shared UI components
│   │   │   ├── AppShell.svelte
│   │   │   ├── AppSidebar.svelte
│   │   │   └── AiPanel.svelte
│   │   ├── db/                      # Shared DB types and schemas
│   │   │   ├── schema.ts            # Version.stores() schema string
│   │   │   ├── db.ts                # Dexie instance export
│   │   │   └── types.ts             # EntityTable types for all entities
│   │   ├── server/
│   │   │   └── db/                  # SQLite db setup and migrations
│   │   ├── ai/                      # AI orchestration layer
│   │   │   ├── orchestrator.ts      # Orchestrator interface + factory
│   │   │   ├── context-builder.ts   # Context Engine (selects/serializes context)
│   │   │   └── openrouter.ts        # OpenRouter HTTP client
│   │   └── utils/                   # Shared utilities (id generation, etc.)
│   ├── modules/                     # Feature-domain modules (canonical names)
│   │   ├── project/                 # Powers /projects/[id]/hub
│   │   ├── world-building/          # Powers /projects/[id]/world-building
│   │   ├── outline/                 # Powers /projects/[id]/outline (renamed from outliner)
│   │   ├── editor/                  # Powers /projects/[id]/editor + /editor/[sceneId]
│   │   ├── continuity/              # Powers /projects/[id]/continuity (absorbed former consistency module)
│   │   └── ai/
│   ├── stores/                      # Svelte 5 rune stores (app-level state)
│   │   ├── active-project.svelte.ts
│   │   └── ai-panel.svelte.ts
│   └── styles/
│       ├── tokens.css               # Design system CSS custom properties
│       └── reset.css
├── static/                          # Public static assets
├── tests/                           # Vitest unit + integration tests
├── .github/                         # Agent definitions, skills, instructions
├── dev-docs/                        # Planning artifacts and documentation
├── svelte.config.js
├── vite.config.ts
├── tsconfig.json
├── .eslintrc.cjs
├── .prettierrc
└── package.json
```

## Key Conventions

- All imports from within `src/lib/` use the `$lib` alias (configured by SvelteKit).
- All imports from within `src/modules/` use `$modules/<module>` — add to `tsconfig.json` paths.
- Server-only code (API keys, direct DB writes from server) lives exclusively in `src/routes/api/` or `+server.ts` files.
- The OpenRouter API key is read from `$env/static/private` and never exposed to the client bundle.
