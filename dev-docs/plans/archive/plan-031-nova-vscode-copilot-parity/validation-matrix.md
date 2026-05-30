---
plan: plan-031-nova-vscode-copilot-parity
last_updated: 2026-05-28
status: complete
---

# Validation Matrix

| Requirement | Primary Gate | Evidence Location | Status |
| --- | --- | --- | --- |
| Compact sidepanel density | Stage 001 visual baseline evidence | stage-001-compact-sidepanel-shell/**/evidence/ | `complete` |
| Token-driven styling | `pnpm check:tokens` → 0 violations | stage-001-compact-sidepanel-shell/**/evidence/ | `pass` |
| Ask/Write/Agent routing | `tests/nova/mode-routing.test.ts` (11 tests) | stage-002-modes-refactor/**/evidence/ | `pass` |
| Write proposal behavior | Mode routing and pipeline tests | stage-002-modes-refactor/**/evidence/ | `pass` |
| Attachment validation | `tests/nova/attachments.test.ts` (23 tests) | stage-003-attachments/**/evidence/ | `pass` |
| Attachment disclosure | Attachment tests + context disclosure | stage-003-attachments/**/evidence/ | `pass` |
| Agent loop | `tests/nova/agent-loop.test.ts` (17 tests) | stage-004-agentic-tool-loop/phase-006/part-001/evidence/ | `pass` |
| No mutation imports | `tests/nova/agent-source-contracts.test.ts` (17 tests) | stage-004-agentic-tool-loop/phase-006/part-002/evidence/ | `pass` |
| Abort and cap | Agent loop tests (cap = 8, AbortError exit) | stage-004-agentic-tool-loop/phase-006/part-001/evidence/ | `pass` |
| `pnpm check` | 0 errors, 0 warnings (1698 files) | closeout-summary.md | `pass` |
| `pnpm lint` | Clean | closeout-summary.md | `pass` |
| `pnpm lint:css` | Clean | closeout-summary.md | `pass` |
| `pnpm test` | 194 files, 1358 tests, 0 failures | closeout-summary.md | `pass` |
| `pnpm check:tokens` | 326 files, 0 violations | closeout-summary.md | `pass` |
| `pnpm test:visual` | Waived — pre-existing cross-surface drift, same waiver as plan-030 | closeout-summary.md | `waived` |
| Docs sync | nova.md + pipeline.md updated | stage-005-verification-docs-closeout/**/evidence/ | `complete` |

## Waivers

### Visual regression tests

**Condition:** Pre-existing cross-surface snapshot drift unrelated to plan-031 changes.  
**Approved:** Same basis as plan-030 closeout waiver (documented 2026-05-28).  
**Mitigation:** Targeted Nova panel visual specs (`editor-nova-panel*.test.ts`) exist and can be run against a live dev server. No plan-031 stage changes the visual rendering path for the non-Nova surfaces exhibiting drift.

## Waiver Rules

- Critical acceptance criteria cannot be waived while marking the plan complete.
- Any failed source-contract test blocks closeout.
- Any server-side key or provider-SDK violation blocks closeout.
