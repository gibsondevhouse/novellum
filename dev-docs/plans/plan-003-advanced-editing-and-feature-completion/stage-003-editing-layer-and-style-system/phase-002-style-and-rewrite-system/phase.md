---
title: Style & Rewrite System
slug: phase-002-style-and-rewrite-system
phase_number: 2
status: complete
owner: AI Agent
stage: stage-003-editing-layer-and-style-system
parts:
  - part-001-style-agent-and-presets
  - part-002-rewrite-agent-and-ui
estimated_duration: 3d
---

## Goal

Implement StyleAgent with configurable style presets and RewriteAgent with a multi-option selection UI. StyleAgent identifies tone and voice deviations relative to a target style; RewriteAgent offers 2–3 alternative versions of selected text.

## Parts

| #   | Part                                                              | Status  |
| --- | ----------------------------------------------------------------- | ------- |
| 001 | [Style Agent & Presets](part-001-style-agent-and-presets/part.md) | `draft` |
| 002 | [Rewrite Agent & UI](part-002-rewrite-agent-and-ui/part.md)       | `draft` |

## Entry Criteria

- phase-001 complete: EditAgent modes working; inline suggestion UI component built and reusable
- Style presets concept agreed: static config file listing preset names + descriptor rules

## Exit Criteria

- `style_check` task type resolves; StyleAgent receives scene text + active style preset and returns `StyleDeviation[]`
- At least 4 built-in style presets: `literary_fiction`, `thriller`, `young_adult`, `romance`
- Style deviations displayed in the inline suggestion overlay (reuse inline suggestion UI from phase-001)
- `rewrite` task type resolves; RewriteAgent returns exactly 3 rewrite options for the selected text range
- Rewrite option UI: modal or side panel showing 3 options with diff highlighting vs. original; user selects one or cancels
- RewriteAgent respects: preserve core meaning, preserve any named entities, stay within scene scope
- Tests cover: style preset serialisation into prompt CONTEXT section; rewrite option count validation
