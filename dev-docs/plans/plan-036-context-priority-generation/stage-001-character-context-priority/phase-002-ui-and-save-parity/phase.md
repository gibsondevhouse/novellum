---
title: UI and Save Parity
slug: phase-002-ui-and-save-parity
phase_number: 2
status: review
owner: Planner Agent
stage: stage-001-character-context-priority
parts:
  - part-001-build-pre-generation-dialog-and-wiring
  - part-002-map-expanded-character-fields-on-save
estimated_duration: 1.25d
---

## Goal

Add pre-generation context controls and ensure Character save mapping persists all expanded generated fields.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Build Pre-Generation Dialog and Wiring](part-001-build-pre-generation-dialog-and-wiring/part.md) | `review` | Architect Agent | 0.75d |
| 002 | [Map Expanded Character Fields on Save](part-002-map-expanded-character-fields-on-save/part.md) | `review` | Backend Agent | 0.5d |

## Acceptance Criteria

- [x] Generate action can open context dialog before request dispatch
- [x] User can classify candidate names as target/avoid/neutral
- [x] Dialog submission triggers generation with typed context payload
- [x] Generated character save path writes advanced fields to `/api/db/characters`

## Notes

UI defaults should remain safe and predictable: neutral behavior when user does not opt into target/avoid selections.
