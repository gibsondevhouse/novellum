---
part: part-002-eslint-boundaries-setup
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] `part-001-app-level-stores` is `complete`
- [ ] Read `dev-docs/modular-boundaries.md` §Import Boundary Matrix — memorize which imports are allowed vs forbidden
- [ ] Read current `eslint.config.js` — understand existing ESLint configuration structure before modifying

## Post-Implementation

- [ ] `eslint-plugin-boundaries` in `package.json` devDependencies
- [ ] `eslint.config.js` contains boundaries element definitions matching `modular-boundaries.md`
- [ ] `eslint.config.js` contains boundaries allow/disallow rules
- [ ] `pnpm run lint` exits clean with zero errors
- [ ] Deliberate violation test performed and documented in `evidence/boundary-violation-test-YYYY-MM-DD.md`
- [ ] Test import reverted — codebase is clean after test
