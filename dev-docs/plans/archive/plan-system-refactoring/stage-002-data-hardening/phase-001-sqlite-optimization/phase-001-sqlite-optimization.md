---
title: SQLite Serialization & Typing
phase_number: '001'
status: draft
owner: backend-agent
parts:
  - part-001-serialization
estimated_duration: 3 days
acceptance_criteria_count: 2
edge_cases_count: 1
---

# Phase 001: SQLite Serialization & Typing

## Strategy
Implement Zod schemas for all 16 entity tables to validate data at the `/api/db/*` boundary. Ensure JSON arrays in SQLite are automatically parsed on fetch and stringified on insert at the API level, rather than ad-hoc mappings.

## Acceptance Criteria
1. All API responses are validated against Zod schemas.
2. Malformed JSON arrays in DB return clear validation errors instead of silent application crashes.

## Edge Cases
- Legacy data from early SQLite migrations may have invalid JSON strings in text columns. Schema parsing must handle fallback/defaults.
