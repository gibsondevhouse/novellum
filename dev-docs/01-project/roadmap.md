# Roadmap

> Last verified: 2026-06-16
>
> **Versioning convention.** Internal milestones (V1, V1.1, V2) are **development
> checkpoints**, not public releases. Novellum has not yet cut a public release. When
> that happens, it will be tagged `desktop-v1.0.0` in git and called out explicitly as
> a public release.

This roadmap reflects what is **shipped to the working internal build**, what is **in
flight** (active plans in [../plans/](../plans/)), and what is explicitly **planned but
not started**. It does not promise dates.

## Shipped to internal build (as of 2026-06-16)

### Foundation

- Server-side SQLite via `better-sqlite3` and the `/api/db/*` REST surface — closed by [plan-008-local-sqlite](../plans/archive/plan-008-local-sqlite/plan.md).
- Versioned migrations, app-data path resolution, autosave & recovery, BYOK keyring storage, Tauri sidecar packaging — closed by [plan-017-v1-trust-foundation](../plans/archive/plan-017-v1-trust-foundation/plan.md) (closed 2026-04-30).
- Arc → Act → Chapter → Scene navigable workspace UI — closed by [plan-013-workspace-hierarchy-flow](../plans/archive/plan-013-workspace-hierarchy-flow/plan.md) (closed 2026-04-28).
- Portable `.novellum.zip` backup/restore round-trip — closed by [plan-006-portability-backup-and-restore](../plans/archive/plan-006-portability-backup-and-restore/plan.md).

### Internal V1 milestones

- Internal V1 product experience (export quality, editor writing-first refactor, hub trust cards, settings trust center, AI scope, onboarding, worldbuilding audit, design-system freeze, doc tracks, CI infra, licensing scaffolding, QA + beta DoD) — closed by [plan-018-v1-product-experience](../plans/archive/plan-018-v1-product-experience/plan.md) (closed 2026-05-06).
- Internal V1 Definition-of-Done — 47/47 internal DoD items satisfied. Closed by [plan-024-v1-final-mile](../plans/archive/plan-024-v1-final-mile/plan.md) (closed 2026-05-26).
- Internal V1 functional-after-build hardening (app-data path, 4 unimplemented agents cut, smoke harness extended) — closed by [plan-025-functional-after-build](../plans/archive/plan-025-functional-after-build/plan.md) (closed 2026-05-13).

### Internal V1.1 milestones

- Internal V1.1 fiction pipeline (pipeline foundation, Vibe-Worldbuild, Vibe-Author) — closed by [plan-027-v1.1-scoping](../plans/archive/plan-027-v1.1-scoping/plan.md) (closed 2026-05-27).
- Hierarchical pipeline UI (outline traversal, worldbuild run flow, checkpoint review console) — closed by [plan-028-v1.1-hierarchical-pipeline-ui](../plans/archive/plan-028/plan.md) (closed 2026-05-26).
- Internal V1.1 unfinished-work closeout — closed by [plan-029-v1.1-unfinished-work-closeout](../plans/archive/plan-029-v1.1-unfinished-work-closeout/plan.md) (closed 2026-05-27).

### UI and design system (internal v2)

- Visual consistency refactor across route families — closed by [plan-016-visual-consistency](../plans/archive/plan-016-visual-consistency/plan.md) (closed 2026-04-28).
- Internal UI v2 design system (author-first visual truth) — closed by [plan-026-ui-v2-design-system](../plans/archive/plan-026-ui-v2-design-system/plan.md) (closed 2026-05-26). The "v2" label is an internal design-iteration tag, not a public version.
- Cinematic media gallery refactor — closed by [plan-015-cinematic-media](../plans/archive/plan-015-cinematic-media/plan-015-cinematic-media.md) (closed 2026-04-21).
- Editor redesign + right-panel Nova copilot (chat + RAG + agentic stubs) — closed by [plan-023-editor-redesign-and-nova-copilot](../plans/archive/plan-023-editor-redesign-and-nova-copilot/plan.md) (closed 2026-05-04).

### Settings, accounts, and trust

