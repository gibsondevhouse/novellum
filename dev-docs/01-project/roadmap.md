# Roadmap

> Last verified: 2026-05-10

This roadmap reflects what is **shipped**, what is **in flight** (active plans in [../plans/](../plans/)), and what is explicitly **planned but not started**. It does not promise dates.

## Shipped (as of 2026-05-10)

- Server-side SQLite via `better-sqlite3` and the `/api/db/*` REST surface — closed by [plan-008-local-sqlite](../plans/archive/plan-008-local-sqlite/plan.md).
- Versioned migrations, app-data path resolution, autosave & recovery, BYOK keyring storage, Tauri sidecar packaging — closed by [plan-017-v1-trust-foundation](../plans/plan-017-v1-trust-foundation/plan.md) (complete 2026-04-30).
- Arc → Act → Chapter → Scene navigable workspace UI — closed by [plan-013-workspace-hierarchy-flow](../plans/plan-013-workspace-hierarchy-flow/plan.md) (complete v2.0.0, 2026-04-28).
- V1 sellable product experience (export quality, editor writing-first refactor, hub trust cards, settings trust center, AI V1 scope, onboarding, worldbuilding audit, design-system freeze, doc tracks, CI/release, licensing, QA + beta DoD) — closed by [plan-018-v1-product-experience](../plans/plan-018-v1-product-experience/plan.md) (2026-05-06).
- Quick fixes & Nova identity (Nova prompt, OpenRouter key persistence, hub word-count accuracy) — closed by [plan-020-fixes-and-nova-identity](../plans/plan-020-fixes-and-nova-identity/plan.md) (2026-05-06).
- Settings IA (categorized PillNav, typed `/api/db/preferences`) — closed by [plan-022-settings-ia](../plans/plan-022-settings-ia/plan.md) (2026-05-06).
- Editor redesign + right-panel Nova copilot (chat + RAG + agentic stubs) — closed by [plan-023-editor-redesign-and-nova-copilot](../plans/plan-023-editor-redesign-and-nova-copilot/plan.md) (2026-05-04).
- Visual consistency refactor across route families — closed by [plan-016-visual-consistency](../plans/archive/plan-016-visual-consistency/plan.md) (closed 2026-04-28; remaining scope absorbed into plan-018).
- Documentation refresh of dev-docs and novellum-docs — closed by [plan-014-documentation-refresh](../plans/archive/plan-014-documentation-refresh/plan.md) (2026-04-20). Re-baselined 2026-05-07.
- Cinematic media gallery refactor — closed by [plan-015-cinematic-media](../plans/archive/plan-015-cinematic-media/plan-015-cinematic-media.md) (2026-04-21).
- 4 shipped AI agents: Continuity, Edit, Rewrite, Style — see [03-ai/agents-map.md](../03-ai/agents-map.md).
- Portable `.novellum.zip` backup/restore round-trip — closed by [plan-006-portability-backup-and-restore](../plans/archive/plan-006-portability-backup-and-restore/plan.md).
- Local Ollama provider as a second AI backend (provider, launcher, settings panel, API route resolution) — landed 2026-05-10. Toggle exposure in Settings → Defaults is finished by [plan-024-v1-final-mile](../plans/plan-024-v1-final-mile/plan.md) stage-003.
- Light theme tokens with `color-scheme` parity, parchment palette under `:root[data-theme='light']` — landed 2026-05-10. Visual regression matrix re-baseline is owned by plan-024 stage-004.
- Global keyboard shortcut bus (`SHORTCUT_EVENT` + `installGlobalShortcuts`) wired to the editor for `save-scene` and `view-in-reader` — landed 2026-05-10. Keymap registration and Settings → Shortcuts surface are finished by plan-024 stage-003.
- Sidebar collapse moved to a shared `sidebar.svelte` store; Home button gains a `?home=1` redirect bypass — landed 2026-05-10.
- Migration precheck tolerates a missing Dexie store or unreachable SQLite endpoint without throwing — landed 2026-05-10.

## In flight

| Plan | Status | Goal |
| --- | --- | --- |
| [plan-024-v1-final-mile](../plans/plan-024-v1-final-mile/plan.md) | in-progress | DoD verification, release engineering, Ollama/shortcut UX finish, light-theme regression sweep (complete, superseded by plan-026), AI-surface ship-or-cut decision (complete, superseded by plan-025), docs re-baseline. 6 stages. |
| [plan-021-reader-pagination](../plans/plan-021-reader-pagination/plan.md) | draft | Reader empty state, page margins/typography, pagination engine. 4 stages. |
| [plan-019-naming-consistency](../plans/plan-019-naming-consistency/plan.md) | draft | Codebase-wide naming alignment between routes, modules, components, and dev-docs. 6 stages. |

`plan-024` is the V1 tag blocker; `plan-021` and `plan-019` are listed as dependencies of plan-024 and must close before the V1 tag is cut. None blocks a desktop rebuild.

## Next era — full AI integration

Following the V1 trust + product foundation, the next development era expands AI integration end-to-end, including **API-based image generation models** alongside the existing text agents. New plans will be drafted under [../plans/](../plans/) and tracked here.

## Planned but not started

These are committed in code structure (task types declared in [src/lib/ai/types.ts](../../src/lib/ai/types.ts)) but lack shipped agent implementations:

- **BrainstormAgent** — generative ideation for loglines, character concepts, scene hooks.
- **OutlineAgent** — structured outline generation/refinement.
- **DraftAgent** — narrative prose generation.
- **SummaryAgent** — chapter recap generation.

See [03-ai/agents-map.md](../03-ai/agents-map.md) for the gap analysis.

### Deferred to V1.1 (cut from V1 DoD 2026-05-26)

- **Manuscript export UI** — wire `exportProject()` to a real UI surface
  with profile selector, format toggle, chapter-subset selection, and
  metadata pre-fill. Drivers exist in
  `src/modules/export/services/{markdown,docx,epub}-driver.ts`; no UI
  invokes them today. The V1 "Export" button performs JSON portability
  export only. EPUB driver XSS escape (htmlEscape) is verified.
- **Large-novel performance harness** — build a deterministic
  `tests/fixtures/large-novel/` (100 chapters / 500 scenes / 100k words)
  and add timing tests for hub load and export throughput. CW2
  (5,000-word typing smoke) remains as a manual V1 pre-tag gate; PF3
  (scene indexes) and PF4 (lazy ExportModal) are already verified.
- **Multi-project restore UI** — backup/restore round-trip works at the
  SQLite layer for single projects via `/api/restore/project`. A UI for
  multi-project restore from a single `.novellum.zip` is documented in
  plan-024 stage-001/phase-007 evidence and deferred.

## Out of scope

- Cloud sync / multi-device.
- Multi-author collaboration.
- Mobile clients.
- Custom-trained models (Novellum is BYOK-only and provider-agnostic via OpenRouter).
