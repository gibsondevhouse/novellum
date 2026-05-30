---
title: Audit Server Side Access
slug: part-003-audit-server-side-access
part_number: 3
status: draft
owner: Backend Agent
assigned_to: Backend Agent
phase: phase-001-guardrails
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Audit the complete server-side generation request pathway to confirm that OpenRouter API credentials are never exposed to the client bundle and that all proposal endpoints enforce project-scoped authorization.

## Scope

**In scope:**

- Review `src/lib/ai/openrouter.ts` — confirm API key is read from `$env/static/private` (server-only)
- Review `src/lib/ai/credential-service.ts` — confirm no credentials are returned to the client
- Review all worldbuilding generation and proposal endpoints for `locals.user` / `locals.session` authorization checks
- Fix any issues found; document clean audit in `evidence/`

**Out of scope:**

- Adding rate limiting (future work)
- Changing the OpenRouter integration beyond credential hygiene

## Audit Targets

- `src/routes/api/worldbuilding/generate/+server.ts`
- `src/routes/api/worldbuilding/proposals/[proposalId]/accept/+server.ts`
- `src/routes/api/worldbuilding/proposals/[proposalId]/reject/+server.ts`
- `src/lib/ai/openrouter.ts`
- `src/lib/ai/credential-service.ts`

## Implementation Steps

1. Read all five files listed above.
2. For each endpoint: verify `locals.user` or `locals.session` is checked before any DB access.
3. For each endpoint: verify proposal `projectId` is compared against the authenticated user's project access.
4. In `openrouter.ts`: confirm `OPENROUTER_API_KEY` is referenced via `$env/static/private`, not `$env/static/public`.
5. Fix any access control gaps found.
6. Produce `evidence/audit-checklist.md` with pass/fail per file.

## Files

**Create:**

- `evidence/audit-checklist.md`

**Update:**

- Any endpoint with missing auth checks (determined during audit)

## Acceptance Criteria

- [ ] All five files audited and any auth gaps fixed
- [ ] `OPENROUTER_API_KEY` sourced from `$env/static/private` only
- [ ] All proposal endpoints verify the requesting user owns the referenced project
- [ ] `pnpm check` passes
- [ ] `evidence/audit-checklist.md` with pass/fail per file

## Edge Cases

- Preserve review-gated behavior: generation proposals must remain non-canonical until explicit user acceptance.

## Notes

Keep impl.log.md append-only. Move status to review only after post-implementation checklist is complete.
