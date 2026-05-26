---
title: Bible Form Callback Types
slug: part-002-bible-form-callbacks
part_number: 2
status: review
owner: Architect
assigned_to: Architect
phase: phase-002-bible-extraction
started_at: 2025-07-17
completed_at: 2025-07-17
estimated_duration: 0.25d
dependencies:
  - part-001-bible-constants-types
---

## Objective

> Extract repeated form callback type signatures (onSave, onCancel, onDelete patterns) from bible form components into `src/modules/bible/types.ts`.

## Scope

**In scope:**

- `onSave: (data: Partial<Character>) => Promise<void>` and similar signatures repeated across 6 entity forms
- Generic callback interface: `EntityFormCallbacks<T>` with `onSave`, `onCancel`, `onDelete?`

**Out of scope:**

- Changing form component behavior
- Modifying bible-crud store logic

## Implementation Steps

1. Audit form components for callback prop signatures
2. Define `EntityFormCallbacks<T>` in `src/modules/bible/types.ts`
3. Update each bible form to use the shared type for its props

## Files

**Create:** None

**Update:**

- `src/modules/bible/types.ts`
- Bible form components (6 entity forms)

## Acceptance Criteria

- [ ] Callback types defined once in `types.ts`
- [ ] All 6 entity forms use the shared callback type
- [ ] `pnpm check` — 0 errors
