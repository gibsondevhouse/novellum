---
title: Dependencies and Setup
slug: phase-001-dependencies-and-setup
phase_number: 1
status: draft
owner: Backend Agent
stage: stage-001-sqlite-foundation
parts:
  - part-001-adapter-and-packages
estimated_duration: 0.5d
---

## Goal

> Install required packages, switch the SvelteKit adapter to `adapter-node`, and verify the dev server remains operational.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Adapter and Package Installation](part-001-adapter-and-packages/part.md) | `draft` | Backend Agent | 0.5d |

## Acceptance Criteria

- [ ] `@sveltejs/adapter-node` installed and configured in `svelte.config.js`
- [ ] `better-sqlite3` installed as a production dependency
- [ ] `@types/better-sqlite3` installed as a devDependency
- [ ] `pnpm dev` starts without errors
- [ ] `pnpm build` completes (adapter-node output)
- [ ] All existing lint and typecheck gates pass

## Notes

> The `adapter-auto` package can stay listed in devDependencies — removing it is unnecessary.
