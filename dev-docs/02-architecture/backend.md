# Backend

> Last verified: 2026-06-16 (plan-053 implementation review)

The "backend" is a SvelteKit server (Node adapter) that runs either via `pnpm dev` or as a Tauri sidecar. There is no separate backend service.

## Server boundary

- All server-only code lives under [src/lib/server/](../../src/lib/server/) and inside `+server.ts` files. SvelteKit forbids importing this code from client-bundled files.
- The browser talks to the server exclusively via HTTP through [src/lib/api-client.ts](../../src/lib/api-client.ts):
  - `apiGet<T>(path, params?)`
  - `apiPost<T>(path, body)`
  - `apiPut<T>(path, body)`
  - `apiDel(path)`
- Non-2xx responses throw `ApiError` ([src/lib/errors.ts](../../src/lib/errors.ts)).

## Database layer

Location: [src/lib/server/db/](../../src/lib/server/db/).

| File | Responsibility |
| --- | --- |
| `client.ts` | `better-sqlite3` singleton, WAL mode, `PRAGMA foreign_keys = ON`. |
| `schema.ts` | SQL DDL for 28 tables and 40+ indexes. |
| `migrations.ts` | Versioned migrations applied on startup. |
| `serialize.ts` | JSON encode/decode helpers for TEXT columns that store structured data (e.g., character traits, scene snapshots). |

Schema and table relationships are documented in [data-model.md](./data-model.md).

## API surface

All endpoints are SvelteKit `+server.ts` files under [src/routes/api/](../../src/routes/api/). Listed exhaustively below as of 2026-06-16.

### `/api/db/*` — entity REST

Every entity follows the same pattern:

- `GET /api/db/<entity>` — list (often filtered by `projectId` query param).
- `POST /api/db/<entity>` — create.
- `GET|PUT|DELETE /api/db/<entity>/[id]` — item.
- `PUT /api/db/<entity>/reorder` — reorder via `{ orderedIds: string[] }` body (only on entities with `position`/`order_index`).

Entities with reorder support: `acts`, `arcs`, `beats`, `chapters`, `scenes`, `stages`.

Full entity list:

```text
acts, arcs, beats, chapters, character_relationships, characters,
chat_instructions, consistency_issues, export_settings, locations,
lore_entries, milestones, plot_threads, projects, scene_snapshots,
scenes, stages, story_frames, system_prompts, templates,
timeline_events, writing_styles, assets, agent_runs, agent_run_steps,
agent_tool_calls, agent_artifacts, agent_usage, agent_run_errors,
agent_jobs, agent_trace_events, agent_trace_redactions
```

Special endpoints:

- `GET|PUT /api/db/preferences/[key]` — typed user preferences.
- `GET|PUT /api/db/project-metadata/[projectId]/[scope]/[ownerId][/<key>]` — flexible per-project metadata bag.
- `POST /api/db/scene_snapshots/[id]/restore` — restore a scene to a prior snapshot.

### `/api/ai-controller/*` — Governed Controller

Plan-051 introduces the governed AI controller as the primary AI execution endpoint.

| Path | Method | Purpose |
| --- | --- | --- |
| `/api/ai-controller` | POST | Execute a governed AI workflow (resolves intent, applies policy, builds context packet, invokes workflow). |
| `/api/ai-controller/runs` | GET | List historical agent runs for audit and tracing. |
| `/api/ai-controller/runs/[id]`| GET | Get detailed run evidence (steps, tool calls, usage, artifacts). |

### `/api/ai/*` — OpenRouter proxy (Legacy/Direct)

| Path | Method | Purpose |
| --- | --- | --- |
| `/api/ai` | POST | Streaming completions for Ask/Write modes. |
| `/api/ai/models` | GET | List available models from OpenRouter. |
| `/api/ai/validate-key` | POST | Validate a candidate OpenRouter API key. |

The OpenRouter key never reaches the browser. It is fetched server-side from the OS keyring via [src/lib/ai/credential-service.ts](../../src/lib/ai/credential-service.ts).

### `/api/nova/*`

| Path | Method | Purpose |
| --- | --- | --- |
| `/api/nova/context` | POST | Build a Nova chat context payload from project state. |
| `/api/nova/agent` | POST | Non-streaming tool-capable completions for Agent mode. |

### `/api/settings/*`

| Path | Method | Purpose |
| --- | --- | --- |
| `/api/settings/about` | GET | App version, build info. |
| `/api/settings/ai-key` | GET/POST/DELETE | Store/retrieve/clear OpenRouter API key (keyring-backed). |
| `/api/settings/ai-status` | GET | Whether AI is configured and reachable. |
| `/api/settings/storage-location` | GET/PUT | Inspect or change the SQLite database location. |

### `/api/backup/*` and `/api/restore/*`

| Path | Method | Purpose |
| --- | --- | --- |
| `/api/backup/projects/[id]` | GET | Stream a `.novellum.zip` of the project (manifest + entities + assets). |
| `/api/restore/preview` | POST | Inspect a `.novellum.zip` without committing. |
| `/api/restore/project` | POST | Apply a `.novellum.zip` into the live SQLite. |

Backup format and integrity rules: see [05-workflow/portability-runbook.md](../05-workflow/portability-runbook.md).

### `/api/local-files/*`

| Path | Method | Purpose |
| --- | --- | --- |
| `/api/local-files/image` | GET/POST | Image asset upload + retrieval. |
| `/api/local-files/normalize` | POST | Normalize a local file path for desktop builds. |

### `/api/projects/[projectId]/*`

| Path | Method | Purpose |
| --- | --- | --- |
| `/api/projects/[projectId]/characters/[charId]/scratchpad` | GET/PUT | Per-character scratchpad persistence. |

### `/api/nova/*`

| Path | Method | Purpose |
| --- | --- | --- |
| `/api/nova/context` | POST | Build a Nova chat context payload from project state. |

## Endpoint conventions

- **Validation:** every handler validates its body with a Zod schema declared in the corresponding module's `types.ts`.
- **Identity:** IDs are string ULIDs generated client-side via [src/lib/utils.ts](../../src/lib/utils.ts).
- **Helpers:** `+server.ts` files only export endpoint handlers (`GET`, `POST`, etc.). Helper functions live in sibling modules (e.g., `http.ts`) and are imported. Postbuild validation rejects arbitrary named exports from `+server.ts`.
- **Error shape:** non-2xx responses return `{ error: string, details?: unknown }`.

## Hooks

[src/hooks.server.ts](../../src/hooks.server.ts) handles request-level concerns (logging, error normalization). It does **not** perform auth — Novellum is single-user and runs on loopback.

## Credentials and secrets

- OpenRouter API key: stored in OS keyring via `@napi-rs/keyring`, accessed only by [src/lib/ai/credential-service.ts](../../src/lib/ai/credential-service.ts).
- No other secrets. Backup `.novellum.zip` files explicitly **exclude** the keyring entry — see [tests/backup/](../../tests/backup/) for the credential-exclusion test.

## See also

- [data-model.md](./data-model.md) — table schema.
- [routing.md](./routing.md) — full route tree, including pages.
- [03-ai/pipeline.md](../03-ai/pipeline.md) — how `/api/ai` is consumed.
