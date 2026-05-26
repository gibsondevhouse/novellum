---
title: Planning Surface Shell and Card Parity
slug: stage-004-planning-surface-shell-and-card-parity
stage_number: 4
status: complete
owner: Frontend Agent
plan: refactor-002-story-planning-workspace
phases:
  - phase-001-shared-planning-surface-extraction
estimated_duration: 4d
risk_level: medium
---

## Goal

Standardize chapter and scene planning panels on a shared shell so layout behavior is consistent and reusable across planning contexts.

## Phases

- 001: [Shared Planning Surface Extraction](phase-001-shared-planning-surface-extraction/phase.md) (`draft`, 4d)

## Entry Criteria

- Navigator selection model is stable from Stage 003
- Existing chapter and scene panel differences are documented

## Exit Criteria

- Shared planning shell component is in use for chapter and scene panels
- Internal sticky header and internal scroll behavior are consistent
- Overview and outline cards have parity in spacing and width behavior

## Notes

This stage resolves the core UI inconsistency that currently blocks feature expansion.
