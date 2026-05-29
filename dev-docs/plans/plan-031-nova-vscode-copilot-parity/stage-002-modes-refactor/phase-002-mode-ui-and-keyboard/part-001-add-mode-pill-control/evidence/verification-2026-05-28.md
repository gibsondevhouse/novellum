# Add Mode Pill Control — 2026-05-28

## Verification

Mode select shows three options: Ask, Write, Agent.
Accessible label: "Nova mode". `aria-label` retained on the `<select>`.
Mode hint appears below composer for Write and Agent modes only (no vertical expansion for Ask).

Playwright behavioral tests (from Stage 001) still pass: `.nova-mode-select` visible at 280px constrained width.

## Quality Gates

```
pnpm check → 0 errors
pnpm lint → clean
pnpm test → 1310 tests passed
```
