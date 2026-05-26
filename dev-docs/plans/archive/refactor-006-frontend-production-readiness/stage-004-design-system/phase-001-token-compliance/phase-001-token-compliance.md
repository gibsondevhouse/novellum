---
title: Token Compliance
slug: phase-001-token-compliance
phase_number: 1
status: complete
owner: frontend
stage: stage-004-design-system
parts:
  - part-001-token-purge
estimated_duration: 0.5d
---

## Goal

Replace every hardcoded pixel, rem, and hex colour value in the component layer with the correct design token, making the UI fully themeable and system-consistent.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | ---- | ------ | ----------- | ------------- |
| 001 | [Hardcoded Value Purge](./part-001-token-purge.md) | `draft` | frontend | 0.5d |

## Acceptance Criteria

- [ ] No `.svelte` file in `src/` contains a raw `rem`, `px`, or `#[hex]` value in its `<style>` block outside of the token definitions file.
- [ ] All parts reach `complete` status.

## Notes

Use `src/styles/tokens.css` as the source of truth for which tokens exist. If a needed value does not have a token, use the closest matching token — do not create new tokens without a design decision.
