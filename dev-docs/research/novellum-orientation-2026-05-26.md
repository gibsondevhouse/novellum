# Novellum Knowledge Breakdown

## 1. Product thesis

Novellum is a **local-first, AI-assisted novel-writing desktop app** for serious long-form fiction work. It is not a generic writing assistant, not a web SaaS, and not a chat wrapper. The canonical product posture is:

* **Local-first:** user-owned SQLite database; no cloud sync; no accounts.
* **Desktop-first:** SvelteKit app wrapped in Tauri 2.
* **Single-author:** designed around one writer owning one local project space.
* **BYOK AI:** LLM calls go through OpenRouter; user key is stored locally.
* **Author-in-the-loop:** AI emits suggestions, drafts, rewrites, checks, or structured proposals; it does **not** silently mutate the manuscript.
* **Teaching product:** the next direction targets a **non-writer non-developer** user, so the product must teach fiction craft by walking the user through premise, worldbuilding, outline, drafting, and revision rather than assuming the user already knows how to construct a novel.

The repo context describes Novellum as a local-first, AI-assisted desktop writing app backed by SQLite, with OpenRouter BYOK AI and no cloud sync/accounts. 

### Difference from Scrivener

Scrivener is primarily a professional manuscript organization and compilation tool. Novellum overlaps with Scrivener on:

* project hierarchy,
* chapters/scenes,
* outlining,
* export,
* manuscript organization.

Novellum differs by adding:

* AI-native continuity checking,
* conversational project-aware assistance through Nova,
* structured worldbuilding persistence,
* staged generative workflows,
* review/acceptance gates between AI stages,
* craft-teaching UX for users who do not already know novel construction.

### Difference from ChatGPT

ChatGPT is a general conversation interface. Novellum is a **stateful authoring system** with persistent project objects.

Core distinction:

| ChatGPT                        | Novellum                                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------ |
| Stateless or chat-thread state | Structured project state                                                                   |
| User manually pastes context   | ContextEngine scopes project context                                                       |
| Output is prose in a chat      | Output can land in editor, outline, world-building, continuity, reader, or export surfaces |
| No durable novel data model    | SQLite-backed manuscript/world/project hierarchy                                           |
| General assistant              | Fiction-construction workspace                                                             |

### Difference from Sudowrite

Sudowrite is closer, but Novellum’s thesis is broader. Sudowrite is mainly a creative-writing AI assistant. Novellum is intended as a **local-first fiction production environment**:

* manuscript editor,
* outline system,
* world-building database,
* continuity engine,
* Nova conversational surface,
* reader mode,
* export surface,
* staged Vibe-Worldbuild / Vibe-Author generative flows.

The key distinction is **structured persistence + explicit human acceptance**, not just “AI helps write prose.”

---

## 2. Tech stack

Canonical stack from the uploaded context:

| Layer                  | Current knowledge                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------- |
| UI                     | Svelte 5, Runes only: `$state`, `$derived`, `$effect`; no `$:`                        |
| Framework              | SvelteKit 2, Node adapter                                                             |
| Build tooling          | Vite 8                                                                                |
| Language               | TypeScript strict mode                                                                |
| Styling                | Tailwind 3 plus design tokens in `src/styles/tokens.css`; no hardcoded colors/spacing |
| Components             | Bits UI, TipTap 3, Lucide icons                                                       |
| Editor                 | TipTap 3                                                                              |
| Server                 | SvelteKit endpoints                                                                   |
| Database               | SQLite through `better-sqlite3`, WAL mode                                             |
| DB access surface      | `/api/db/*`; client must not open SQLite directly                                     |
| Desktop shell          | Tauri 2                                                                               |
| Desktop language       | Rust for Tauri shell                                                                  |
| Runtime packaging      | Node.js sidecar bundled under `src-tauri/`                                            |
| AI gateway             | OpenRouter HTTP                                                                       |
| AI key storage         | OS keyring via `@napi-rs/keyring`                                                     |
| Data portability       | Dexie 4 only for `.novellum.zip` import/export, not primary live persistence          |
| Unit tests             | Vitest 4                                                                              |
| E2E / visual tests     | Playwright 1.59                                                                       |
| Component docs/testing | Storybook 10                                                                          |
| Package manager        | pnpm                                                                                  |
| Boundary enforcement   | `eslint-plugin-boundaries`                                                            |
| CSS linting            | `pnpm lint:css`; likely stylelint-backed per plan-method wording                      |
| Token enforcement      | `pnpm check:tokens`                                                                   |

