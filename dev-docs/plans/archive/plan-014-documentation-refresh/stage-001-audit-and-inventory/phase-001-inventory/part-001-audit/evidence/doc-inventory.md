# Documentation Inventory — plan-014

**Audit date:** 2026-04-20
**Auditor:** Reviewer Agent (planner-orchestrated)

## Methodology

For each in-scope file:

1. Read the file.
2. Cross-check high-risk claims against ground truth (source under `src/`, `eslint.config.js`, `AGENTS.md`, `package.json`, shipped routes).
3. Assign a verdict: `current`, `partially-stale`, or `stale`.

## Inventory

### dev-docs (root)

- `project-context.md` — **partially-stale**. Mentions `/workspace` subroute; shipped tree is `arcs/bible/consistency/continuity/editor/hub/outline/world-building`. No `src/modules/workspace/`.
- `project-overview.md` — **partially-stale**. Drop legacy "formerly …" wording; current names are canonical.
- `architecture.md` — **current**. Already documents SQLite + Dexie portability. Schema reference should bump v8 → v10.
- `data-model.md` — **partially-stale**. Missing `assets`, `milestones`, `arcs`, `acts`, `story_frames`, `scene_snapshots`, `consistency_issues`, `export_settings`.
- `repo-structure.md` — **partially-stale**. Needs refresh of `src/modules/` and `src/routes/` trees.
- `tech-stack-docs.md` — **current**. Refresh pins against `package.json`.
- `frontend-context.md` — **partially-stale**. Must reflect Svelte 5 Runes and `IndividualsWorkspaceShell`.
- `backend-context.md` — **partially-stale**. Must reflect `/api/db/*` REST layout and `src/lib/server/`.
- `routing-context.md` — **partially-stale**. Must drop `/workspace`; add `arcs/`, `outline/`, `continuity/`, `world-building/`.
- `design-system.md` — **current**. Verify tokens against `src/styles/` and `app.css`.
- `modular-boundaries.md` — **partially-stale**. Align with `eslint.config.js` (note: `module-workspace` declared but no source dir).
- `dev-workflow.md` — **current**. Verify scripts and list `test:visual`.
- `roadmap.md` — **partially-stale**. Add plan-012 (complete), plan-013 (active), plan-014 (active).

### dev-docs/modules

- `story-bible.md` — **partially-stale**. Must document `IndividualsWorkspaceShell` across Personae / Atlas / Archive / Threads / Chronicles.
- `editor.md` — **partially-stale**. Confirm TipTap 3 + extensions from `package.json`.
- `editing-layer.md` — **current**. Spot-check against `src/modules/editor/`.
- `outliner.md` — **partially-stale**. Must cover Arc → Act → Chapter → Scene hierarchy.
- `consistency-engine.md` — **partially-stale**. Differentiate `src/modules/consistency/` vs `src/modules/continuity/`.
- `export.md` — **current**. Verify DOCX / ePub / JSON paths.
- `project-hub.md` — **current**. Verify against `src/modules/project/`.

### dev-docs — AI system

- `ai-pipeline.md` — **partially-stale**. Must match shipped `src/lib/ai/*.ts` files.
- `context-engine.md` — **partially-stale**. Must match `context-engine.ts`, `context-builder.ts`, `serializer.ts`.
- `prompt-system.md` — **partially-stale**. Must match `prompt-builder.ts` and document the 5-section contract.
- `agents-map.md` — **stale**. Shipped: `continuity-agent`, `edit-agent`, `rewrite-agent`, `style-agent`. `AGENTS.md` roster has 4 aspirational agents not yet implemented.

### dev-docs — support

- `context-docs/frontend.md` — **partially-stale**.
- `audits/component-inventory.md` — **partially-stale**.
- `checklists/ui-review.md` — **current**.
- `portability-recovery-runbook.md` — **current**. Verify `.novellum.zip` flow against Dexie schema v10.
- `feature-spec-template.md` — **current**.

### novellum-docs

- `docs/setup-guide.md` — **partially-stale**. Verify Node / PNPM versions and scripts.
- `docs/user-manual.md` — **partially-stale**. Use current module naming (Personae / Atlas / Archive / Threads / Chronicles).

## Summary

- **Current:** 7 files
- **Partially stale:** 21 files
- **Stale:** 1 file (`agents-map.md`)
- **Total:** 29 files

## Highest-Priority Discrepancies

1. **Agent roster drift.** `AGENTS.md` documents 8 runtime agents; shipped code implements 4.
2. **Module-name ghost.** `eslint.config.js` declares `module-workspace` boundary but no `src/modules/workspace/` directory exists.
3. **Dexie schema version drift.** Docs reference v8; actual shipped schema is v11 (adds `acts.arcId`, `milestones`, `assets` through v9–v11).
4. **Route tree drift.** `/projects/[id]` subroutes do not include `/workspace`.

## Source-of-Truth Snapshot

- `src/modules/` — `ai`, `assets`, `bible`, `consistency`, `continuity`, `editor`, `export`, `outliner`, `project`, `settings`, `world-building`.
- `src/lib/ai/` agent files — `continuity-agent.ts`, `edit-agent.ts`, `rewrite-agent.ts`, `style-agent.ts`.
- `src/lib/ai/` pipeline — `context-engine.ts`, `context-builder.ts`, `prompt-builder.ts`, `model-router.ts`, `openrouter.ts`, `orchestrator.ts`, `task-resolver.ts`, `serializer.ts`, `style-presets.ts`, `markdown.ts`.
- `src/lib/db/schema.ts` — current version **v11** (v9 adds `assets`, v10 adds `milestones`, v11 adds `acts.arcId` index).
- `src/routes/api/db/` resources — acts, arcs, beats, chapters, character_relationships, characters, chat_instructions, consistency_issues, export_settings, locations, lore_entries, milestones, plot_threads, projects, scene_snapshots, scenes, stages, story_frames, system_prompts, templates, timeline_events, writing_styles.
