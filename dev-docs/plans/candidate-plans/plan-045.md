---
title: Image Generation Integration
slug: plan-045-image-generation
version: 0.1.0
status: candidate
owner: Planner Agent
created: 2026-06-04
last_updated: 2026-06-04
target_completion: TBD
dependencies:
  - plan-042-quality-gates-closure
quality_gates:
  - lint
  - typecheck
  - tests
  - check:tokens
---

## Objective

Extend the AI pipeline to support **API-based image generation models** alongside the
existing text agents. Authors can generate reference imagery for characters, locations,
scenes, and cover concepts directly within Novellum. Generated images surface in the
cinematic media gallery already built in plan-015.

This is the explicit "next era" priority named in the roadmap under
"Full AI Integration."

## Scope

**In scope:**

- Image generation provider route via `OpenRouterClient` (or a dedicated provider
  adapter if OpenRouter does not support the target model).
- `ImageAgent` service: prompt construction from worldbuilding entity context
  (character description, realm description, scene atmosphere tags).
- Image generation trigger on worldbuilding entity pages (character, realm, landmark)
  and on scene detail view.
- Result display in the existing cinematic media gallery; generated images stored
  under `~/.novellum/media/` and referenced by entity ID in the DB.
- Settings UI additions: image model selector, image resolution/quality preference,
  per-generation cost estimate.
- Accept/reject review gate — generated images are proposals; the author accepts
  them to attach to an entity.

**Out of scope:**

- Inpainting / image editing.
- Custom model fine-tuning.
- Cover design workflow (separate plan if warranted).
- Video or animated media.

## Stages

| #   | Stage                                                        | Est. Duration |
| --- | ------------------------------------------------------------ | ------------- |
| 001 | Provider adapter, model routing, and credential wiring       | 1.5d          |
| 002 | `ImageAgent` prompt construction from entity context         | 1d            |
| 003 | Generation trigger UI on entity and scene pages              | 1d            |
| 004 | Media storage, gallery integration, and entity attachment    | 1.5d          |
| 005 | Settings UI (model selector, resolution, cost estimate)      | 0.5d          |
| 006 | Tests, docs sync, quality gate closure                       | 0.5d          |

## Quality Gates

- [ ] `pnpm check` — zero errors
- [ ] `pnpm lint` — zero errors
- [ ] `pnpm lint:css` — zero errors
- [ ] `pnpm test` — all tests pass, new agent/provider tests included
- [ ] `pnpm check:tokens` — zero violations
- [ ] Manual QA: generate character image → review → accept → appears in gallery and on entity page

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| ---- | ---------- | ---------- |
| OpenRouter does not expose a reliable image generation endpoint | medium | Fall back to a direct provider adapter (Stability AI, Replicate, or DALL·E 3 via OpenAI-compatible route) |
| Image storage grows unbounded on disk | low | Per-project media quota warning; prune on explicit author action |
| NSFW output from unconstrained prompts | medium | Inject a safety constraint into every image prompt; expose a content-policy setting |

## Notes

The cinematic media gallery (`plan-015`) and the entity-level worldbuilding pages are
the primary display surfaces. No new shell or route is needed — this plan wires image
generation into existing surfaces. The `ModelRouter` in `src/lib/ai/` will need a new
`image` task type alongside the existing text task types.
