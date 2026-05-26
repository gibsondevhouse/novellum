---
title: Build Prompt Library
slug: part-001-build-prompt-library
part_number: 1
status: complete
owner: AI Agent
assigned_to: AI Agent
phase: phase-002-prompt-library-and-templates
started_at: 2026-05-26T10:10:00Z
completed_at: 2026-05-26T12:00:00Z
estimated_duration: 2d
---

## Objective

Create a stage-keyed prompt library with deterministic section layout and template-table override support.

## Scope

**In scope:**

- Prompt library modules for worldbuild and author stage families.
- Template lookup strategy using existing `templates` records.
- Prompt-builder integration and test coverage.

**Out of scope:**

- UI for template editing beyond existing settings surfaces.
- Model/provider selection changes.

## Implementation Steps

1. Create typed prompt-library definitions and seed scaffolds.
2. Integrate template overrides by stage key and fallback to bundled scaffolds.
3. Add tests that assert required prompt sections and override precedence.

## Files

**Create:**

- `src/lib/ai/pipeline/prompt-library.ts`
- `src/lib/ai/pipeline/prompt-library-seeds.ts`
- `tests/ai/pipeline/prompt-library.test.ts`

**Update:**

- `src/lib/ai/prompt-builder.ts`
- `src/routes/api/db/templates/+server.ts`
- `src/routes/api/db/templates/[id]/+server.ts`
- `src/modules/settings/services/template-repository.ts`
- `src/modules/settings/index.ts`

## Acceptance Criteria

- [ ] Each stage has a scaffold enforcing ROLE/TASK/CONTEXT/CONSTRAINTS/OUTPUT sections.
- [ ] Template overrides resolve by project and stage type, with deterministic fallback.
- [ ] Prompt builder composes stage prompts without breaking existing non-stage tasks.
- [ ] Tests cover scaffold completeness and override precedence.

## Edge Cases

- Missing or malformed template content must fail closed to bundled defaults.
- Oversized context payloads must retain contract sections after truncation.

## Notes

`templates` is an existing table and should be leveraged before introducing new persistence.
