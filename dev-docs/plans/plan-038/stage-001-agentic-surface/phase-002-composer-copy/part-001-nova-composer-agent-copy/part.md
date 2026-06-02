---
title: Nova Composer Agent Mode Copy Fix
slug: part-001-nova-composer-agent-copy
part_number: 1
status: draft
owner: Stylist Agent
assigned_to: Stylist Agent
phase: phase-002-composer-copy
started_at: ~
completed_at: ~
estimated_duration: 1h
---

## Objective

Remove stale "coming soon" labels from NovaComposer Agent mode option description and
placeholder. Agent mode has been wired since plan-031; the UI copy must match.

## Scope

**Update:**

- `src/modules/nova/components/NovaComposer.svelte`

**Update (test assertion):**

- `tests/nova/mode-routing.test.ts` — add assertion that "coming soon" and "routed to Ask"
  do not appear in the NovaComposer source.

## Implementation Steps

1. In `NovaComposer.svelte`, update `MODE_OPTIONS` agent entry:
   - Change `description` from `"Multi-step planning — coming soon."` to
     `"Bounded tool loop — gathers context and takes app actions via tool calls."`.
2. In `NovaComposer.svelte`, update `composerPlaceholder` for agent mode:
   - Change from `"Agent mode coming soon — routed to Ask for now…"` to
     `"Describe a multi-step task — Nova will use tools to gather context and act…"`.
3. In `tests/nova/mode-routing.test.ts`, add a describe block:
   ```ts
   describe('NovaComposer source — agent mode copy', () => {
     it('does not label agent mode as coming soon', () => {
       const src = readFileSync(resolve(process.cwd(),
         'src/modules/nova/components/NovaComposer.svelte'), 'utf-8');
       expect(src).not.toContain('coming soon');
       expect(src).not.toContain('routed to Ask');
     });
   });
   ```

## Acceptance Criteria

- [ ] `MODE_OPTIONS.agent.description` does not contain "coming soon".
- [ ] `composerPlaceholder` for agent mode does not contain "coming soon" or "routed to Ask".
- [ ] New test passes confirming neither phrase is present.
- [ ] `pnpm check` — 0 errors.
- [ ] `pnpm test` — all tests pass.

## Edge Cases

- Do not change the agent mode `value` or `label` — only description and placeholder text.

## Notes

Lines to target (as of 2026-06-01 inspection):
- `NovaComposer.svelte:33` — `description: 'Multi-step planning — coming soon.'`
- `NovaComposer.svelte:63` — `if (currentMode === 'agent') return 'Agent mode coming soon — routed to Ask for now…';`
