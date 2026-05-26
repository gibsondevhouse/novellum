---
title: Navigation Consistency
slug: phase-003-navigation
phase_number: 3
status: complete
owner: frontend
stage: stage-003-ux-consistency
parts:
  - part-001-breadcrumbs
  - part-002-navigation-consistency
estimated_duration: 1d
---

## Goal

Give users reliable wayfinding on deep routes via breadcrumb navigation, and eliminate full-page reload bugs caused by `window.location.href` usages.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | ---- | ------ | ----------- | ------------- |
| 001 | [Breadcrumb Navigation](./part-001-breadcrumbs.md) | `draft` | frontend | 0.5d |
| 002 | [Navigation API Consistency](./part-002-navigation-consistency.md) | `draft` | frontend | 0.5d |

## Acceptance Criteria

- [ ] Editor and character detail routes display full breadcrumb path (Library → Project → Section → Item).
- [ ] `grep -rn "window.location" src/` returns zero matches.
- [ ] All parts reach `complete` status.

## Notes

Breadcrumb data must come from `$page.params` and reactive project store — no additional server loader calls.
