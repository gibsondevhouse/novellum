---
part: part-001-static-token-and-primitive-enforcement
---

# Implementation Log

> Append entries chronologically. Never edit or delete existing entries.
> Format: `## [YYYY-MM-DD HH:MM] Agent: [[Agent Name]]`

---

## [2026-04-14 09:30] Agent: Frontend Agent

**Action:** Implemented static token enforcement script.

**Files created:**

- `scripts/check-visual-tokens.mjs` — Zero-dependency Node.js script scanning `.svelte` `<style>` blocks for RULE-T1 (hardcoded colors), RULE-T5 (raw box-shadow), and RULE-T6 (raw motion values).

**Files modified:**

- `package.json` — Added `check:tokens` npm script.

**Baseline results:** 76 violations across 39 files (all legacy `rgba()`, raw `box-shadow`, and hardcoded duration/easing values). Zero hardcoded hex colors in route files. Violations are remediation targets for Part 3.

**Quality gates:** All three pass — lint (0 errors), check (0 errors/warnings), test (215/215 passed).
