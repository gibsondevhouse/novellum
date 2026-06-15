---
title: Tests, Quality & Docs
slug: part-001-tests-quality
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-001-tests-docs
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Write tests for all new brainstorm agent code, update documentation, run all quality gates,
and verify the complete brainstorm pipeline is production-ready.

## Scope

**In scope:**

- Unit tests for `BrainstormAgent` prompt builder and parser (>90% coverage)
- Component tests for brainstorm UI components
- Integration tests for Nova task flow (if applicable)
- Documentation updates in `AGENTS.md` and `dev-docs/03-ai/agents-map.md`
- Full quality gate run: `pnpm check`, `pnpm lint`, `pnpm lint:css`, `pnpm test`, `pnpm check:tokens`
- Manual QA verification: complete brainstorm → worldbuild flow

**Out of scope:**

- New feature development (only testing existing features)
- Refactoring (save for future plans)

## Implementation Steps

1. Add/expand tests in `tests/ai/brainstorm-agent.test.ts` (if not already done)
2. Add component tests in `tests/components/nova/brainstorm/`
3. Update `AGENTS.md` with brainstorm agent description
4. Update `dev-docs/03-ai/agents-map.md` with brainstorm details
5. Run `pnpm check` — verify zero errors
6. Run `pnpm lint` — verify zero errors
7. Run `pnpm lint:css` — verify zero errors
8. Run `pnpm test` — verify all tests pass, capture coverage >90%
9. Run `pnpm check:tokens` — verify zero violations
10. Manual QA: complete end-to-end flow
11. Document all results in `impl.log.md`

## Files

**Update:**

- `AGENTS.md` — add brainstorm agent to runtime agent roster
- `dev-docs/03-ai/agents-map.md` — document agent purpose and context

**Create or expand:**

- `tests/ai/brainstorm-agent.test.ts`
- Component tests as needed

## Acceptance Criteria

- [ ] Brainstorm agent test coverage >90%
- [ ] Component tests passing
- [ ] `pnpm check` — zero errors
- [ ] `pnpm lint` — zero errors
- [ ] `pnpm lint:css` — zero errors
- [ ] `pnpm test` — all tests pass
- [ ] `pnpm check:tokens` — zero violations
- [ ] Documentation updated in AGENTS.md and dev-docs
- [ ] Manual QA: complete flow verified
- [ ] All results documented in evidence/

## Edge Cases

- Test coverage for error cases (malformed output, network errors)
- Component accessibility tests (focus, ARIA)
- Integration test for staging store persistence within session

## Notes

This is the final gating stage. All quality metrics must pass before the plan is marked complete.
Document every result so that future reviewers can verify the work.
