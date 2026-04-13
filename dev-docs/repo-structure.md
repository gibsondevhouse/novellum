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
│   │   │       ├── +page.svelte     # Project Hub
│   │   │       ├── bible/
│   │   │       │   └── +page.svelte
│   │   │       ├── outline/
│   │   │       │   └── +page.svelte
│   │   │       └── editor/
│   │   │           └── +page.svelte
│   │   └── api/                     # SvelteKit server routes (AI proxy)
│   │       └── ai/
│   │           └── +server.ts       # OpenRouter proxy endpoint
│   ├── lib/
│   │   ├── components/              # Shared UI components
│   │   │   ├── AppShell.svelte
│   │   │   ├── Sidebar.svelte
│   │   │   └── AiPanel.svelte
│   │   ├── db/                      # Dexie database definition
│   │   │   ├── schema.ts            # Version.stores() schema string
│   │   │   ├── db.ts                # Dexie instance export
│   │   │   └── types.ts             # EntityTable types for all entities
│   │   ├── ai/                      # AI orchestration layer
│   │   │   ├── orchestrator.ts      # Orchestrator interface + factory
│   │   │   ├── context-builder.ts   # Context Engine (selects/serializes context)
│   │   │   └── openrouter.ts        # OpenRouter HTTP client
│   │   └── utils/                   # Shared utilities (id generation, etc.)
│   ├── modules/                     # Feature-domain modules
│   │   ├── project/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── index.ts
│   │   ├── bible/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── index.ts
│   │   ├── outliner/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── index.ts
│   │   ├── editor/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── index.ts
│   │   └── ai/
│   │       ├── components/
│   │       ├── services/
│   │       └── index.ts
│   ├── stores/                      # Svelte stores (app-level state)
│   │   ├── active-project.ts
│   │   └── ai-panel.ts
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
