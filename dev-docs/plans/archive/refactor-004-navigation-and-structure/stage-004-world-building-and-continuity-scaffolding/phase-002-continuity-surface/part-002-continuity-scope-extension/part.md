---
title: Continuity Scope Extension
slug: part-002-continuity-scope-extension
part_number: 2
status: draft
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-002-continuity-surface
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Extend the Continuity page with stub sections for Writing Styles and Prompts. These sections are read-only placeholders communicating the planned scope of the Continuity surface. They are visually distinct from the active Issues section — locked, reduced opacity, "coming soon" treatment.

## Context

- The Continuity page at `src/routes/projects/[id]/continuity/+page.svelte` currently renders `ConsistencyPanel`
- The full Continuity scope is: Issues (active) + Writing Styles (future) + Prompts (future)
- Writing Styles purpose: define tone, voice, and POV constraints for the project
- Prompts purpose: system prompt and negative prompt for AI operations
- Stub treatment: visually de-emphasised cards with surface name, one-line description, and "Coming soon" indicator

## Scope

**In scope:**

- Add a section navigation or tab bar to the Continuity page (Issues | Writing Styles | Prompts)
- Writing Styles section: stub card with "Coming soon" treatment
- Prompts section: two stub cards — "System Prompt" and "Negative Prompt" — both locked

**Out of scope:**

- Implementing Writing Styles or Prompts functionality
- Storing or loading styles/prompts from Dexie

## Implementation Steps

1. In `src/routes/projects/[id]/continuity/+page.svelte`, add a simple tab or section bar:
   - Tab items: "Issues" (active), "Writing Styles" (locked indicator), "Prompts" (locked indicator)
   - Clicking Issues: renders `ConsistencyPanel`
   - Clicking Writing Styles or Prompts: shows the corresponding stub section
   - Use `$state` for active tab: `let activeTab = $state<'issues' | 'styles' | 'prompts'>('issues')`

2. Writing Styles stub section (rendered when `activeTab === 'styles'`):

   ```html
   <div class="continuity-stub">
     <h3 class="continuity-stub__title">Writing Styles</h3>
     <p class="continuity-stub__description">
       Define tone, voice, and POV constraints for this project.
       Styles will be available to writing agents and consistency checks.
     </p>
     <span class="continuity-stub__badge">Coming soon</span>
   </div>
   ```

3. Prompts stub section (rendered when `activeTab === 'prompts'`):
   - Two cards side by side (or stacked on mobile):
     - "System Prompt" — "Project-level context injected into all AI operations"
     - "Negative Prompt" — "Content and style restrictions for all AI generations"
   - Both cards: locked, reduced opacity, "Coming soon" badge

4. CSS for stub elements:
   - `.continuity-stub`: `padding: var(--space-8); background: var(--color-surface-raised); border-radius: var(--radius-md); opacity: 0.6`
   - `.continuity-stub__badge`: a small pill badge using `--color-surface-overlay` background

5. Verify Continuity page stays ≤150 lines; extract stub section into `ContinuityStub.svelte` if needed

## Files

**Update:**

- `src/routes/projects/[id]/continuity/+page.svelte` — add tab bar and stub sections

**Create (if needed to stay under 150 lines):**

- `src/modules/continuity/components/ContinuityStub.svelte`

## Acceptance Criteria

- [ ] Continuity page has a tab/section bar: Issues | Writing Styles | Prompts
- [ ] Issues tab renders existing `ConsistencyPanel`
- [ ] Writing Styles tab renders a locked stub card with "Coming soon" treatment
- [ ] Prompts tab renders two locked stub cards: "System Prompt" and "Negative Prompt"
- [ ] Stub sections are visually distinct from the active Issues section (opacity, badge)
- [ ] Continuity page stays ≤150 lines (extract component if needed)
- [ ] `pnpm run check` exits clean

## Edge Cases

- If user returns to Continuity after navigating away, `activeTab` resets to 'issues' — this is acceptable; no persistence needed
- Stub cards must have no event handlers — they are purely decorative

## Notes

- The "Coming soon" badge should use a neutral style — not an error badge or a primary action badge; keep it understated
- This extension establishes the Continuity surface's full scope in the UI without committing to any implementation timeline
