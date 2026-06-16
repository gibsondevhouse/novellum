# Disabled Affordance Copy Evidence

Date: 2026-06-15

## Implementation Evidence

- Removed the disabled slash-command button from `NovaComposer.svelte` while retaining attachment, mode, model, stop, and send controls.
- Removed the disabled LM Studio provider tab from `src/routes/settings/ai/+page.svelte`.
- Added truthful provider copy: `LM Studio is not available in this build. Use Ollama for local models or OpenRouter for hosted models.`
- Changed desktop updater unsupported reason to `Automatic updates are not available in this unsigned pre-release build.`

## Verification

- `tests/settings/ai-settings-copy.test.ts` verifies the AI settings, Nova composer, and updater copy contracts.
- `tests/settings/settings-ai-page.test.ts` was updated to expect two enabled provider tabs and explanatory LM Studio copy.
- `tests/lib/version-and-updater.test.ts` was updated to assert the new unsupported reason.
- Final targeted Vitest run: 276 files / 1941 tests passed.

## Review Boundary

This part is ready for Reviewer Agent evaluation. It is not complete until reviewer sign-off is real.