The uploaded context explicitly identifies SvelteKit 2, Tauri 2, SQLite, OpenRouter, Tailwind tokens, TipTap, Bits UI, Lucide, `better-sqlite3`, Dexie, Vitest, Playwright, Storybook, and pnpm as canonical choices. 

Key architectural posture:

* Web app runs inside a Tauri desktop shell.
* Tauri starts or coordinates a local Node sidecar.
* SvelteKit serves UI and API routes.
* SQLite is accessed server-side only.
* OpenRouter calls are server-mediated.
* User data remains local unless the user invokes AI.

---

## 3. Repository layout

### Top-level layout I currently know

From the uploaded context and repo audit:

| Path                    | Purpose                                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------- |
| `src/`                  | Main SvelteKit app code                                                                                       |
| `src/lib/`              | Shared primitives, AI scaffolding, shared components, DB/server utilities, settings, stores, platform helpers |
| `src/modules/`          | Vertical product domains; canonical modules listed below                                                      |
| `src/routes/`           | SvelteKit page and API routes; route names mirror modules                                                     |
| `src/styles/`           | Global styles and token contract, including `tokens.css`                                                      |
| `src-tauri/`            | Tauri 2 desktop shell, Rust source, capability manifests, config, bundled Node sidecar location               |
| `tests/`                | Vitest, Playwright, visual, DB, component, and module-mirrored tests                                          |
| `dev-docs/`             | Internal engineering docs, architecture, AI docs, module docs, workflows, audits, plans                       |
| `dev-docs/plans/`       | 4-tier Plan → Stage → Phase → Part execution system                                                           |
| `novellum-docs/`        | User-facing product docs                                                                                      |
| `scripts/`              | Build, packaging, sidecar, smoke-test, changelog, maintenance scripts                                         |
| `static/`               | Public static assets                                                                                          |
| `.github/agents/`       | Development meta-agent definitions                                                                            |
| `.github/prompts/`      | Canonical reusable prompts, including continue-plan prompt                                                    |
| `.github/instructions/` | Repository planning/convention instructions                                                                   |
| `.github/workflows/`    | CI/release/visual test workflows [exact filenames known from audit, but not fully re-read here]               |

The context file gives the repo map and says `src/lib` holds AI scaffolding, components, DB/server utilities, keyboard, settings, stores, desktop/platform/migration/factory helpers; `src-tauri` holds Rust shell/config/capabilities/binaries; `tests` mirrors the source tree; and `dev-docs` contains architecture, AI, module, workflow, plan, audit, QA, and release documentation. 

### Canonical `src/modules/` list

Per your correction, these are the canonical module names:

| Module           | Purpose                                                                  |
| ---------------- | ------------------------------------------------------------------------ |
| `editor`         | Manuscript editor, TipTap writing surface, chapter/scene prose editing   |
| `outline`        | Narrative structure: arc → act → chapter → scene → beat                  |
| `project`        | Project hub and project hierarchy/persistence surface                    |
| `nova`           | Conversational AI surface; Nova chat/sidebar/workflow interface          |
| `continuity`     | Continuity-checking surface, findings, issue review                      |
| `reader`         | Paginated read-through / reader mode                                     |
| `export`         | DOCX / EPUB / Markdown / TXT and portability/export workflows            |
| `world-building` | World bible records: characters, places, factions, lore, timelines, etc. |
| `settings`       | Settings UI and configuration surfaces                                   |
| `assets`         | Image/media gallery and asset handling                                   |
| `onboarding`     | First-run/user setup flow                                                |
| `ai`             | Nova copilot internals / AI module-level UI or orchestration surfaces    |