- Quick fixes & Nova identity (Nova prompt, OpenRouter key persistence, hub word-count accuracy) — closed by [plan-020-fixes-and-nova-identity](../plans/archive/plan-020-fixes-and-nova-identity/plan.md) (closed 2026-05-06).
- Settings IA (categorized PillNav, typed `/api/db/preferences`) — closed by [plan-022-settings-ia](../plans/archive/plan-022-settings-ia/plan.md) (closed 2026-05-06).

### AI agents and Nova

- 4 internal AI agents wired into Nova: Continuity, Edit, Rewrite, Style — see [03-ai/agents-map.md](../03-ai/agents-map.md).
- Local Ollama provider as a second AI backend (provider, launcher, settings panel, API route resolution, Settings → AI toggle with persistence) — shipped via plan-029 closeout (originally plan-024 stage-003).
- Nova production refactor (trust repair, 4 stages) — closed by [plan-030-nova-production-refactor](../plans/archive/plan-030-nova-production-refactor/plan.md) (closed 2026-05-28).
- Nova VS Code Copilot parity (compact sidepanel, Ask/Write/Agent modes, real attachments, bounded agentic tool loop) — closed by [plan-031-nova-vscode-copilot-parity](../plans/archive/plan-031-nova-vscode-copilot-parity/plan.md) (closed 2026-05-28).
- Worldbuilding generation engine + help disclosure (one-click AI entity generation across 7 entity kinds, review modal, AppShell fix) — closed by [plan-032-worldbuilding-generation-engine](../plans/archive/plan-032-worldbuilding-generation-engine/plan.md) (closed 2026-05-29).
- World Building workflow refactor (foundation, UI integration, generation pipeline, hardening) — closed by [plan-034](../plans/archive/plan-034/plan.md) (closed 2026-05-30).
- World-building draft JSON encoding fix — closed by [plan-035-fix-json-double-encoding](../plans/archive/plan-035-fix-json-double-encoding/plan.md) (closed 2026-05-30).
- Context-priority generation (typed target/avoid hints, expanded character draft fields, faction/lineage extension) — closed by [plan-036-context-priority-generation](../plans/archive/plan-036-context-priority-generation/plan.md) (closed 2026-05-30).
- Agentic worldbuild scan + review-gated proposal flow (scan contract, proposal schema, pending notification UI, atomic accept/reject) — closed by [plan-037-agentic-worldbuild-scan](../plans/archive/plan-037-agentic-worldbuild-scan/plan.md) (closed 2026-05-31; scan execution wired 2026-06-01).
- Novel Engine v1 — Draft From Outline (guided checkpointed pipeline: outline → scene drafts → reviewable artifacts → explicit accept writes to `scenes.content`) — closed by [plan-038-novel-engine-v1](../plans/plan-038/plan.md) (closed 2026-06-01).
- Manuscript export UI (subset selector, delivery helper, metadata/formatting controls) — closed by [plan-039-manuscript-export-ui](../plans/plan-039-manuscript-export-ui/plan.md) (closed 2026-06-03).
- Outline generation (worldbuilding-to-outline review-gated proposal flow, atomic materialization) — closed by [plan-040-outline-generation](../plans/plan-040-outline-generation/plan.md) (closed 2026-06-04).
- Quality Gates Closure (restored clean check/lint/test baselines) — closed by [plan-042-quality-gates-closure](../plans/plan-042-quality-gates-closure/plan.md) (closed 2026-06-04).
- Nova Active Context Routing (resolved from routes instead of query params) — closed by [plan-044-nova-active-context-routing](../plans/plan-044-nova-active-context-routing/plan.md) (closed 2026-06-11).
- Agent Tool Mutation Boundary (strict separation between AI reading and mutation) — closed by [plan-045-agent-tool-mutation-boundary](../plans/plan-045-agent-tool-mutation-boundary/plan.md) (closed 2026-06-12).
- Outline Pipeline Consolidation (retired legacy apply paths; checkpoints only) — closed by [plan-043-outline-pipeline-consolidation](../plans/plan-043-outline-pipeline-consolidation/plan.md) (closed 2026-06-12).
- Pipeline Checkpoint Contract Reconciliation (aligned schemas/routes across all pipelines) — closed by [plan-046-pipeline-checkpoint-contract-reconciliation](../plans/plan-046-pipeline-checkpoint-contract-reconciliation/plan.md) (closed 2026-06-14).
- Worldbuilding Canon Merge Diff (reviewable canon diff/merge behavior) — closed by [plan-047-worldbuilding-canon-merge-diff](../plans/plan-047-worldbuilding-canon-merge-diff/plan.md) (closed 2026-06-14).
- Agent Runtime Stack Hardening (durable runs, jobs, capabilities, traces) — closed by [plan-049-agent-runtime-stack-hardening](../plans/plan-049-agent-runtime-stack-hardening/plan.md) (closed 2026-06-15).

