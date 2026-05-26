---
title: API Boundary Zod Schemas
part_number: '001'
status: draft
files_to_create:
  - src/lib/db/zod-schemas.ts
files_to_update:
  - src/lib/api-client.ts
estimated_duration: 3 days
acceptance_criteria_count: 2
edge_cases_count: 1
qa_sign_off: false
---

# Part 001: API Boundary Zod Schemas

## Implementation Checklist
- [x] Create `src/lib/db/zod-schemas.ts`.
- [x] Define Zod schemas for `Beat`, `Character`, `Chapter`, `Location`, `LoreEntry`, `PlotThread`, `Scene`.
- [x] Update `src/lib/api-client.ts` to pipe all `fetch` responses through `Schema.parse()`.
- [x] Add explicit error boundaries for schema validation failures.

## Acceptance Criteria
1. `zod-schemas.ts` covers the 7 core entities.
2. API Client throws a typed `ZodError` when API returns mismatched data structures.

## Edge Cases
- Ensure dates/timestamps are correctly parsed back into `Date` objects or ISO strings consistently across the boundary.
