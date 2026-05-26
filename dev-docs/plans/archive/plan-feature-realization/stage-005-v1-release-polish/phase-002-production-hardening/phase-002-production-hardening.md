---
title: Production Hardening
phase_number: 2
status: draft
owner: engineering
parts:
  - part-001-final-qa-scrub
estimated_duration: 2 days
acceptance_criteria_count: 3
edge_cases_count: 1
---

# Phase 002: Production Hardening

## Strategy
Execute final polish tasks, fix high-priority bugs, and validate all export drivers (PDF, ePub, docx).

## Acceptance Criteria
1. All linting, typing, and tests pass.
2. End-to-end project export (Markdown, ePub, Docx) is verified.
3. App performance is stable with 50+ scenes.

## Edge Cases
- Large manuscript exports timing out or hitting memory limits.
