---
title: AI Config & Constants Extraction
slug: part-001-ai-config-constants
part_number: 1
status: review
owner: AI
assigned_to: AI
phase: phase-004-ai-extraction
started_at: 2025-07-17
completed_at: 2025-07-17
estimated_duration: 0.5d
---

## Objective

> Extract inline model configuration, task-type constraints, and prompt template fragments from scattered AI files into `src/lib/ai/constants.ts`.

## Scope

**In scope:**

- Model configuration objects (temperature, max_tokens, top_p per task type)
- Task-type constraint strings (currently inline in prompt builders)
- Default output format schemas for each agent
- API endpoint constants

**Out of scope:**

- Prompt template restructuring (only extract constants, not redesign prompts)
- Context engine logic changes

## Implementation Steps

1. Audit `src/lib/ai/` for inline constants: `grep -rn "temperature\|max_tokens\|model:" src/lib/ai/`
2. Create `src/lib/ai/constants.ts` with model configs, task constraints, output schemas
3. Update consumer files to import from `constants.ts`
4. Ensure `src/lib/ai/index.ts` barrel exports the new constants

## Files

**Create:**

- `src/lib/ai/constants.ts`

**Update:**

- AI files that use inline model configs
- `src/lib/ai/index.ts` — add constants export

## Acceptance Criteria

- [ ] All model configurations in one file
- [ ] All task-type constraints in one file
- [ ] Zero inline config objects in AI agent files
- [ ] `pnpm check` — 0 errors
- [ ] AI test suite passes: `pnpm run test -- tests/ai/`
