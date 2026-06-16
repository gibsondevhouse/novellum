# Testing

> Last verified: 2026-06-16 (plan-053 implementation review)

Novellum has three test tiers. All three must pass before a release.

## Tier 1 — Vitest (unit + integration)

Configured in [vitest.config.ts](../../vitest.config.ts). Setup in [tests/setup.ts](../../tests/setup.ts). Runs with `jsdom` for component-level rendering.

| Command | Purpose |
| --- | --- |
| `pnpm test` | Run all Vitest suites. |
| `pnpm test:watch` | Watch mode. |
| `pnpm test:coverage` | With v8 coverage. |

### What lives where (`tests/<area>/`)

| Area | Coverage |
| --- | --- |
| `ai/` | Agent parsers, context builders, credential handling, model routing. |
| `ai-controller/` | Governed AI controller runtime, intent resolution, policy guards, context assembly. |
| `editor/` | Autosave, recovery, snapshots, toolbar, geometry, mode mgmt. |
| `nova/` | Chat, tools, error handling, stream control, sessions, agent loop. |
| `settings/` | Theme, AI settings, backup, appearance, defaults. |
| `sqlite/` | Route persistence (characters, chapters, scenes, projects, …). |
| `routes/` | API endpoints (backup, restore, AI key, storage location). |
| `repositories/` | Data layer (Act, Arc, Scene, Character, Project, Beat, Hierarchy). |
| `continuity/` | Consistency engine. |
| `outline/` | Story workspace hierarchy + migration, generation checkpoints. |
| `project/` | Project health, hub UI. |
| `reader/` | Virtualization, pagination, deep linking, page geometry. |
| `export/` | DOCX, EPUB, Markdown, Assembler. |
| `portability/` | Backup roundtrip, failure modes. |
| `backup/` | Parse, restore, checksums, manifest, credential exclusion. |
| `lib/` | Preferences, i18n, platform, desktop, version, error handling. |
| `agent-runtime/` | Hardened runtime: runs, jobs, steps, tool calls, traces (Plan-049). |
| `assets/`, `onboarding/`, `db/`, `server/` | Misc. |
| `ci/` | Workflow lint, version sync. |

Mocks live in [tests/__mocks__/](../../tests/__mocks__/).

## Tier 2 — Playwright E2E

Configured in [playwright.config.ts](../../playwright.config.ts).

| Command | Purpose |
| --- | --- |
| `pnpm test:e2e` | Runs [tests/e2e/](../../tests/e2e/). |

E2E covers cross-route flows:
- Project creation, scene editing → save → reload, backup/restore round-trip.
- **AI Pipeline:** worldbuilding proposal review (`worldbuilding-proposal-review.spec.ts`), worldbuilding generation actions (`worldbuilding-generation-actions.spec.ts`), and author review gates (`vibe-author-review-gates.spec.ts`).
- **Hierarchy:** traverse, run, review, and accept flows for outline generation.

## Tier 3 — Visual regression
...

| Command | Purpose |
| --- | --- |
| `pnpm test:visual` | Runs [tests/visual/](../../tests/visual/). |

Snapshots are committed; intentional visual changes require updating snapshots in the same PR with a justification in the PR description.

## Adding a test

| If you… | Add a test in… |
| --- | --- |
| Add an AI agent | `tests/ai/<agent>.test.ts` covering parser happy path and at least one malformed response. |
| Add a module | `tests/<module>/` — services first, components second. |
| Add a `/api/*` endpoint | `tests/routes/` or `tests/sqlite/` for persistence integration. |
| Add a schema migration | `tests/db/` or `tests/sqlite/` regression covering pre-/post-migration state. |
| Touch UI critically | Visual snapshot in `tests/visual/`. |

## Boundary tests

The ESLint `eslint-plugin-boundaries` config is itself the boundary test. Run `pnpm lint`. Do not silence boundary errors; fix the import.

## CI

GitHub Actions workflows live under `.github/workflows/` (when present). CI lint is itself tested under [tests/ci/](../../tests/ci/).
