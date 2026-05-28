# Disposition Map and Execution Handoff

> Generated: 2026-05-27
> Inputs: deferred-commitment-matrix-2026-05-27.md, repo-reality-audit-2026-05-27.md

---

## Disposition Decisions

| # | Deferred Item | Disposition | Rationale |
|---|--------------|-------------|-----------|
| 1 | plan-019 naming consistency (full) | **execute** (reduced scope) | Route/module directory alignment shipped organically, but top-level route/module mismatches, component-level naming, and docs alignment remain unverified. Execute a narrowed audit-and-fix pass rather than the original 6-stage plan. |
| 2 | plan-021 reader pagination (full) | **retire** | All 4 stages are fully shipped: empty state, page margins/typography, pagination engine (reader-pages.ts), page navigation UI. Tests and visual baselines confirm. No remaining work. |
| 3 | plan-024 stage-002 release engineering | **execute** | No code signing, notarization, or brand icons exist. Release infrastructure is genuine remaining work for a shippable desktop product. |
| 4 | plan-024 stage-003 Ollama & shortcuts | **retire** | Provider toggle shipped in Settings → AI with persistence. Shortcuts registered with bindings and wired through global handler to EditorShell. Tests exist. Minor gap (view-in-reader settings visibility) is cosmetic, not functional. |
| 5 | plan-024 stage-006 docs rebaseline | **execute** (reduced scope) | roadmap.md (last verified 2026-05-10) and AGENTS.md (last verified 2026-05-13) are stale. agents-map.md is current. User-facing docs exist but content currency unverified. Execute a targeted doc roll-forward, not a full rewrite. |

---

## Execution Handoff Slices

### Slice A: plan-019 narrowed naming pass (stage-002 of plan-029)

| Order | Work Item | Owner | Gate |
|-------|-----------|-------|------|
| A.1 | Audit top-level route/module alignment: `books/` vs `reader/`, `stories/`, `nova/`, `images/`, `styles/` | Planner Agent | Name map artifact |
| A.2 | Decide: rename routes to match modules, or accept current state with documented rationale | User (decision gate) | Decision recorded |
| A.3 | If renames needed: execute route renames with boundary pattern updates | Code Agent | lint, check, tests, boundaries pass |
| A.4 | Component-level name audit in affected modules | Code Agent | Audit artifact |
| A.5 | Documentation alignment pass for any renames performed | Reviewer Agent | docs_sync |

### Slice B: plan-024 stage-002 release engineering (stage-003 of plan-029)

| Order | Work Item | Owner | Gate |
|-------|-----------|-------|------|
| B.1 | Acquire Apple Developer ID certificate and store as repo secret | User (external) | Secret configured |
| B.2 | Acquire Windows Authenticode certificate and store as repo secret | User (external) | Secret configured |
| B.3 | Wire codesigning + notarization into release.yml | Code Agent | release.yml updated |
| B.4 | Replace placeholder Tauri icons with brand artwork | Design/User | Icons in src-tauri/icons/ |
| B.5 | Run smoke test on packaged DMG + MSI | Code Agent | task-06 evidence |
| B.6 | Verify BYOK keyring round-trip in packaged shell | Code Agent | task-07 evidence |
| B.7 | CI tag dry-run on throwaway v1.0.0-rc.0 | Code Agent | task-10 evidence |

### Slice C: plan-024 stage-006 docs rebaseline (stage-003 of plan-029)

| Order | Work Item | Owner | Gate |
|-------|-----------|-------|------|
| C.1 | Roll `roadmap.md` "Last verified" to 2026-05-27; update Shipped/In-flight sections | Reviewer Agent | Date + content updated |
| C.2 | Roll `AGENTS.md` "Last verified" to 2026-05-27; reconcile Runtime Agents table with agents-map.md | Reviewer Agent | Date + table aligned |
| C.3 | Review `beta-program.md` for factual drift; update if needed | Reviewer Agent | Content verified |
| C.4 | Spot-check `novellum-docs/user/` pages for accuracy against shipped features | Reviewer Agent | Content verified |

---

## Retirement Evidence Summary

### plan-021 (retire)

Evidence: `repo-reality-audit-2026-05-27.md` — reader-pages.ts ships chunkSceneContent/chunkByCharBudget/chunkByPageBox; BookReaderView.svelte has empty state; 3 reader test files; visual baselines for empty state and reader handoff.

### plan-024 stage-003 (retire)

Evidence: `repo-reality-audit-2026-05-27.md` — Settings → AI page with openrouter/ollama/lm-studio tabs; OllamaPanel activeProvider persistence; save-scene (Meta+S) and view-in-reader registered in keymap-registry; global-handler dispatches SHORTCUT_EVENT; EditorShell listens; tests for ollama-launcher, ollama-provider, keymap-registry.

---

## Impact on plan-029 Stages 002-004

| plan-029 Stage | Disposition Outcome | Execution Scope |
|---------------|--------------------|--------------------|
| stage-002 (plan-019 + plan-021 delivery) | plan-021 retired; plan-019 narrowed to audit + targeted renames | ~2d reduced from 6d estimate |
| stage-003 (plan-024 deferred closeout) | stage-003 retired; stage-002 + stage-006 execute at reduced scope | ~3d (B.1-B.2 blocked on external cert acquisition) |
| stage-004 (verification + governance) | Scope unchanged — tracker reconciliation still required | ~2d |
