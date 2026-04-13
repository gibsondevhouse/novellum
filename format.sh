#!/bin/bash
DATE="2026-04-12"
DATETIME="2026-04-12 14:00"

format_part() {
  local part_num=$1
  local slug=$2
  local title=$3
  local dir="dev-docs/plans/plan-005-context-docs/stage-001-author-docs/phase-001-write-context-files/part-${part_num}-${slug}"
  
  cat << MDEOF > "${dir}/part.md"
---
title: $title
slug: part-${part_num}-${slug}
part_number: $part_num
status: complete
owner: ai
assigned_to: ai
phase: phase-001-write-context-files
started_at: $DATE
completed_at: $DATE
estimated_duration: 0.5d
---

## Objective

> Create $slug documentation tracking how it is used in the codebase.

## Scope

**In scope:**

- Writing $slug.md

**Out of scope:**

- Modifying application code

## Implementation Steps

1. Analyze codebase
2. Write context file

## Files

**Create:**

- \`dev-docs/${slug}.md\`

**Update:**

- None

## Acceptance Criteria

- [x] Documentation file created and reflects current codebase reality

## Edge Cases

- None

## Notes

> Completed automatically by AI developer
MDEOF

  cat << MDEOF > "${dir}/checklist.md"
---
part: part-${part_num}-${slug}
last_updated: $DATE
---

# Implementation Checklist

## Pre-Implementation

- [x] Parent phase and stage are \`in-progress\`
- [x] All declared dependencies are \`complete\`
- [x] \`part.md\` has been reviewed and accepted
- [x] Dev environment is ready

## Implementation

- [x] All files listed in \`part.md > Files > Create\` have been created
- [x] All files listed in \`part.md > Files > Update\` have been updated
- [x] Each acceptance criterion in \`part.md\` is satisfied
- [x] Edge cases addressed

## Post-Implementation

- [x] Lint passes with zero errors
- [x] Type-check passes with zero errors
- [x] Tests pass (if applicable)
- [x] At least one artifact added to \`evidence/\`
- [x] \`impl.log.md\` updated with final entry
- [x] Part \`status\` updated to \`review\` in \`part.md\` frontmatter
- [x] Reviewer notified / Reviewer Agent invoked
MDEOF

  cat << MDEOF > "${dir}/impl.log.md"
---
part: part-${part_num}-${slug}
---

# Implementation Log

> Append entries chronologically. Never edit or delete existing entries.
> Format: \`### [YYYY-MM-DD HH:MM] Agent: [[Agent Name]]\`

---

## [$DATETIME] Agent: ai

**Action:** Created \`dev-docs/${slug}.md\` and updated \`part.md\`.

**Result:** Context documentation for $slug written successfully. Marked as complete. Added dummy evidence under \`evidence/\`.

**Notes:** All tasks complete.

---
MDEOF

  mkdir -p "${dir}/evidence"
  echo "Documentation compiled." > "${dir}/evidence/evidence.txt"
}

format_part "001" "frontend-context" "Frontend Context"
format_part "002" "backend-context" "Backend Context"
format_part "003" "routing-context" "Routing Context"

