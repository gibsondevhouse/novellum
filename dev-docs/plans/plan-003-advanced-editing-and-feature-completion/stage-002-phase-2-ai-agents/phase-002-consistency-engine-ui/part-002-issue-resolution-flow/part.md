---
title: Issue Resolution Flow
slug: part-002-issue-resolution-flow
part_number: 2
status: complete
owner: Frontend Agent
phase: phase-002-consistency-engine-ui
estimated_duration: 1d
---

## Objective

Add issue resolution actions to the Consistency Engine UI: clicking an issue navigates to the relevant scene (if `sceneId` is set), and from the issue detail view the user can mark an issue as `resolved` or `dismissed`. New ContinuityAgent runs append issues rather than overwriting.

## Context

- `src/modules/consistency/` — consistency module (from part-001)
- `src/modules/consistency/services/consistency-repository.ts` — `updateStatus(id, status)` method needed
- SvelteKit `goto()` for scene navigation

## Target Files

| File                                                         | Action                                                     |
| ------------------------------------------------------------ | ---------------------------------------------------------- |
| `src/modules/consistency/components/IssueRow.svelte`         | Update — add navigation link + resolution buttons          |
| `src/modules/consistency/services/consistency-repository.ts` | Update — add `updateStatus()` method                       |
| `src/modules/consistency/stores/consistency-store.ts`        | Update — add `resolveIssue()` and `dismissIssue()` actions |

## Resolution Actions

| Button          | New Status  | Condition                          |
| --------------- | ----------- | ---------------------------------- |
| "Mark Resolved" | `resolved`  | Issue is `open`                    |
| "Dismiss"       | `dismissed` | Issue is `open`                    |
| "Reopen"        | `open`      | Issue is `resolved` or `dismissed` |

## Append vs. Replace

When ContinuityAgent runs again on the same scope:

- **Do not delete** existing issues for that scope
- Insert new issues that are not already recorded (de-duplicate by `description + sceneId`)
- Previously dismissed/resolved issues are **not** re-opened by a new run

## Acceptance Criteria

- [ ] Clicking an issue row with `sceneId` set navigates to `/projects/[id]/editor/[sceneId]` and scrolls panel to keep issue focused
- [ ] "Mark Resolved" and "Dismiss" buttons present on open issues; status change persists to Dexie
- [ ] "Reopen" button present on resolved/dismissed issues
- [ ] Sidebar count badge decrements when issues are resolved/dismissed
- [ ] Re-running ContinuityAgent appends new issues; does not overwrite or reopen dismissed issues
- [ ] `pnpm run check` exits clean

## Out of Scope

- Suggested auto-fix for issues — Path 4