### Reader, navigation, theming

- Reader empty state + deterministic client-side pagination engine (page-box chunking, prev/next navigation, drop-cap support) — shipped via plans 027/028. Closed by plan-029 closeout (originally plan-021).
- Light theme tokens with `color-scheme` parity, parchment palette under `:root[data-theme='light']` — re-baselined by plan-026 (2026-05-26).
- Global keyboard shortcut bus (`SHORTCUT_EVENT` + `installGlobalShortcuts`) with `save-scene` (Meta+S) and `view-in-reader` default bindings — shipped via plan-029 closeout.
- Sidebar collapse moved to a shared `sidebar.svelte` store; Home button gains a `?home=1` redirect bypass — shipped 2026-05-10.
- Migration precheck tolerates a missing Dexie store or unreachable SQLite endpoint without throwing — shipped 2026-05-10.

### Codebase health

- Codebase naming consistency (route/module/component alignment) — shipped organically via plans 020-028. Closed by plan-029 closeout (originally plan-019).
- Documentation refresh of dev-docs and novellum-docs — closed by [plan-014-documentation-refresh](../plans/archive/plan-014-documentation-refresh/plan.md) (closed 2026-04-20). Re-baselined 2026-05-07. This page re-baselined again 2026-06-16 by Plan-053 implementation review.

## In flight

The following plans are in **review** (implementation complete):

- [plan-051-governed-ai-controller-runtime](../plans/plan-051-governed-ai-controller-runtime/plan.md) — Server-side governed AI controller.
- [plan-048-frontend-experience-coherence](../plans/plan-048-frontend-experience-coherence/plan.md) — Unified navigation, review gates, and visual state.
- [plan-052-pipeline-nova-editor-trust-closure](../plans/plan-052-pipeline-nova-editor-trust-closure/plan.md) — Durable review-gated Nova artifacts and revision acks.
- [plan-053-worldbuilding-outline-review-flow-closure](../plans/plan-053-worldbuilding-outline-review-flow-closure/plan.md) — Persisted worldbuilding proposals and generation status polish.

Release engineering (code signing, notarization, brand icons) remains deferred to a dedicated release plan — it requires external procurement, not software engineering.

## Drafted (skeleton plans)

These plans have a `plan.md` skeleton but stages have not been authored yet. Pick one up to start the next era of work.

- [plan-043-brainstorm-agent](../plans/plan-043-brainstorm-agent/plan.md) — Re-introduce BrainstormAgent with review-gated UI and worldbuild integration.

## Next era — full AI integration

Following the internal V1 trust + product foundation, the next development era expands AI integration end-to-end, including **API-based image generation models** alongside the existing text agents. New plans will be drafted under [../plans/](../plans/) and tracked here.

## Planned but not started

> Cut from internal V1 (2026-05-13, plan-025): `BrainstormAgent`, `OutlineAgent`, `DraftAgent`, `SummaryAgent` were removed from the internal V1 task-resolver surface. Re-introducing any is a new feature plan (see plan-040 for Outline).

### Deferred (not yet scheduled)

- **Release engineering** — Apple Developer ID signing, Windows Authenticode, brand icons, formal smoke/keyring verification, CI tag dry-run. Infrastructure exists (`release.yml`, `desktop-build.yml`); requires external procurement.
- **Large-novel performance harness** — deterministic `tests/fixtures/large-novel/` (100ch / 500sc / 100k words) with timing tests.
- **Multi-project restore UI** — UI for multi-project restore from a single `.novellum.zip`.

## Out of scope

- Cloud sync / multi-device.
- Multi-author collaboration.
- Mobile clients.
- Custom-trained models (Novellum is BYOK-only and provider-agnostic via OpenRouter).
