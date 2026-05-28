# Roadmap

> Last verified: 2026-05-27

This roadmap reflects what is **shipped**, what is **in flight** (active plans in [../plans/](../plans/)), and what is explicitly **planned but not started**. It does not promise dates.

## Shipped (as of 2026-05-27)

- Server-side SQLite via `better-sqlite3` and the `/api/db/*` REST surface — closed by [plan-008-local-sqlite](../plans/archive/plan-008-local-sqlite/plan.md).
- Versioned migrations, app-data path resolution, autosave & recovery, BYOK keyring storage, Tauri sidecar packaging — closed by [plan-017-v1-trust-foundation](../plans/archive/plan-017-v1-trust-foundation/plan.md) (complete 2026-04-30).
- Arc → Act → Chapter → Scene navigable workspace UI — closed by [plan-013-workspace-hierarchy-flow](../plans/archive/plan-013-workspace-hierarchy-flow/plan.md) (complete v2.0.0, 2026-04-28).
- V1 sellable product experience (export quality, editor writing-first refactor, hub trust cards, settings trust center, AI V1 scope, onboarding, worldbuilding audit, design-system freeze, doc tracks, CI/release, licensing, QA + beta DoD) — closed by [plan-018-v1-product-experience](../plans/archive/plan-018-v1-product-experience/plan.md) (2026-05-06).
- Quick fixes & Nova identity (Nova prompt, OpenRouter key persistence, hub word-count accuracy) — closed by [plan-020-fixes-and-nova-identity](../plans/archive/plan-020-fixes-and-nova-identity/plan.md) (2026-05-06).
- Settings IA (categorized PillNav, typed `/api/db/preferences`) — closed by [plan-022-settings-ia](../plans/archive/plan-022-settings-ia/plan.md) (2026-05-06).
- Editor redesign + right-panel Nova copilot (chat + RAG + agentic stubs) — closed by [plan-023-editor-redesign-and-nova-copilot](../plans/archive/plan-023-editor-redesign-and-nova-copilot/plan.md) (2026-05-04).
- Visual consistency refactor across route families — closed by [plan-016-visual-consistency](../plans/archive/plan-016-visual-consistency/plan.md) (closed 2026-04-28; remaining scope absorbed into plan-018).
- Documentation refresh of dev-docs and novellum-docs — closed by [plan-014-documentation-refresh](../plans/archive/plan-014-documentation-refresh/plan.md) (2026-04-20). Re-baselined 2026-05-07.
- Cinematic media gallery refactor — closed by [plan-015-cinematic-media](../plans/archive/plan-015-cinematic-media/plan-015-cinematic-media.md) (2026-04-21).
- 4 shipped AI agents: Continuity, Edit, Rewrite, Style — see [03-ai/agents-map.md](../03-ai/agents-map.md).
- Portable `.novellum.zip` backup/restore round-trip — closed by [plan-006-portability-backup-and-restore](../plans/archive/plan-006-portability-backup-and-restore/plan.md).
- Local Ollama provider as a second AI backend (provider, launcher, settings panel, API route resolution, Settings → AI toggle with persistence) — shipped. Closed by plan-029 closeout (originally plan-024 stage-003).
- Light theme tokens with `color-scheme` parity, parchment palette under `:root[data-theme='light']` — shipped. Visual regression re-baselined by plan-026 (2026-05-26).
- Global keyboard shortcut bus (`SHORTCUT_EVENT` + `installGlobalShortcuts`) with `save-scene` (Meta+S) and `view-in-reader` default bindings, dispatched via `global-handler.ts` to `EditorShell` — shipped. Closed by plan-029 closeout (originally plan-024 stage-003).
- Sidebar collapse moved to a shared `sidebar.svelte` store; Home button gains a `?home=1` redirect bypass — shipped 2026-05-10.
- Migration precheck tolerates a missing Dexie store or unreachable SQLite endpoint without throwing — shipped 2026-05-10.
- V1 Definition-of-Done: 47/47 DoD items satisfied — closed by [plan-024-v1-final-mile](../plans/archive/plan-024-v1-final-mile/plan.md) (2026-05-26).
- V1 functional-after-build hardening (app-data path, 4 unimplemented agents cut, smoke harness extended) — closed by [plan-025-functional-after-build](../plans/archive/plan-025-functional-after-build/plan.md) (2026-05-13).
- UI v2 design system (author-first visual truth) — closed by [plan-026-ui-v2-design-system](../plans/archive/plan-026-ui-v2-design-system/plan.md) (2026-05-26).
- V1.1 fiction pipeline (pipeline foundation, Vibe-Worldbuild, Vibe-Author) — closed by [plan-027-v1.1-scoping](../plans/plan-027-v1.1-scoping/plan.md) (2026-05-27).
- Hierarchical pipeline UI (outline traversal, worldbuild run flow, checkpoint review console) — closed by [plan-028-v1.1-hierarchical-pipeline-ui](../plans/plan-028/plan.md) (2026-05-26).
- Reader empty state + deterministic client-side pagination engine (page-box chunking, prev/next navigation, drop-cap support) — shipped via plans 027/028. Closed by plan-029 closeout (originally plan-021).
- Codebase naming consistency (route/module/component alignment) — shipped organically via plans 020-028. Closed by plan-029 closeout (originally plan-019).

## In flight

| Plan | Status | Goal |
| --- | --- | --- |
| [plan-029-v1.1-unfinished-work-closeout](../plans/plan-029-v1.1-unfinished-work-closeout/plan.md) | in-progress | Close all deferred V1/V1.1 commitments. Retiring plan-019, plan-021, plan-024 stage-003 as shipped; deferring plan-024 stage-002 (release engineering) to a dedicated release plan; executing docs rebaseline. |

Release engineering (code signing, notarization, brand icons) is deferred to a dedicated release plan — requires external procurement, not software engineering.

## Next era — full AI integration

Following the V1 trust + product foundation, the next development era expands AI integration end-to-end, including **API-based image generation models** alongside the existing text agents. New plans will be drafted under [../plans/](../plans/) and tracked here.

## Planned but not started

> Cut from V1 (2026-05-13, plan-025): `BrainstormAgent`, `OutlineAgent`, `DraftAgent`, `SummaryAgent` were removed from the V1 task-resolver surface. Re-introducing any is a new feature plan.

### Deferred (not yet scheduled)

- **Release engineering** — Apple Developer ID signing, Windows Authenticode, brand icons, formal smoke/keyring verification, CI tag dry-run. Infrastructure exists (`release.yml`, `desktop-build.yml`); requires external procurement.
- **Manuscript export UI** — wire `exportProject()` to a real UI surface with profile selector, format toggle, chapter-subset selection. Drivers exist in `src/modules/export/services/`; V1 Export button is JSON portability only.
- **Large-novel performance harness** — deterministic `tests/fixtures/large-novel/` (100ch / 500sc / 100k words) with timing tests.
- **Multi-project restore UI** — UI for multi-project restore from a single `.novellum.zip`.
- **Documentation re-baseline** — roll forward remaining stale docs post plan-029 closeout.

## Out of scope

- Cloud sync / multi-device.
- Multi-author collaboration.
- Mobile clients.
- Custom-trained models (Novellum is BYOK-only and provider-agnostic via OpenRouter).
