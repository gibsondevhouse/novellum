---
title: Add Generation Draft Validator
slug: part-001-add-generation-draft-validator
part_number: 1
status: review
owner: Planner Agent
assigned_to: Backend Agent
phase: phase-002-draft-validation-hardening
started_at: 2026-05-30
completed_at: 2026-05-30
estimated_duration: 0.75d
---

## Objective

Create and integrate a dedicated validator for generated drafts so each entity-kind payload is checked or normalized before reaching the modal.

## Scope

**In scope:**

- Add validator utility module with per-kind checks.
- Integrate validator in `/api/worldbuilding/generate` after JSON extraction.
- Return consistent route errors when all drafts fail validation.

**Out of scope:**

- Replacing existing worldbuild pipeline Zod parser.
- Deep semantic validation (continuity correctness, lore contradictions).

## Implementation Steps

1. Create validator module with kind-specific checks and safe normalizers.
2. Validate extracted drafts before response serialization.
3. Keep successful drafts capped to requested `count` after validation.
4. Add structured parse/validation error reporting for observability.

## Files

**Create:**

- `src/lib/ai/validators/worldbuilding-draft-validator.ts`

**Update:**

- `src/routes/api/worldbuilding/generate/+server.ts`

## Acceptance Criteria

- [x] Validator module exists and is used by generation route
- [x] Invalid outputs do not leak into review modal as `unknown` shapes
- [x] Route returns clear `parse_failed`/`validation_failed` errors when applicable

## Edge Cases

- Mixed validity arrays should retain valid drafts and drop invalid ones when at least one valid draft remains.

## Notes

Prefer explicit allowlists for field keys to keep model drift from silently introducing unpersisted payload noise.
