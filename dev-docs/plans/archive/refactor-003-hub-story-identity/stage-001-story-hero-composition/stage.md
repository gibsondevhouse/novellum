---
title: Story Hero Composition
slug: stage-001-story-hero-composition
stage_number: 1
status: complete
owner: Frontend Agent
plan: refactor-003-hub-story-identity
phases:
  - phase-001-hero-components
  - phase-002-hero-integration
estimated_duration: 2d
risk_level: medium
---

## Goal

Deliver all hero components and wire them into the Hub page. The Hub top section changes from a story-block (cover + logline) in a layout grid to a full `ProjectHubHero` composition presenting cover, title, genre tags, logline, and synopsis as a unified story identity surface. Edit behaviour is moved into a controlled modal — the hero is presentation-first.

## Phases

| #   | Phase                                                              | Status  | Est. Duration |
| --- | ------------------------------------------------------------------ | ------- | ------------- |
| 001 | [Hero Components](phase-001-hero-components/phase.md)              | `draft` | 1d            |
| 002 | [Hero Integration](phase-002-hero-integration/phase.md)            | `draft` | 1d            |

## Entry Criteria

- `plan-002-service-layer-and-state-hardening` is complete
- `src/modules/project/` has a working `EditProjectForm.svelte` triggered via `openEdit` context
- `dev-docs/design-system.md` tokens are available in global CSS

## Exit Criteria

- All phases complete
- `ProjectHubHero` renders in the Hub with cover, title, genre tags, logline, and full synopsis
- Edit form is only accessible via modal, not as an always-open hero form
- `pnpm run lint` and `pnpm run check` pass clean
- Hero screenshots on desktop and mobile in evidence

## Notes

- The existing `.story-block` CSS in `+page.svelte` will be removed in this stage's integration phase
- `openEdit` must be forwarded from the hub page down through the hero tree via props — no new context keys
