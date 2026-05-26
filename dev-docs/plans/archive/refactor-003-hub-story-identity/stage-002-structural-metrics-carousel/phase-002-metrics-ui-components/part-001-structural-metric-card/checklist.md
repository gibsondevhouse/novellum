---
part: part-001-structural-metric-card
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] Read `dev-docs/design-system.md` — note `--color-surface-overlay`, `--color-surface-elevated`, `--font-display`, `--text-5xl`, `--text-xs`, `--tracking-widest`, border, radius tokens
- [ ] Check if a `--radius-lg` or similar border-radius token is defined; if not, use `10px`

## Post-Implementation

- [ ] Card renders count in large display font — visually substantial (screenshot single card)
- [ ] "–" renders in same display font when `ready === false`
- [ ] Status line renders below count when `statusLine` prop provided
- [ ] Card is `<a>` when `href` set; verify in browser Elements tab
- [ ] Hover lift visible on hover (background lightens)
- [ ] Focus ring visible when tabbing to card link
- [ ] `StructuralMetricCard` added to `index.ts` exports
- [ ] `pnpm run check` — zero errors
- [ ] `pnpm run lint` — zero errors
- [ ] Component ≤100 lines (`wc -l` output attached)
