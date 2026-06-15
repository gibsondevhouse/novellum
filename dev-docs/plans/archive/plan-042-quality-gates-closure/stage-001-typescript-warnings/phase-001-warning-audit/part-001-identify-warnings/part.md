---
title: Identify Warnings
slug: part-001-identify-warnings
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-001-warning-audit
started_at: ~
completed_at: ~
estimated_duration: 0.25d
---

## Objective

Run `pnpm check` and capture the full output of all TypeScript warnings. Categorize each by
severity and root cause to create a prioritized fix queue.

## Scope

**In scope:**

- Run `pnpm check` and record all warning output
- Classify warnings by category (strict mode, library bindings, generic bounds, etc.)
- Document the file and line for each warning
- Identify any warnings that may require structural refactoring

**Out of scope:**

- Fixing warnings (that's part-002)
- Changes to TypeScript configuration
- Suppression via `// @ts-ignore` comments

## Implementation Steps

1. Open terminal and run `pnpm check` with verbose output
2. Copy and save the full warning output to `evidence/`
3. Parse the warnings and create a categorized list with:
   - Warning code / category
   - File and line number
   - Description of the issue
   - Suspected fix complexity (trivial / moderate / complex)
4. Sort by complexity to optimize fix order
5. Document any dependencies between warnings

## Files

**Create:**

- None in source tree (evidence-only task)

**Update:**

- None

## Acceptance Criteria

- [ ] `pnpm check` output captured and saved to `evidence/`
- [ ] Warnings categorized and sorted by complexity
- [ ] List includes at least 11 warnings matching pre-existing backlog
- [ ] Each warning has a suspected root cause documented

## Edge Cases

- Some warnings may repeat across multiple files (pattern-based fixes)
- Warnings may be interdependent (fix one, others resolve)
- Library binding issues may require version upgrades or workarounds

## Notes

Keep the warning list in `evidence/` so it can be used as the checklist during part-002.
This is an audit-only step; no code changes should be made here.
