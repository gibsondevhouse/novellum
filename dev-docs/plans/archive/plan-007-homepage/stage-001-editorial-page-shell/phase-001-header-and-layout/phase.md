---
title: Header and Layout
slug: phase-001-header-and-layout
phase_number: 1
status: draft
owner: Frontend Agent
stage: stage-001-editorial-page-shell
parts:
  - part-001-page-title-and-actions
  - part-002-editorial-column-and-grid
estimated_duration: 1d
---

## Goal

Establish the editorial page header (display-font title, refined button placement) and the constrained column + responsive grid that structures every subsequent element on the page.

## Parts

| #   | Part                                                                            | Status  | Assigned To     | Est. Duration |
| --- | ------------------------------------------------------------------------------- | ------- | --------------- | ------------- |
| 001 | [Page Title and Actions](part-001-page-title-and-actions/part.md)               | `draft` | Frontend Agent  | 0.5d          |
| 002 | [Editorial Column and Grid](part-002-editorial-column-and-grid/part.md)         | `draft` | Frontend Agent  | 0.5d          |

## Acceptance Criteria

- [ ] Page title "Projects" renders in `--font-display` at `--text-5xl`, `--tracking-tight`, `--color-text-primary`
- [ ] A muted sub-caption line sits below the title in `--font-sans`, `--text-sm`, `--color-text-muted`
- [ ] "New Project" and "Import Backup" buttons use design-system button tokens (no hardcoded colours)
- [ ] Page body is constrained to `960px` max-width centred with `--panel-padding` on small viewports
- [ ] Project grid is CSS Grid with `minmax(280px, 1fr)` columns and `--space-5` gap

## Notes

- "Import Backup" becomes a ghost/secondary button variant; "New Project" remains primary.
- Sub-caption copy: `"Your novels, ready when you are."` (can be replaced later by copywriting pass)
