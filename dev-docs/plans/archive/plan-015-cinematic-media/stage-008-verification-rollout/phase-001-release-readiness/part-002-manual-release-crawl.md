---
title: Manual Release Crawl
slug: part-002-manual-release-crawl
part_number: 2
status: draft
owner: Reviewer
assigned_to: Reviewer
phase: phase-001-release-readiness
estimated_duration: 1d
---

# Part-002: Manual Release Crawl

## Objective

Manually verify every visible route and state against the production UI acceptance contract.

## Scope

In scope: route crawl, viewport QA, keyboard QA, reduced-motion QA, screen reader label spot-checks, image fallback/rendering QA.

Out of scope: automated test authoring.

## Implementation Steps

1. Crawl every route in `audit/route-inventory.md`.
2. Review mobile, tablet, desktop, and wide-desktop layouts.
3. Navigate with keyboard only through shell, rails, posters, tabs, editor controls, modals, drawers, and destructive confirmations.
4. Enable reduced-motion and confirm nonessential animation is disabled or simplified.
5. Spot-check accessible names for landmarks, cards, progress indicators, dialogs, drawers, and command surfaces.
6. Confirm uploaded images, fallback images, asset previews, and poster placeholders render nonblank and readable.
7. Record findings and screenshots.

## Files

Create:

- `dev-docs/plans/plan-015-cinematic-media/evidence/manual-route-crawl-2026-04-21.md`
- `dev-docs/plans/plan-015-cinematic-media/evidence/responsive-review-2026-04-21.md`
- `dev-docs/plans/plan-015-cinematic-media/evidence/accessibility-review-2026-04-21.md`
- `dev-docs/plans/plan-015-cinematic-media/evidence/image-rendering-review-2026-04-21.md`

## Acceptance Criteria

- [ ] No route has text overlap, clipped primary actions, unreadable overlays, or horizontal overflow.
- [ ] No keyboard trap or hidden focus state is found.
- [ ] Reduced-motion mode remains comprehensible.
- [ ] Uploaded and fallback imagery render correctly.

## Edge Cases

- Verify both empty and populated data states; release readiness cannot rely only on the seeded "happy path."
