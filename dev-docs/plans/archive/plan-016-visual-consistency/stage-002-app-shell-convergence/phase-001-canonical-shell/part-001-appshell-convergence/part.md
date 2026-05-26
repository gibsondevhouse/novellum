---
title: AppShell Convergence
slug: part-001-appshell-convergence
part_number: 1
status: complete
owner: Architect Agent
assigned_to: Architect Agent
phase: phase-001-canonical-shell
started_at: 2026-04-24
completed_at: 2026-04-24 07:42 EDT
estimated_duration: 1.5d
---

## Objective

Collapse layout variants into one canonical `AppShell` backing every reachable route.

## Scope

**In scope:**

- Identify the canonical shell component (or promote one if none exists).
- Migrate every route-local shell onto the canonical shell.
- Remove route-local background / wrapper CSS that duplicates shell concerns.
- Preserve archetype-specific content containers (editor prose container, workspace hierarchy↔detail layout) by slotting them inside the shell.

**Out of scope:**

- Sidebar / nav-rail specifics (in `phase-002-nav-and-header`).
- Scroll / padding specifics (in `phase-003-scroll-and-padding`).

## Implementation Steps

1. Confirm the canonical shell implementation from Stage 001 canonical rules.
2. For each route identified in the Stage 001 inventory as having a route-local shell, replace with the canonical shell.
3. Remove orphaned shell CSS from module stylesheets.
4. Run lint, typecheck, tokens, boundaries; capture output in `evidence/`.

## Files

**Create:**

- None (canonical shell already exists per audit; otherwise note the promotion in `impl.log.md`).

**Update:**

- Route files listed in the Stage 001 inventory as having shell drift.
- Module stylesheets that own shell-level CSS.

## Acceptance Criteria

- [x] One `AppShell` backs every reachable route.
- [x] No route-local shell CSS remains outside whitelisted exceptions.
- [x] Lint, typecheck, tokens, boundaries pass.
- [x] Representative visual regression route set captured for at least 5 routes.

## Edge Cases

- Editor route keeps its prose container inside the shell but is not re-chromed.
- Settings and Export keep archetype-specific padding inside the shell slot.

## Notes

- Svelte 5 Runes only. Follow `.github/skills/svelte5-runes/SKILL.md` and `.github/skills/sveltekit-routing/SKILL.md`.
- Whitelisted shell-adjacent containers are documented in `evidence/appshell-route-audit-2026-04-24.md`.
