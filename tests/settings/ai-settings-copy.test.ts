import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const settingsSource = readFileSync(resolve(process.cwd(), 'src/routes/settings/ai/+page.svelte'), 'utf-8');
const composerSource = readFileSync(
	resolve(process.cwd(), 'src/modules/nova/components/NovaComposer.svelte'),
	'utf-8',
);
const updaterSource = readFileSync(resolve(process.cwd(), 'src/lib/desktop/updater.ts'), 'utf-8');

describe('AI settings and Nova affordance copy', () => {
	it('does not render LM Studio as a disabled coming-soon provider tab', () => {
		expect(settingsSource).not.toContain('ProviderComingSoon');
		expect(settingsSource).not.toContain('badge-soon');
		expect(settingsSource).not.toContain('Coming soon');
		expect(settingsSource).not.toContain("'lm-studio'");
		expect(settingsSource).toContain(
			'LM Studio is not available in this build. Use Ollama for local models or OpenRouter for hosted models.',
		);
	});

	it('removes the inactive slash-command control while keeping usable composer controls', () => {
		expect(composerSource).not.toContain('Slash commands (coming soon)');
		expect(composerSource).not.toContain('aria-label="Commands"');
		expect(composerSource).not.toContain('nova-commands-glyph');
		expect(composerSource).toContain('aria-label="Attach files or project context"');
		expect(composerSource).toContain('<ModelPickerDropdown');
		expect(composerSource).toContain('id="nova-mode-select"');
	});

	it('uses truthful updater unsupported copy for unsigned pre-release builds', () => {
		expect(updaterSource).toContain(
			'Automatic updates are not available in this unsigned pre-release build.',
		);
		expect(updaterSource).toContain('unsigned pre-release message');
		expect(updaterSource).not.toContain('auto-updates ship in 1.x');
		expect(updaterSource).not.toContain('Auto-updates are scheduled');
	});
});
