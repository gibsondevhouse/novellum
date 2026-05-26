---
part: part-003-route-family-consistency-remediation
---

# Implementation Log

> Append entries chronologically. Never edit or delete existing entries.
> Format: `## [YYYY-MM-DD HH:MM] Agent: [[Agent Name]]`

---

## [2026-04-14 10:08] Agent: Frontend Agent

**Task:** Route-Family Consistency Remediation — fix all token violations

**Actions:**

- Ran `pnpm run check:tokens` — found 76 violations in 39 files (38 T1, 10 T5, 28 T6)
- Fixed all RULE-T1 violations: replaced `rgba()` values with `color-mix()`, `var(--color-border-*)`, or `var(--color-surface-glass)` as appropriate
- Fixed all RULE-T5 violations: replaced raw box-shadows with `var(--shadow-*)` tokens, `var(--focus-ring)`, or local custom property pattern for structural/inset shadows
- Fixed all RULE-T6 violations: replaced hardcoded durations with `var(--duration-*)` tokens for short durations; used local custom property pattern for long-duration animations (spinners/skeletons) to preserve visual timing
- Fixed `books/[id]` spacing violation: `padding: 5px 10px` → `padding: var(--space-1) var(--space-2)`
- Re-ran `pnpm run check:tokens` — **0 violations**
- Quality gates: `pnpm run lint` ✓, `pnpm run check` ✓, `pnpm run test` ✓ (215/215)

**Files modified:** 40 (39 component/route files + 1 spacing fix)

**Evidence:** `evidence/route-family-remediation-report-2026-04-14.md`