### Important correction

I will **not** treat `story-bible` as canonical, even though the uploaded context’s repo map mentions `story-bible/, world-building/`. Your correction supersedes that: **Story Bible is a product concept spanning `world-building` plus project hierarchy tables**, not a canonical module name.

---

## 4. Data model

Known source of truth:

* Canonical schema lives in `src/lib/server/db/schema.ts`.
* SQLite is the live persistence layer.
* Docs may lag behind `schema.ts`.
* The repo audit states the live schema is materially larger than older docs and includes tables for project, structure, world-building, continuity, export, snapshots, prompts/instructions, preferences, metadata, and migrations. 

### Table families I know

I do **not** have the full current schema file in this turn, so exact table names below are marked according to confidence.

| Table / table family         | Purpose                                                                                                      | Certainty                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------ |
| `projects`                   | Root project records. Audit says docs referenced `projects.name`, but schema uses `projects.title`.          | Known table; fields partly known     |
| Structural hierarchy tables  | Arc → act → chapter → scene → beat hierarchy. Likely includes `arcs`, `acts`, `chapters`, `scenes`, `beats`. | [uncertain exact table names/fields] |
| World-building tables        | Story bible entities: characters, places, factions, lore, timeline/world records.                            | [uncertain exact table names/fields] |
| Continuity findings table(s) | Stores continuity issues/warnings/findings produced by ContinuityAgent or continuity workflows.              | [uncertain exact table names/fields] |
| Export settings table(s)     | Stores export preferences and format settings.                                                               | [uncertain exact table names/fields] |
| Snapshot table(s)            | Stores manuscript/project snapshots or backup/restore checkpoints.                                           | [uncertain exact table names/fields] |
| Prompt/instruction table(s)  | Stores reusable prompts, project instructions, or AI configuration context.                                  | [uncertain exact table names/fields] |
| `app_preferences`            | Application-wide preferences. Audit says live schema includes this.                                          | Known table name; fields uncertain   |
| `project_metadata`           | Project-level metadata. Audit says live schema includes this.                                                | Known table name; fields uncertain   |
| `schema_migrations`          | Tracks applied schema migrations.                                                                            | Known table name; fields uncertain   |

### Important schema cautions

* The audit says docs describe a smaller “16 shipped + auxiliary” model, but `schema.ts` contains a larger current model. 
* The audit says docs and implementation drift on fields/types; example: docs mention `projects.name`, while schema uses `projects.title`; many timestamps are `TEXT`, not integer timestamps. 
* I should not claim exact columns, indexes, cascades, constraints, or migration ordering without inspecting `src/lib/server/db/schema.ts` directly.

---

## 5. AI pipeline

Canonical pipeline:

```text
User Action → ContextEngine → PromptBuilder → ModelRouter → OpenRouter
```

This is explicitly stated in both `AGENTS.md` and `context.md`.  

### Known components

| Component              | Responsibility                                                                                | Certainty                                         |
| ---------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `ContextEngine`        | Builds minimal, scoped context for an AI request. Must not send full manuscript by default.   | Known abstraction                                 |
| `PromptBuilder`        | Produces prompts in canonical structure: ROLE → TASK → CONTEXT → CONSTRAINTS → OUTPUT FORMAT. | Known abstraction                                 |
| `ModelRouter`          | Selects OpenRouter model and routing/fallback behavior.                                       | Known abstraction; implementation depth uncertain |
| OpenRouter HTTP client | Sends actual model request through OpenRouter.                                                | Known                                             |
| Runtime agents         | Task-specific AI output contracts under `src/lib/ai/`.                                        | Known                                             |
| `Orchestrator`         | Mentioned in prior audit as possibly thinner than docs imply.                                 | Known name; implementation maturity uncertain     |

### Required prompt structure

Every runtime prompt must use:

1. `ROLE`
2. `TASK`
3. `CONTEXT`
4. `CONSTRAINTS`
5. `OUTPUT FORMAT`

