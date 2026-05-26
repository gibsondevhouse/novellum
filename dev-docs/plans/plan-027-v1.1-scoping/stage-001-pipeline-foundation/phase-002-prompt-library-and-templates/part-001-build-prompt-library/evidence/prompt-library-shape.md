# Prompt Library Shape Evidence

## Exported Surface

The prompt library is organized into three files:
- `contracts.ts`: Base types and 7-layer hierarchy definition.
- `prompt-library-seeds.ts`: Default prompt scaffolds for all 8 pipeline stages.
- `prompt-library.ts`: Resolution logic for merging project templates with seeds.

### Supported Stages

The following stages have dedicated prompt scaffolds:
- `vibe-worldbuild.premise`
- `vibe-worldbuild.worldspec`
- `vibe-worldbuild.research`
- `vibe-worldbuild.populated-world-bible`
- `vibe-author.premise`
- `vibe-author.outline`
- `vibe-author.scene-draft`
- `vibe-author.revision-pack`

### Prompt Structure

Every scaffold enforces the following sections:
- **ROLE**: Context-aware persona.
- **TASK**: Specific goal for the current stage.
- **CONSTRAINTS**: Do's and don'ts from research §8.
- **OUTPUT FORMAT**: Mapped to `task-catalog.ts` formats.

### Resolution Logic

`resolvePromptScaffold(stageKey, templates)`:
1. Locates the seed by `stageKey`.
2. Searches `templates` list for a matching `type`.
3. If found:
   - If content is JSON: Merges fields over the seed.
   - If content is text: Replaces the `task` field.
4. Returns the final `PromptScaffold`.

## Output Format Descriptions

All 8 pipeline-specific output formats are now populated in `src/lib/ai/constants.ts` with human-readable shape guidance, ensuring the model knows exactly which JSON fields or prose delimiters to use.

## Test Coverage

- `tests/ai/pipeline/prompt-library.test.ts`:
  - **Unit**: Seed fallback, plain text task override, JSON merge override, partial JSON override, error on unknown stage.
  - **Integration**: `Prompt Builder Integration` verifies that `buildPrompt` correctly integrates the scaffolds, swaps format keys for descriptors, and preserves the Nova identity block.

## Quality Gates

Latest run: 2026-05-26 11:40
- `svelte-check`: 0 errors, 0 warnings.
- `eslint`: Pass.
- `stylelint`: Pass.
- `vitest`: 1071 passed.
