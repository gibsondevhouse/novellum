# Agent Prompt — plan-030 Investigation

You are a senior staff engineer investigating the Nova refactor on branch `feat/nova-development`.

## Objective

Confirm the current implementation state before code changes.

## Required Checks

1. Map embedded sidepanel runtime under `src/modules/nova/*`.
2. Map fullscreen `/nova` runtime under `src/modules/ai/components/ChatInterface.svelte`.
3. Identify where project metadata enters Nova context.
4. Identify why no active scene can produce empty project context.
5. Identify all user-facing controls that imply unsupported behavior.
6. Confirm current visual and unit test coverage.

## Output

Return:

- canonical surface recommendation
- defect list with severity
- exact files to modify first
- tests to add first
- scope risks

Do not make code changes in this investigation pass.
