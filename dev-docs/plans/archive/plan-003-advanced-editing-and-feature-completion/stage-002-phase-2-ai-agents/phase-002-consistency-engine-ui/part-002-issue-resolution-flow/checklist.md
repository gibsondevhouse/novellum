---
part: part-002-issue-resolution-flow
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] Read `consistency-repository.ts` — confirm or plan `updateStatus()` method signature
- [ ] Read `consistency-store.ts` — plan `resolveIssue()` / `dismissIssue()` / `reopenIssue()` additions
- [ ] Confirm SvelteKit `goto()` import pattern used elsewhere in the project

## Post-Implementation

- [ ] Issue click with `sceneId` navigates to correct editor route
- [ ] Resolve/dismiss/reopen status changes persist and are reflected in panel without page reload
- [ ] Sidebar badge count decrements reactively on resolve/dismiss
- [ ] Re-run append logic: new ContinuityAgent call adds new issues; does not overwrite existing resolved/dismissed issues
- [ ] `pnpm run check` — zero errors
- [ ] `pnpm run lint` — zero errors
