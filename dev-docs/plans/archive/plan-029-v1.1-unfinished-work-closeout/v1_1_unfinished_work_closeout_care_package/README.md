# V1.1 Unfinished Work Closeout — Agent Care Package

This package is a repo-ready documentation bundle for the Novellum V1.1 unfinished-work closeout.

It is built from the supplied repo-grounded answers and the uploaded closeout/context files:

- `source-context/plan.md` — canonical closeout umbrella: `plan-029-v1.1-unfinished-work-closeout`
- `source-context/dev-docs-README.md` — current `dev-docs` structure and planning conventions

## Purpose

Reduce agent guesswork, prevent hallucinated APIs, and increase first-pass correctness while closing:

1. `plan-019-naming-consistency`
2. `plan-021-reader-pagination`
3. `plan-024` deferred stages:
   - stage-002 release engineering
   - stage-003 Ollama + shortcuts finish
   - stage-006 docs rebaseline
4. Governance reconciliation for `ACTIVE-PLAN.md` and `MASTER-PLAN.md`

## How to Use

Recommended order:

1. Read `00-source-of-truth.md`.
2. Read the relevant file in `workstreams/`.
3. Copy the matching micro-prompt from `prompts/` into your coding agent.
4. Use `checklists/closeout-quality-gates.md` before marking anything complete.
5. Use `templates/final-closeout-report-template.md` for the final agent report.

## Hard Rules

- Do not invent APIs, file paths, functions, routes, or test helpers.
- Mark unknowns as `needs repo verification`.
- Do not rename `/api/db/*` resource paths.
- Do not introduce backend reader pagination.
- Do not replace the in-house shortcut system.
- Do not expose provider/API keys client-side.
- Use Svelte 5 runes only.
- Keep closeout work constrained to unfinished plan commitments.

## Package Layout

```text
v1_1_unfinished_work_closeout_care_package/
├── README.md
├── MANIFEST.md
├── 00-source-of-truth.md
├── source-context/
│   ├── plan.md
│   └── dev-docs-README.md
├── workstreams/
│   ├── plan-019-naming-consistency.md
│   ├── plan-021-reader-pagination.md
│   ├── plan-024-stage-002-release-engineering.md
│   ├── plan-024-stage-003-ollama-shortcuts.md
│   └── plan-024-stage-006-docs-rebaseline.md
├── prompts/
│   ├── final-closeout-agent-prompt.md
│   ├── plan-019-naming-agent-prompt.md
│   ├── plan-021-reader-pagination-agent-prompt.md
│   ├── plan-024-release-engineering-agent-prompt.md
│   ├── plan-024-ollama-shortcuts-agent-prompt.md
│   └── plan-024-docs-rebaseline-agent-prompt.md
├── checklists/
│   └── closeout-quality-gates.md
├── snippets/
│   └── implementation-snippets.md
└── templates/
    └── final-closeout-report-template.md
```
