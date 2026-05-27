# Docs Rebaseline Disposition and Update Order

> Generated: 2026-05-27
> Input: docs-drift-audit-2026-05-27.md

## Disposition

**plan-024 stage-006 (Documentation Re-baseline): EXECUTE (reduced scope)**

Only 2 documents need updates. agents-map.md, module docs, tracker docs, and user-facing docs are current.

## Update Order

| Order | Document | Action | Gate |
|-------|----------|--------|------|
| 1 | `dev-docs/01-project/roadmap.md` | Roll "Last verified" to 2026-05-27. Add plans 025-028 to Shipped. Update "Deferred to V1.1" to reflect plan-029 closeout outcomes (019/021 retired, 024 stages retired/deferred). | Date + content updated |
| 2 | `AGENTS.md` | Roll "Last verified" to 2026-05-27. Verify Runtime Agents table matches `agents-map.md`. | Date + table verified |

## Not Required

| Document | Rationale |
|----------|-----------|
| `dev-docs/03-ai/agents-map.md` | Already current (2026-05-26) |
| `dev-docs/04-modules/*.md` | Names match current module dirs |
| `ACTIVE-PLAN.md` | Updated 2026-05-27 with plan-029 |
| `MASTER-PLAN.md` | Updated 2026-05-27 with plan-029 |
| `novellum-docs/user/*.md` | All required pages exist |

## Validation

After updates:
1. Verify no broken internal links in updated docs
2. Verify dates match current state
3. Cross-check "Shipped" sections against MASTER-PLAN completed list
