import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/project-metadata.js', () => ({
	getProjectMetadata: vi.fn().mockResolvedValue({}),
	setProjectMetadata: vi.fn().mockResolvedValue(undefined),
}));

describe('scene-metadata-service', async () => {
	const { getProjectMetadata, setProjectMetadata } = await import('$lib/project-metadata.js');
	const {
		loadSceneClarity,
		saveSceneClarity,
		loadQuickIntent,
		saveQuickIntent,
	} = await import('../../src/modules/editor/services/scene-metadata-service.js');

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getProjectMetadata).mockResolvedValue({});
	});

	it('loadSceneClarity returns {} on cache miss (default)', async () => {
		vi.mocked(getProjectMetadata).mockResolvedValueOnce({});
		const result = await loadSceneClarity('proj-1', 'scene-1');
		expect(result).toEqual({});
	});

	it('loadSceneClarity calls getProjectMetadata with correct entity type', async () => {
		await loadSceneClarity('proj-1', 'scene-1');
		expect(getProjectMetadata).toHaveBeenCalledWith(
			'proj-1',
			'scene',
			'scene-1',
			'clarity',
			{},
		);
	});

	it('saveSceneClarity calls setProjectMetadata with correct entity type', async () => {
		const data = { pov: 'char-1', location: 'Castle' };
		await saveSceneClarity('proj-1', 'scene-1', data);
		expect(setProjectMetadata).toHaveBeenCalledWith('proj-1', 'scene', 'scene-1', 'clarity', data);
	});

	it('loadQuickIntent returns {} on cache miss', async () => {
		vi.mocked(getProjectMetadata).mockResolvedValueOnce({});
		const result = await loadQuickIntent('proj-1', 'scene-1');
		expect(result).toEqual({});
	});

	it('loadQuickIntent calls getProjectMetadata with correct key', async () => {
		await loadQuickIntent('proj-1', 'scene-1');
		expect(getProjectMetadata).toHaveBeenCalledWith(
			'proj-1',
			'scene',
			'scene-1',
			'quick-intent',
			{},
		);
	});

	it('saveQuickIntent calls setProjectMetadata with correct entity type', async () => {
		const data = { goal: 'Escape', conflict: 'Guards block the way', outcome: 'partial' };
		await saveQuickIntent('proj-1', 'scene-1', data);
		expect(setProjectMetadata).toHaveBeenCalledWith(
			'proj-1',
			'scene',
			'scene-1',
			'quick-intent',
			data,
		);
	});

	it('round-trip: save then load returns same data (via mock)', async () => {
		const clarity = { pov: 'hero', location: 'forest', participants: ['hero', 'villain'] };
		vi.mocked(getProjectMetadata).mockResolvedValueOnce(clarity);
		await saveSceneClarity('proj-1', 'scene-2', clarity);
		const loaded = await loadSceneClarity('proj-1', 'scene-2');
		expect(loaded).toEqual(clarity);
	});

	it('round-trip quick intent: save then load returns same data (via mock)', async () => {
		const qi = { goal: 'Find the key', conflict: 'Locked room', outcome: 'win' };
		vi.mocked(getProjectMetadata).mockResolvedValueOnce(qi);
		await saveQuickIntent('proj-2', 'scene-3', qi);
		const loaded = await loadQuickIntent('proj-2', 'scene-3');
		expect(loaded).toEqual(qi);
	});
});
