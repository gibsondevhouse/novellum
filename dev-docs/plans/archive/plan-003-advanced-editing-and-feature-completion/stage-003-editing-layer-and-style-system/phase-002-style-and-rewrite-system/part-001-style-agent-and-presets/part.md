---
title: Style Agent & Presets
slug: part-001-style-agent-and-presets
part_number: 1
status: complete
owner: AI Agent
phase: phase-002-style-and-rewrite-system
estimated_duration: 1.5d
---

## Objective

Implement StyleAgent: add `style_check` to `TaskType`, create a static style preset config file, and wire StyleAgent output (formatted as `StyleDeviation[]`) through the existing inline suggestion overlay from phase-001.

## Context

- `dev-docs/agents-map.md` §StyleAgent
- `src/lib/components/ai-suggestion-overlay/` — reuse from phase-001-part-002
- `src/lib/ai/types.ts` — extend

## Target Files

| File                           | Action                                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------------------ |
| `src/lib/ai/types.ts`          | Update — add `style_check` to `TaskType`; add `StyleDeviation` interface; add `StylePreset` type |
| `src/lib/ai/task-resolver.ts`  | Update — handle `style_check` action                                                             |
| `src/lib/ai/prompt-builder.ts` | Update — add `style_check` prompt template                                                       |
| `src/lib/ai/style-presets.ts`  | Create — static config; 4 built-in presets                                                       |

## Type Definitions

```ts
export interface StylePreset {
	id: string;
	name: string;
	description: string;
	rules: string[]; // injected into CONTEXT section of style_check prompt
}

export interface StyleDeviation {
	spanStart: number;
	spanEnd: number;
	original: string;
	suggestion: string;
	reason: string;
	presetId: string;
}
```

## Built-in Presets (`src/lib/ai/style-presets.ts`)

| id                 | name             | Key rules                                                               |
| ------------------ | ---------------- | ----------------------------------------------------------------------- |
| `literary_fiction` | Literary Fiction | Active voice preferred, avoid adverbs, show-don't-tell                  |
| `thriller`         | Thriller         | Short sentences under tension, active voice always, minimal description |
| `young_adult`      | Young Adult      | Accessible vocabulary, present-tense interiority, emotional clarity     |
| `romance`          | Romance          | Sensory detail, interpersonal tension foregrounded, internal monologue  |

## Action → Task Mapping Addition

| Action string   | taskType      | contextPolicy | outputFormat            |
| --------------- | ------------- | ------------- | ----------------------- |
| `"style_check"` | `style_check` | `scene_only`  | `json_style_deviations` |

## Acceptance Criteria

- [ ] `style_check` in `TaskType`; `StyleDeviation` and `StylePreset` interfaces exported
- [ ] 4 built-in presets defined in `style-presets.ts`; each has `id`, `name`, `description`, `rules[]`
- [ ] `resolveTask('style_check', ctx)` returns correct task
- [ ] Prompt Builder injects active preset rules into CONTEXT section of `style_check` prompt
- [ ] StyleAgent output reuses `AiSuggestionOverlay` (pass `StyleDeviation[]` as `suggestions` prop — compatible since both have `spanStart`, `spanEnd`, `original`, `suggestion`, `reason`)
- [ ] Preset selector dropdown in editor toolbar (shows 4 built-in presets)
- [ ] Vitest: confirm preset rules are serialized into prompt; confirm `StyleDeviation` output parsing
