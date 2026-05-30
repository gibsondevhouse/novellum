# Global Acceptance Criteria Verification — 2026-05-28

## plan-031 plan.md section 8 checklist

| Criterion | Status |
| --- | --- |
| Compact density at 360px: single action row, single-line composer, no oversized greeting | complete (Stage 001) |
| Header/composer/footer/message log use tokens; pnpm check:tokens passes | pass (0 violations) |
| Mode pill shows Ask / Write / Agent exactly | complete (Stage 002) |
| Each mode has distinct placeholder copy, prompt behavior, resolver routing | complete (Stage 002) |
| Ask mode advertises no tools, single-shot grounded chat | complete + tested |
| Write mode routes to proposal-generation, migrates old Scribe outline path | complete + tested |
| Agent mode performs real tool-calling loop against registered project tools | complete (Stage 004) |
| Agent loop has visible tool-call/tool-result chips, max-step cap, user abort | complete + tested |
| Attach popover opens from + with Project and Upload tabs | complete (Stage 003) |
| Project entities attachable as chips | complete + tested |
| .md/.txt files up to 100KB attachable; invalid files rejected at client and server | complete + tested (23 tests) |
| Attached items enter context as 'user-attached' scope, counted separately | complete + tested |
| New chat clears attachments and disclosure attachment count | complete + tested |
| No tool handler imports editor or manuscript mutation paths | pass (17 source-contract tests) |
| Agent mode with project returns proposal artifact, not auto-applied change | complete (ProposalEnvelope contract) |
| pnpm check/lint/lint:css/test/check:tokens pass or have accepted waivers | pass (visual test waived — see validation-matrix.md) |
| Docs and trackers updated | complete (Stage 005) |
