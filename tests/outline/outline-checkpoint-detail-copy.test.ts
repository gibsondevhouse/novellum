import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const OUTLINE_ROUTE_SOURCE = 'src/routes/projects/[id]/outline/+page.svelte';

function readOutlineRoute(): string {
	return readFileSync(OUTLINE_ROUTE_SOURCE, 'utf8');
}

describe('outline checkpoint detail copy', () => {
	it('keeps default detail metadata reviewer-facing', () => {
		const source = readOutlineRoute();
		const defaultDetail = source.slice(
			source.indexOf('<div class="checkpoint-detail__meta">'),
			source.indexOf('<details class="checkpoint-detail__payload">'),
		);

		expect(defaultDetail).toContain('Task');
		expect(defaultDetail).toContain('Lifecycle');
		expect(defaultDetail).toContain('Scope');
		expect(defaultDetail).toContain('Generated');
		expect(defaultDetail).toContain('Updated');
		expect(defaultDetail).toContain('getPipelineTaskLabel(selectedReviewCheckpoint.taskKey)');
		expect(defaultDetail).toContain('checkpointLifecycleLabel(selectedReviewCheckpoint.lifecycle)');
		expect(defaultDetail).toContain('formatHierarchyScope(');
		expect(defaultDetail).not.toContain('<dt>ID</dt>');
		expect(defaultDetail).not.toContain('<dt>Parser</dt>');
		expect(defaultDetail).not.toContain('<dt>Pipeline</dt>');
		expect(defaultDetail).not.toContain('<dt>Stage Key</dt>');
		expect(defaultDetail).not.toContain('JSON.stringify');
	});

	it('keeps raw payload and runtime keys behind advanced disclosure', () => {
		const source = readOutlineRoute();
		const advancedDetail = source.slice(source.indexOf('<details class="checkpoint-detail__payload">'));

		expect(advancedDetail).toContain('<summary>Advanced details</summary>');
		expect(advancedDetail).toContain('Developer checkpoint metadata');
		expect(advancedDetail).toContain('Checkpoint ID');
		expect(advancedDetail).toContain('Task key');
		expect(advancedDetail).toContain('Parser version');
		expect(advancedDetail).toContain('Stage key');
		expect(advancedDetail).toContain('Raw payload');
		expect(advancedDetail).toContain('JSON.stringify(selectedReviewCheckpoint.artifact.payload');
	});

	it('uses user-impact copy for checkpoint decisions', () => {
		const source = readOutlineRoute();

		expect(source).toContain('Nothing changes until you explicitly accept.');
		expect(source).toContain('Rejecting keeps this artifact out of canon');
		expect(source).not.toContain('canonical for task <strong>{selectedReviewCheckpoint.taskKey}</strong>');
	});
});
