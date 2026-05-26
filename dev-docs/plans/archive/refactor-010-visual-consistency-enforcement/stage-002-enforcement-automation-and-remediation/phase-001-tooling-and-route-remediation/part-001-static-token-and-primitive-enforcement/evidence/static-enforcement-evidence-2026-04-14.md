# Static Token Enforcement — Evidence

**Date:** 2026-04-14
**Agent:** Frontend Agent
**Part:** part-001-static-token-and-primitive-enforcement

---

## Deliverable

Created `scripts/check-visual-tokens.mjs` — a zero-dependency Node.js script that statically analyzes `<style>` blocks in `.svelte` files for design token violations.

### Rules Enforced

| Rule | Description | Detection Method |
| --- | --- | --- |
| RULE-T1 | No hardcoded hex colors or raw `rgb()`/`rgba()` | Regex scan of style blocks, excluding `var()` fallbacks and custom property definitions |
| RULE-T5 | No raw `box-shadow` values | Detects `box-shadow` declarations not using `var(--shadow-*)` |
| RULE-T6 | No raw transition/animation durations or easings | Detects hardcoded `ms`/`s` durations and named easing functions |

### Scan Scope

- `src/routes/` (excluding `src/routes/styles/` — design system showcase)
- `src/lib/components/`
- `src/modules/`
- Exception: `src/styles/` (token definitions themselves)

### npm Script

```bash
pnpm run check:tokens
```

---

## Baseline Scan Results

```text
✗ Token enforcement: 76 violation(s) in 39 file(s)
```

### Violation Breakdown by Rule

| Rule | Count | Description |
| --- | --- | --- |
| RULE-T1 | 38 | Hardcoded `rgba()` values in style blocks |
| RULE-T5 | 9 | Raw `box-shadow` values |
| RULE-T6 | 29 | Hardcoded durations and easing functions |

**Note:** Zero hardcoded hex colors were found in route files (confirming Stage 1 audit). All RULE-T1 violations are `rgba()` values, primarily in module components and shared UI primitives. These are legacy patterns that Part 3 (Route Family Consistency Remediation) will address.

### Files with Most Violations

| File | Violations |
| --- | --- |
| `src/modules/project/components/LibraryHeroCard.svelte` | 5 |
| `src/modules/workspace/components/WorkspaceDetailCard.svelte` | 3 |
| `src/lib/components/planning/FocusOverlay.svelte` | 4 |
| `src/lib/components/planning/PlanningSurfaceModeSwitcher.svelte` | 3 |
| `src/modules/export/components/ImportBackupDialog.svelte` | 3 |

---

## Quality Gate Results

| Gate | Command | Result |
| --- | --- | --- |
| Lint | `pnpm run lint` | ✓ 0 errors |
| Type-check | `pnpm run check` | ✓ 0 errors, 0 warnings |
| Tests | `pnpm run test` | ✓ 33 suites, 215 tests passed |

---

## Files Created

- `scripts/check-visual-tokens.mjs` — token enforcement script

## Files Modified

- `package.json` — added `check:tokens` npm script
