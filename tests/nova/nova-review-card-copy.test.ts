import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const outlineCheckpointCardSource = readFileSync(
	resolve(process.cwd(), 'src/modules/nova/components/NovaOutlineDraftCheckpointCard.svelte'),
	'utf-8',
);
const authorDraftCheckpointCardSource = readFileSync(
	resolve(process.cwd(), 'src/modules/nova/components/NovaAuthorDraftCheckpointCard.svelte'),
	'utf-8',
);

describe('Nova review card author-facing copy', () => {
	it('moves outline debug metadata behind an intentional disclosure', () => {
		expect(outlineCheckpointCardSource).toContain('formatArtifactTimestamp');
		expect(outlineCheckpointCardSource).toContain('<summary>Advanced details</summary>');
		expect(outlineCheckpointCardSource).toContain("debugMetadataLabel('contextHash')");
		expect(outlineCheckpointCardSource).toContain("debugMetadataLabel('promptVersion')");
		expect(outlineCheckpointCardSource).toContain(
			'This proposal uses an older outline format. Review carefully before accepting.',
		);
		expect(outlineCheckpointCardSource).not.toContain('<dt>Context</dt>');
		expect(outlineCheckpointCardSource).not.toContain('<dt>Prompt</dt>');
		expect(outlineCheckpointCardSource).not.toContain('Version mismatch');
	});

	it('uses author-facing labels on scene draft checkpoint cards', () => {
		expect(authorDraftCheckpointCardSource).toContain('formatSceneDisplayLabel');
		expect(authorDraftCheckpointCardSource).toContain('<summary>Author notes</summary>');
		expect(authorDraftCheckpointCardSource).toContain('Referenced canon');
		expect(authorDraftCheckpointCardSource).not.toContain('Scene <code>{scene.id}</code>');
		expect(authorDraftCheckpointCardSource).not.toContain('<summary>Sidecar</summary>');
		expect(authorDraftCheckpointCardSource).not.toContain('Used canon refs');
	});
});
