# Final Closeout Agent Prompt

```md
1. Objective
Execute the V1.1 unfinished-work closeout under `plan-029-v1.1-unfinished-work-closeout`.

2. Problem
The repo has unfinished/deferred commitments from:
- `plan-019-naming-consistency`
- `plan-021-reader-pagination`
- `plan-024-v1-final-mile` stages 002, 003, and 006

Each item must be shipped, retired, or superseded with evidence. ACTIVE and MASTER trackers must end in a single non-ambiguous terminal state.

3. Files
Start with:
- `plan.md`
- `dev-docs/plans/ACTIVE-PLAN.md`
- `dev-docs/plans/MASTER-PLAN.md`
- `AGENTS.md`
- `CLAUDE.md`

Workstream files:
- naming routes/modules/components/tests/docs/boundaries
- `strategy-spike.md`
- `src/routes/books/[id]/+page.svelte`
- `src/routes/books/[id]/+page.ts`
- `reader-pages.ts`
- `BookReaderView.svelte`
- `desktop-build.yml`
- `release.yml`
- `tauri.conf.json`
- root `+layout.svelte`
- `global-handler.ts`
- `keymap-registry.ts`
- shortcut settings `+page.svelte`
- `client.ts`
- `openrouter-provider.ts`
- `ollama-provider.ts`
- provider orchestration `+server.ts`

4. Changes
Perform only closeout work:
- Complete naming consistency as pure rename with redirects.
- Complete reader empty state and deterministic client-side pagination.
- Verify/reconcile release engineering.
- Finish Ollama + shortcut behavior using existing systems.
- Rebaseline docs and trackers.

Do not add unrelated features.

5. UI/UX
- Use Svelte 5 runes only.
- Reader empty state must look intentional.
- Reader navigation must have valid bounds/disabled states.
- Shortcut settings must have clear recording, conflict, save, and cancel behavior.
- Do not redesign unrelated surfaces.

6. Data
- Use server-side SQLite through `/api/db/*`.
- Do not rename `/api/db/*`.
- Do not introduce an ORM.
- Do not add backend reader pagination.
- Do not expose provider keys client-side.

7. Errors
- Mark unknowns as `needs repo verification`.
- Do not invent APIs.
- Handle empty reader content.
- Handle shortcut conflicts.
- Handle Ollama unavailable state.
- Preserve OpenRouter provider behavior.

8. Tests
Run and report:
- `pnpm lint`
- `pnpm lint:css`
- `pnpm check`
- `pnpm test`
- boundaries check
- affected e2e/manual smoke
- coverage verification for touched service/AI areas

9. Criteria
Closeout is complete only when:
- Every deferred item is completed, retired, or superseded.
- Evidence exists for each disposition.
- ACTIVE and MASTER trackers agree.
- No ambiguous carry-over remains.
- Quality gates pass or failures are documented with exact blockers.

10. Out-of-scope
- Net-new product initiatives.
- UI redesign beyond finishing required surfaces.
- New provider architecture.
- New release system.
- Data model rewrite.
- API resource renaming.
- Roadmap planning.

11. Format
Return a closeout report with:
- Work completed by plan/stage.
- Files changed.
- Evidence links.
- Test results.
- Manual smoke results.
- Final tracker status.
- Remaining blockers, each labeled Critical/High/Medium/Low.
- Any `needs repo verification` items.
```
