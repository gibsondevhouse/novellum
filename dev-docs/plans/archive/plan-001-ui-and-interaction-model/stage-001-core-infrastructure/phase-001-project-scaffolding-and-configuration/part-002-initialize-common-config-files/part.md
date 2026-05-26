---
title: Initialize Common Config Files
slug: part-002-initialize-common-config-files
part_number: 2
status: complete
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-001-project-scaffolding-and-configuration
started_at: 2026-04-12
completed_at: 2026-04-12
estimated_duration: 1.5d
---

## Objective

Install and configure all shared developer tooling — ESLint, Prettier, EditorConfig — and author the root documentation files (`README.md`, `.gitignore`) so the project has a consistent, enforceable code style from the first commit.

## Scope

**In scope:**

- ESLint with `eslint-plugin-svelte` and TypeScript support
- Prettier with `prettier-plugin-svelte`
- `.editorconfig` for editor-agnostic formatting
- `.gitignore` covering SvelteKit, Node, and local env files
- `README.md` with project description, prerequisites, and dev server instructions
- `GEMINI.md` updated with confirmed build/run commands

**Out of scope:**

- Vitest or Playwright configuration (deferred to a testing-focused part)
- CI/CD pipeline configuration

## Implementation Steps

1. Install ESLint dependencies: `pnpm add -D eslint eslint-plugin-svelte @typescript-eslint/eslint-plugin @typescript-eslint/parser`
2. Create `eslint.config.js` extending `eslint-plugin-svelte` recommended and TypeScript strict rules
3. Install Prettier: `pnpm add -D prettier prettier-plugin-svelte`
4. Create `.prettierrc` with `{ "plugins": ["prettier-plugin-svelte"], "singleQuote": true, "useTabs": true, "printWidth": 100 }`
5. Create `.prettierignore` excluding `.svelte-kit/`, `dist/`, `build/`
6. Create `.editorconfig` with indent, charset, and newline rules
7. Author `.gitignore` covering: `node_modules/`, `.svelte-kit/`, `dist/`, `build/`, `.env*`, `*.local`
8. Author `README.md` (see Files section)
9. Add lint and format scripts to `package.json`: `"lint": "eslint ."`, `"format": "prettier --write ."`
10. Run `pnpm run lint` and `pnpm run format` — both must exit clean
11. Update `GEMINI.md` with confirmed commands under "Building and Running"

## Files

**Create:**

- `eslint.config.js`
- `.prettierrc`
- `.prettierignore`
- `.editorconfig`
- `.gitignore`
- `README.md`

**Update:**

- `package.json` — add `lint` and `format` scripts
- `GEMINI.md` — fill in confirmed build/run commands

## Acceptance Criteria

- [ ] `pnpm run lint` exits with zero errors on the initial scaffold
- [ ] `pnpm run format` exits with zero changes (or formats in-place and re-run confirms zero)
- [ ] `.gitignore` excludes all generated and local-env files
- [ ] `README.md` includes: project title, short description, prerequisites (Node ≥ 20, pnpm ≥ 9), and `pnpm run dev` instructions
- [ ] `GEMINI.md` "Building and Running" section reflects the actual commands

## Edge Cases

- ESLint flat config (`eslint.config.js`) requires ESLint v9+; confirm installed version before authoring config
- Prettier and ESLint can conflict on formatting rules — use `eslint-config-prettier` to disable conflicting ESLint formatting rules

## Notes

Prettier tab width: 1 tab (not spaces). Single quotes. Line length 100. These defaults apply for the lifetime of the project unless explicitly revised in a dedicated part.
