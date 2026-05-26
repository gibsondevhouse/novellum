---
title: Story Frame and Acts Foundation
slug: stage-002-story-frame-and-acts-foundation
stage_number: 2
status: complete
owner: Frontend Agent
plan: refactor-002-story-planning-workspace
phases:
  - phase-001-story-frame-and-act-domain-foundation
estimated_duration: 4d
risk_level: medium
---

## Goal

Introduce first-class Story Frame and Act planning entities so outline structure can scale beyond chapter-only organization.

## Phases

- 001: [Story Frame and Act Domain Foundation](phase-001-story-frame-and-act-domain-foundation/phase.md) (`draft`, 4d)

## Entry Criteria

- Stage 001 architecture contract is complete
- Data model extension points are confirmed in Dexie schema

## Exit Criteria

- Story Frame data is persisted and editable
- Acts are persisted and chapters can be assigned to acts
- Outline load contract includes story frame and act hierarchy

## Notes

Keep additions backward-compatible with chapter/scene flows during transition.
