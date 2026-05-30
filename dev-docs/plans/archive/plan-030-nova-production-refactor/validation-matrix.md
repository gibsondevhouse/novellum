# plan-030 Validation Matrix

| Requirement | Validation Method | Expected Evidence |
| --- | --- | --- |
| Project context available with no scenes | Unit/integration test for project-only Nova request | Test name, pass output, fixture summary |
| “What is this novel about?” grounded in Project Hub metadata | E2E or service-level test using title/logline/synopsis fixture | Assertion that response payload/prompt contains project metadata |
| No full manuscript by default | Context builder test | Context mode/scope excludes manuscript content unless requested |
| Context disclosure honest | Component/store test | Scopes include `project` / `project-summary` |
| Attachment UI truthful | Component test or source assertion | Upload disabled/removed or attachments included in request payload |
| No-key path consistent | Component test or manual screenshot | Both no-key states link to canonical AI settings route |
| Sidepanel responsive | Playwright visual tests | Desktop/constrained/compact screenshots or snapshot updates |
| Scribe unsupported action bounded | Component/service test | Unsupported request returns limitation message/state |
| Review-gated artifacts remain proposals | Source-contract test | No editor/manuscript mutation imports in artifact runner/cards |
| Docs updated | File review | `dev-docs/04-modules/nova.md`, `dev-docs/03-ai/context-engine.md`, `dev-docs/03-ai/pipeline.md` updated |

## Required Command Evidence Template

```text
Command: pnpm run check
Result: PASS/FAIL
Notes:

Command: pnpm run lint
Result: PASS/FAIL
Notes:

Command: pnpm run lint:css
Result: PASS/FAIL
Notes:

Command: pnpm run test
Result: PASS/FAIL
Notes:

Command: pnpm run test:visual or targeted visual specs
Result: PASS/FAIL
Notes:
```