`AGENTS.md` says prompt context must be scoped serialized JSON, constraints must include negative bounds, and output must match a strict schema/parser expectation. 

### AI non-negotiables

* All LLM calls go through OpenRouter.
* No direct provider SDK calls.
* API keys stay server-side / OS keyring.
* Client does not receive AI keys.
* Context is rebuilt per request.
* AI never silently edits the manuscript.
* AI outputs suggestions, drafts, warnings, rewrite options, or structured payloads for explicit human acceptance.
* Machine-consumable AI output should be schema-validated JSON.

### Known doc/code drift risk

The repo audit flagged that the AI docs may describe a richer pipeline than the currently exported `Orchestrator` embodies. That means I should treat `ContextEngine`, `PromptBuilder`, and `ModelRouter` as canonical architecture, but verify implementation depth before assigning new staged pipeline work to them. 

---

## 6. Shipped runtime agents

Per your correction and `AGENTS.md`, shipped runtime agents are:

| Agent             |  Status | Purpose                                                             | Expected input                                                                           | Expected output                                          | File                             |
| ----------------- | ------: | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------- | -------------------------------- |
| `ContinuityAgent` | Shipped | Detects inconsistencies in timeline, lore, traits, and story facts. | Scoped story context: current scene/chapter plus relevant timeline/lore/character facts. | Structured issue/warning list.                           | `src/lib/ai/continuity-agent.ts` |
| `EditAgent`       | Shipped | Improves prose clarity, flow, and line-level quality.               | Existing text selection or scene/chapter excerpt plus constraints.                       | Line edit suggestions.                                   | `src/lib/ai/edit-agent.ts`       |
| `RewriteAgent`    | Shipped | Produces alternative phrasings or versions of existing text.        | Existing text plus requested tone, pacing, or transformation goal.                       | Multiple rewrite options / alternative text.             | `src/lib/ai/rewrite-agent.ts`    |
| `StyleAgent`      | Shipped | Checks and aligns tone/voice/style consistency.                     | Text plus style guide, project voice, or comparison context.                             | Tone/voice consistency suggestions and rewrite guidance. | `src/lib/ai/style-agent.ts`      |

`AGENTS.md` lists these four as shipped runtime agents and states that runtime agents live under `src/lib/ai/`. 

### Explicitly cut from V1

Do **not** assume these exist:

* `BrainstormAgent`
* `OutlineAgent`
* `DraftAgent`
* `SummaryAgent`

`AGENTS.md` says these were cut from V1 and reintroducing them is a new feature plan, not follow-up work. 

Implication for the staged generative pipeline: the planned Vibe-Worldbuild and Vibe-Author flows must not be described as already implemented runtime agents. They may require orchestration, schemas, UI flows, or new task surfaces later, but that is future design work.

---

## 7. Build, test, and release surface

### Known pnpm scripts / commands

From `context.md` and `plan-method.md`:

| Command                          | Purpose                                                         |
| -------------------------------- | --------------------------------------------------------------- |
| `pnpm dev`                       | Web dev server                                                  |
| `pnpm desktop:dev`               | Tauri desktop dev                                               |
| `pnpm desktop:build`             | Tauri desktop build                                             |
| `pnpm check`                     | `svelte-check` + TypeScript checking                            |
| `pnpm lint`                      | ESLint, including boundary enforcement                          |
| `pnpm lint:css`                  | CSS/style linting                                               |
| `pnpm test`                      | Vitest                                                          |
| `pnpm check:tokens`              | Enforces token-driven styling / forbids hardcoded design values |
| `pnpm test:e2e`                  | Playwright e2e                                                  |
| `pnpm test:visual`               | Visual regression tests                                         |
| `pnpm storybook`                 | Storybook                                                       |
| `pnpm changelog`                 | Generate changelog                                              |
| `pnpm test path/to/file.test.ts` | Run a single Vitest file                                        |

The uploaded context lists common commands and required quality gates; the plan-method file also lists the gate scripts expected in plans.  

### Test tiers

Known tiers:

