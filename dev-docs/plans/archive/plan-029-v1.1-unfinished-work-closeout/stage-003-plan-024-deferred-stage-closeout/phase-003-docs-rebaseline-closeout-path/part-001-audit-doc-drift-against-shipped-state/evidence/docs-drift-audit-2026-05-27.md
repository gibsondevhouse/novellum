# Documentation Drift Audit

> Generated: 2026-05-27

## Doc Currency

| Document | Last Verified | Drift Severity | Notes |
|----------|--------------|---------------|-------|
| `dev-docs/01-project/roadmap.md` | 2026-05-10 | **medium** | Pre-dates plans 025, 026, 027, 028 completions. Shipped/In-flight sections likely stale. |
| `dev-docs/03-ai/agents-map.md` | 2026-05-26 | **none** | Updated with plan-028 UI shipped. Current. |
| `AGENTS.md` | 2026-05-13 | **low** | Pre-dates plans 026, 027, 028 but agent roster may be unaffected. |
| `dev-docs/release/beta-program.md` | not found | **unknown** | File may not exist or may be at different path |
| `dev-docs/04-modules/*.md` | — | **none** | Module names align with current directory structure |
| `dev-docs/02-architecture/routing.md` | — | **low** | Routing structure stable since plan-023 |
| `ACTIVE-PLAN.md` | 2026-05-27 | **none** | Updated with plan-029 activation |
| `MASTER-PLAN.md` | 2026-05-27 | **none** | Updated with plan-029 activation |

## Drift Findings

### Finding 1: roadmap.md "Shipped" section (medium severity)
- Section header: "Shipped (as of 2026-05-10)"
- Missing from shipped: plan-025 (functional-after-build), plan-026 (design system), plan-027 (fiction pipeline), plan-028 (hierarchical pipeline UI)
- "Deferred to V1.1" section (line 52) lists plan-019, plan-021, plan-024 stages — these are now being retired/closed by plan-029
- Update target: roll date to 2026-05-27, add shipped plans, update deferred section

### Finding 2: AGENTS.md verified date (low severity)
- Current: "Last verified: 2026-05-13"
- Plans 026-028 shipped since then but primarily affected UI, not agent architecture
- agents-map.md (2026-05-26) is the canonical agent reference
- Update target: roll date forward, verify Runtime Agents table matches agents-map.md

### Finding 3: novellum-docs/user/ coverage
- 11 pages exist: ai-setup, backup-restore, editor, export, faq, install, keyboard-shortcuts, local-first, nova, quick-start, worldbuilding
- plan-024 stage-006 required: Export profiles, AI privacy, Backup & restore, Nova panel
- Export → `export.md` exists
- AI privacy → `ai-setup.md` exists (may need "AI privacy" content check)
- Backup & restore → `backup-restore.md` exists
- Nova panel → `nova.md` exists
- **Status: covered** — required pages exist; content currency not verified

## Summary

| Category | Total Findings | None | Low | Medium | High |
|----------|---------------|------|-----|--------|------|
| Date drift | 2 | — | 1 | 1 | — |
| Content drift | 1 | — | — | 1 | — |
| Missing docs | 0 | — | — | — | — |
