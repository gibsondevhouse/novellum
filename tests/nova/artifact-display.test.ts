import { describe, expect, it } from 'vitest';
import {
	artifactLifecycleLabel,
	artifactTaskLabel,
	debugMetadataLabel,
	formatArtifactTimestamp,
	formatDebugValue,
	formatSceneDisplayLabel,
} from '$modules/nova/services/artifact-display.js';

describe('artifact display helpers', () => {
	it('formats valid dates and hides invalid raw timestamps', () => {
		expect(formatArtifactTimestamp('not-a-date')).toBe('Date unavailable');
		expect(formatArtifactTimestamp(null)).toBe('Date unavailable');
		expect(formatArtifactTimestamp('2026-06-15T12:00:00.000Z')).not.toContain('2026-06-15T12');
	});

	it('maps known tasks and degrades unknown task keys safely', () => {
		expect(artifactTaskLabel('vibe-author.scene-draft')).toBe('Scene draft');
		expect(artifactTaskLabel('vibe-author.revision-pack')).toBe('Revision notes');
		expect(artifactTaskLabel('custom.pipeline-stage')).toBe('Pipeline Stage proposal');
		expect(artifactTaskLabel(null)).toBe('AI proposal');
	});

	it('uses review-gate labels with readable fallbacks', () => {
		expect(artifactLifecycleLabel('review')).toBe('Pending review');
		expect(artifactLifecycleLabel('accepted')).toBe('Accepted');
		expect(artifactLifecycleLabel('needs-human')).toBe('Needs Human');
		expect(artifactLifecycleLabel(null)).toBe('No draft');
	});

	it('formats scene labels without requiring full ids', () => {
		expect(formatSceneDisplayLabel({ title: ' Market Ambush ', id: 'scene-123' })).toBe(
			'Market Ambush',
		);
		expect(formatSceneDisplayLabel({ id: '1234567890abcdef' })).toBe('Untitled scene 12345678');
		expect(formatSceneDisplayLabel({})).toBe('Untitled scene');
	});

	it('labels debug metadata intentionally', () => {
		expect(debugMetadataLabel('contextHash')).toBe('Context fingerprint');
		expect(debugMetadataLabel('unknown_field')).toBe('Unknown Field');
		expect(formatDebugValue(' ')).toBe('Not recorded');
		expect(formatDebugValue(true)).toBe('true');
	});
});