| Tier              | Tooling                                                |
| ----------------- | ------------------------------------------------------ |
| Type checking     | `svelte-check` + `tsc` via `pnpm check`                |
| Lint              | ESLint with `eslint-plugin-boundaries`                 |
| CSS lint          | `pnpm lint:css`                                        |
| Token enforcement | `pnpm check:tokens`                                    |
| Unit tests        | Vitest 4                                               |
| E2E tests         | Playwright 1.59                                        |
| Visual regression | Playwright visual tests                                |
| Component surface | Storybook 10                                           |
| DB tests          | Present under `tests/sqlite/`, `tests/db/` per context |
| AI tests          | Present under `tests/ai/` per context                  |

### Release / packaging

Known:

* Tauri 2 packages desktop app.
* Targets include macOS, Windows, Linux according to audit.
* User-facing artifacts likely include `.dmg`, `.msi`, `.AppImage` [from audit; exact current release workflow should be verified before relying on it].
* `src-tauri/` contains Tauri config, capabilities, Rust source, and bundled Node sidecar location.
* The audit identified a packaging risk: release workflow may build Tauri artifacts without explicitly invoking the Node sidecar fetch path. 

### CI workflows

Known from audit, not reverified against workflow files in this turn:

| Workflow           | Purpose                                      | Certainty     |
| ------------------ | -------------------------------------------- | ------------- |
| `ci.yml`           | check/lint/tests/build/smoke-type validation | [audit-based] |
| `visual-tests.yml` | scheduled/manual visual regression testing   | [audit-based] |
| `release.yml`      | tag-based Tauri builds and draft releases    | [audit-based] |

---

## 8. Conventions and non-negotiables

### Engineering rules

| Rule                 | Current understanding                                                           |
| -------------------- | ------------------------------------------------------------------------------- |
| Svelte 5 Runes only  | New code uses `$state`, `$derived`, `$effect`; no `$:`                          |
| Strict TypeScript    | No unjustified `any`                                                            |
| Token-driven styling | Use `src/styles/tokens.css`; no hardcoded colors/spacing/radii/shadows          |
| Modular boundaries   | Cross-module imports go through `src/modules/<domain>/index.ts`                 |
| Vertical slices      | Product features live under `src/modules/<domain>/`                             |
| Thin routes          | Routes should delegate to module/server services                                |
| Server-only SQLite   | Client must not import/use `better-sqlite3`; DB access goes through `/api/db/*` |
| Server-only keys     | OpenRouter key lives in OS keyring/server path, not client                      |
| No telemetry         | Local-first; only user-triggered AI traffic leaves machine                      |
| No silent edits      | AI output requires human review/acceptance before persistence                   |
| Scoped context       | Do not send whole manuscript by default                                         |
| Tests mirror source  | New source files should generally have mirrored tests                           |

These non-negotiables are stated in the uploaded context and plan-method.  

### Planning rules

Plan hierarchy:

```text
Plan → Stage → Phase → Part
```

File hierarchy:

```text
dev-docs/plans/<plan-slug>/plan.md
  stage-NNN-<slug>/stage.md
    phase-NNN-<slug>/phase.md
      part-NNN-<slug>/
        part.md
        checklist.md
        impl.log.md
        evidence/
```

Status lifecycle:

```text
draft → in-progress → review → complete
                    ↘ blocked
```

Plan-method requires:

* all new plan artifacts start as `draft`,
* `impl.log.md` is append-only,
* every completed Part needs at least one artifact in `evidence/`,
* status rolls upward only when children are complete,
* `MASTER-PLAN.md` and `ACTIVE-PLAN.md` are updated when filing a new plan or changing active work. 

### Prompt rules

All AI prompts follow:

```text
ROLE
TASK
CONTEXT
CONSTRAINTS
OUTPUT
```

For machine-consumable outputs, the expected target is strict structured output, schema validation, and parser-compatible JSON.

---

## 9. What I am not sure about

### Repo/code uncertainties

I still need direct repo inspection before making implementation-grade claims about:

