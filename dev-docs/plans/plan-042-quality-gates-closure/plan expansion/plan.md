# Plan 042 — Quality Gates Closure

**Objective:** Eliminate the accumulated quality-gate waivers (primarily from Plans 030–040) and establish a clean baseline for ongoing enforcement.

**Scope:** Tight. No new features. No roadmap expansion. Only quality-gate debt that blocks “zero waivers”.

**Quality Gates (non-negotiable):**
- `pnpm check` — **zero errors and zero warnings** (full output captured to evidence)
- `pnpm lint` — pass with zero errors and no new warnings
- `pnpm lint:css` — pass with zero errors; no new `stylelint-disable` additions
- `pnpm test` — pass
- `pnpm check:tokens` — pass with zero violations
- `pnpm test:visual`
  - pass OR drift logged with explicit rationale, owner, and follow-up
  - snapshot updates allowed only with accepted rationale

## Stage 001 — TypeScript check warnings closure

**Objective:** Convert waived TypeScript/Svelte warning debt into an enforceable zero-warning baseline.

## Stage 002 — CSS lint + visual baseline stabilization

**Objective:** Remove known stylelint debt and prevent “drift acceptance” from washing regressions into snapshots.

## Stage 003 — Route-safe active project detection

**Objective:** Ensure active project state is derived only from `/projects/<id>` routes (and nested project routes), not from non-project routes that happen to use `[id]`.

## Stage 004 — Dexie boundary audit and enforcement proof

**Objective:** Prove Dexie cannot leak into live app paths beyond the strict boundary allowlist. Inventory, prove, and document.

---

## Definition of Done

Plan 042 is complete only when:
- All stages complete with evidence artifacts and append-only impl logs.
- `pnpm check` passes with zero errors and zero warnings.
- `pnpm lint`, `pnpm lint:css`, `pnpm test`, and `pnpm check:tokens` pass.
- Visual suite has no unexplained drift; any drift is recorded in the ledger and accepted.
- No waiver language remains in Plan 042 closeout.

Last updated: 2026-06-04
