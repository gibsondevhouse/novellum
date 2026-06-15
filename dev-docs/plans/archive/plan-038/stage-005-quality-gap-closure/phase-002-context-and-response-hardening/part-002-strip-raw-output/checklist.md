---
part: part-002-strip-raw-output
last_updated: ~
---

# Implementation Checklist

## Pre-Implementation

- [ ] Current response shape confirmed in generate route
- [ ] Client-side destructuring usage checked in `author-draft-api.ts`

## Implementation

- [ ] `rawOutput` removed from production response (or dev-gated)
- [ ] Client wrapper type updated if needed

## Post-Implementation

- [ ] Lint passes
- [ ] Type-check passes
- [ ] Tests pass
- [ ] `impl.log.md` updated
- [ ] Part `status` updated to `review`