1. Exact current `src/modules/` folder tree, especially whether stale `story-bible` directories still exist.
2. Exact `src/lib/ai/` files and exports.
3. Whether the shipped runtime agent files are named exactly:

   * `continuity-agent.ts`
   * `edit-agent.ts`
   * `rewrite-agent.ts`
   * `style-agent.ts`
4. Exact implementation depth of:

   * `ContextEngine`
   * `PromptBuilder`
   * `ModelRouter`
   * `Orchestrator`
5. Whether OpenRouter is enforced everywhere or direct provider remnants exist.
6. Whether JSON schema / structured output is enforced consistently or only documented.
7. Whether API keys are fully unreachable client-side in every route/component.
8. Whether `/api/db/*` is the only live SQLite access path.
9. Exact schema in `src/lib/server/db/schema.ts`.
10. Exact migration strategy and migration order.
11. Whether generated outputs currently persist through module services, direct DB calls, or mixed paths.
12. Whether Nova’s UI state machine is stable enough for staged workflows.
13. Whether outline/project hierarchy tables are normalized enough to receive generated outline/scene-stage outputs.
14. Whether world-building tables can accept a generated world bible without schema expansion.
15. Whether continuity findings already support staged-generation validation findings.
16. Whether reader/export can consume draft-stage outputs or only finalized manuscript records.
17. Whether CI currently passes cleanly.
18. Whether visual tests remain flaky around Nova.
19. Whether the Tauri sidecar fetch/release packaging issue is fixed.
20. Whether docs have been synchronized after the latest architecture changes.

### Product uncertainties

I now know the planned direction, but not the detailed product contract for it:

1. What exact structured schema should `Worldspec` use?
2. What counts as “Research” in Vibe-Worldbuild: web research, user-provided notes, internal genre/craft heuristics, or all of the above?
3. Whether research outputs are stored as source records, notes, citations, or synthesized facts.
4. Whether `Vibe-Worldbuild` creates new records directly after acceptance or stages them in a review buffer first.
5. Whether `Vibe-Author` outline output maps to existing arc/act/chapter/scene/beat tables exactly.
6. Whether scene drafts are stored as manuscript scene content, snapshots, suggestions, or pending draft records.
7. Whether Revision Pack output maps to continuity findings, editor suggestions, export notes, or a new review artifact.
8. Whether stage review UI belongs primarily in `nova`, `onboarding`, `outline`, `world-building`, or a cross-module route.
9. Whether the staged pipeline should be available only for new projects or also retrofit existing projects.
10. Whether the non-writer teaching layer is inline instructional UX, wizard copy, craft cards, progressive disclosure, or generated explanations.

---

## 10. Staged Generative Pipeline — planned

This is **not implemented product surface** yet. It is the next intended direction and should guide research.

The planned pipeline is not “AI writes a book while the user watches.” It is a **human-reviewed staged generation system**. Each stage produces structured output. The user reviews, edits, and accepts that output before the next stage can run. The AI never silently mutates the manuscript.

### Flow A: Vibe-Worldbuild

```text
Premise → Worldspec → Research → Populated World Bible
```

Purpose: take a non-writer from a rough premise to a usable fictional world foundation.

| Stage                 | User-facing goal                                                    | Likely structured output                                                                                                | Review target                                                               | Persistence target after acceptance                                                      |
| --------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Premise               | Capture the seed idea in plain language.                            | Premise statement, genre, tone, audience, constraints, known inspirations, exclusions.                                  | `nova` or `onboarding` guided flow; maybe `project` setup.                  | `project` metadata / prompt-instruction tables [exact tables uncertain]                  |
| Worldspec             | Convert premise into a coherent world design brief.                 | Setting rules, genre frame, central conflict, world logic, factions, power systems, social order, timeline assumptions. | `nova` staged review UI; possibly `world-building` preview.                 | `world-building` records plus `project_metadata` / prompt-instruction tables [uncertain] |
| Research              | Ground the world with reference material and craft/context support. | Research dossier, source notes, genre conventions, comparable works, real-world analogs, constraints.                   | `nova` or dedicated review surface; not currently a known canonical module. | Prompt/instruction tables, project metadata, maybe world-building notes [uncertain]      |
| Populated world bible | Create usable entities from accepted worldspec/research.            | Characters, places, factions, lore entries, timeline/key events, possibly assets prompts.                               | `world-building` review lists/forms.                                        | `world-building` tables and project hierarchy tables                                     |

