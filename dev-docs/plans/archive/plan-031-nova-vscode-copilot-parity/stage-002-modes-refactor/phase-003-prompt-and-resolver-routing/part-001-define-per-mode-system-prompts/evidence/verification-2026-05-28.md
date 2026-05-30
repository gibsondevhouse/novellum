# Define Per-Mode System Prompts — 2026-05-28

## Task Definitions Added

| Task | TaskType | ContextPolicy | OutputFormat |
|------|----------|---------------|--------------|
| ask | chat | scene_plus_adjacent | plain_text |
| write | write | outline_scope | plain_text |
| agent | agent | scene_plus_adjacent | plain_text |

## Constraints

- Ask: conversational, no tool calls, context-grounded
- Write: proposal-only, explicit no-auto-apply rule, asks for missing context
- Agent: honest about tool dispatch unavailability

## Quality Gates

```
pnpm check → 0 errors (1689 files)
pnpm test → 1310 tests passed
```
