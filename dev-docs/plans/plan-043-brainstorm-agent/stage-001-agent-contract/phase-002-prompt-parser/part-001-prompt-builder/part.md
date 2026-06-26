---
title: Prompt Builder
slug: part-001-prompt-builder
part_number: 1
status: review
owner: Planner Agent
assigned_to: Codex
phase: phase-002-prompt-parser
started_at: 2026-06-25
completed_at: 2026-06-25
estimated_duration: 0.3d
---

## Objective

Implement the `BrainstormAgent` prompt builder that constructs a well-structured request
following the ROLE → TASK → CONTEXT → CONSTRAINTS → OUTPUT format.

## Scope

**In scope:**

- Create `brainstorm-agent.ts` in `src/lib/ai/`
- Implement `buildBrainstormPrompt()` function
- Follow the existing pattern from other agents (e.g., `EditAgent`, `StyleAgent`)
- Craft prompt to output strict JSON matching the `BrainstormSession` schema
- Use structured output if provider supports it

**Out of scope:**

- Model routing (handled by `ModelRouter`)
- Response parsing (that's part-002)

## Implementation Steps

1. Review existing agent implementations (EditAgent, StyleAgent) for patterns
2. Create `src/lib/ai/brainstorm-agent.ts` with prompt builder
3. Define the ROLE (BrainstormAgent identity)
4. Define the TASK (generate creative seeds from idea)
5. Structure CONTEXT to include:
   - Seed idea from author
   - Current worldbuilding context (if available)
   - Genre/tone constraints
6. Define CONSTRAINTS (what not to generate)
7. Define OUTPUT FORMAT (strict JSON schema reference)
8. Wire into the `PromptBuilder` service
9. Test prompt generation with sample inputs

## Files

**Create:**

- `src/lib/ai/brainstorm-agent.ts`

**Update:**

- `src/lib/ai/index.ts` — export the new agent
- Task resolver or similar if needed for routing

## Acceptance Criteria

- [ ] `brainstorm-agent.ts` created with prompt builder
- [ ] Prompt follows ROLE → TASK → CONTEXT → CONSTRAINTS → OUTPUT pattern
- [ ] Prompt is wired to the task resolver
- [ ] Sample prompt output can be generated and validated
- [ ] `pnpm check` passes with zero errors
- [ ] `pnpm lint` passes with zero errors

## Edge Cases

- Missing worldbuilding context (should still generate seeds)
- Very long seed ideas (truncate or summarize)
- Special characters in input (escape properly)

## Notes

Keep the prompt concise but clear. The model should understand exactly what kind of
seeds to generate. Use examples in the prompt if that improves output quality.