### Existing module targets for Vibe-Worldbuild

| Module           | Role in pipeline                                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- |
| `onboarding`     | Likely entry point for a new non-writer starting from premise.                                                        |
| `nova`           | Conversational/staged guidance and explanation layer.                                                                 |
| `project`        | Project metadata, premise, hierarchy anchors, accepted project-level instructions.                                    |
| `world-building` | Main landing zone for world bible entities.                                                                           |
| `assets`         | Possible future landing zone for generated/imported visual references or prompts; not assumed as current requirement. |
| `continuity`     | Later validates whether generated world bible is internally consistent.                                               |
| `settings`       | Model/key/preferences controlling generation behavior.                                                                |
| `ai`             | Internal AI surface/orchestration support.                                                                            |

### Flow B: Vibe-Author

```text
Premise (+ optional world bible) → Outline → Scene drafts → Revision pack
```

Purpose: take a non-writer from idea/world to an actual draftable manuscript plan and early prose, while teaching novel construction.

| Stage                          | User-facing goal                                                | Likely structured output                                                                     | Review target                                                        | Persistence target after acceptance                                                        |
| ------------------------------ | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Premise + optional world bible | Establish story seed and available canon.                       | Premise, protagonist, want/need, conflict, stakes, tone, accepted world facts.               | `nova`, `project`, maybe `world-building` summary.                   | `project` metadata and world-building references [uncertain]                               |
| Outline                        | Teach and produce story structure.                              | Arc, acts, chapters, scenes, beats, turning points, chapter purposes.                        | `outline` review surface.                                            | `outline` / project hierarchy tables: arc → act → chapter → scene → beat                   |
| Scene drafts                   | Generate draftable scene prose from accepted outline and canon. | Scene draft text, scene goal/conflict/outcome, continuity notes, alternatives.               | `editor` scene/chapter surface, with explicit accept/apply controls. | `editor` scene/chapter manuscript records, possibly snapshots before apply                 |
| Revision pack                  | Help user improve draft without silent mutation.                | Continuity findings, style notes, rewrite options, line edits, developmental edit checklist. | `continuity`, `editor`, `nova`.                                      | Continuity findings table(s), editor suggestions/snapshots [exact table targets uncertain] |

### Existing module targets for Vibe-Author

| Module           | Role in pipeline                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| `nova`           | Guides the user through the staged process, explains craft, collects decisions, summarizes stage readiness. |
| `project`        | Stores premise, project metadata, accepted constraints, project-level instructions.                         |
| `world-building` | Supplies optional world bible context and receives any new accepted canon facts.                            |
| `outline`        | Main persistence/review target for arc/act/chapter/scene/beat output.                                       |
| `editor`         | Main review/application target for scene drafts and prose revisions.                                        |
| `continuity`     | Generates and displays conflicts, warnings, and revision risks.                                             |
| `reader`         | Later validates read-through flow once draft scenes exist.                                                  |
| `export`         | Later packages accepted manuscript output; not a generation-stage target.                                   |
| `ai`             | Internal pipeline, model, prompt, context, and orchestration support.                                       |
| `settings`       | Model/key/preference configuration.                                                                         |

### Critical behavioral rule for both flows

Every stage must have:

1. **Input summary** — what the AI is using.
2. **Structured output** — machine-usable, schema-validated.
3. **Human review state** — pending / edited / accepted / rejected.
4. **Explicit acceptance action** — no auto-apply.
5. **Persistence mapping** — accepted output lands in existing module tables.
6. **Teaching layer** — explains why the stage matters in novel construction.

This product direction changes the framing: research should not merely ask “how do AI writing tools generate better prose?” It should ask how to design a **review-gated fiction-construction pipeline** for a user who needs both generation and instruction.
