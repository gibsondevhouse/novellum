---
title: Guardrails
slug: phase-001-guardrails
phase_number: 1
status: draft
owner: Backend Agent
stage: stage-004-hardening-polish
parts:
  - part-001-enforce-schema-validation
  - part-002-add-provenance-tracking
  - part-003-audit-server-side-access
estimated_duration: 2d
---

## Goal

Enforce schema validation at all generation points, add provenance tracking to every artifact, and audit the generation pathway to confirm all OpenRouter access is server-side with no client-side key exposure.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Enforce Schema Validation](part-001-enforce-schema-validation/part.md) | `draft` | — | 0.75d |
| 002 | [Add Provenance Tracking](part-002-add-provenance-tracking/part.md) | `draft` | — | 0.75d |
| 003 | [Audit Server-Side Access](part-003-audit-server-side-access/part.md) | `draft` | — | 0.5d |

## Acceptance Criteria

- [ ] All parts reach `complete` status
- [ ] Every generation response is validated against its domain schema before being stored
- [ ] Schema validation failures produce `failed` state with a logged parse error (not a silent discard)
- [ ] Every artifact envelope includes: `domain`, `model`, `createdAt`, `sourceContextSummary`, `generationId`
- [ ] Provenance is visible to the user in the review card
- [ ] No OpenRouter API key is accessible in client-side code or bundle
- [ ] All generation requests route through a server-side endpoint
- [ ] A security review confirms OWASP Top 10 compliance for the generation pathway
- [ ] `pnpm check`, `pnpm lint`, `pnpm test` pass

## Notes

**Non-negotiables from the plan-basis:**

- No direct client-side OpenRouter key access
- No silent canon writes
- Schema-validated generated output
- Section-specific prompts must use scoped context
- Generated output must show provenance: section, model, created time, source context

These should be verified mechanically, not just by code review. Consider adding a CI check that fails if an OpenRouter key reference appears in the client bundle.
