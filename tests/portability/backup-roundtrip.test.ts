import { describe, it, expect, beforeEach } from 'vitest';
import { db, resetDb } from '$lib/db/index.js';
import { buildBackupArchive } from '$modules/export/services/portability/zip-export.js';
import { parseBackupArchive } from '$modules/export/services/portability/zip-import-parse.js';
import { restoreBackupSnapshot } from '$modules/export/services/portability/restore-service.js';

describe('portability roundtrip', () => {
	const projectId = 'roundtrip-proj-1';

	beforeEach(async () => {
		await resetDb();
	});

	async function seedProject() {
		await db.projects.add({
			id: projectId,
			title: 'Roundtrip Novel',
			genre: 'Fantasy',
			logline: 'A test of portability',
			synopsis: 'Full roundtrip test',
			targetWordCount: 90000,
			systemPrompt: '',
			negativePrompt: '',
			status: 'draft',
			createdAt: '2026-04-10T00:00:00.000Z',
			updatedAt: '2026-04-10T00:00:00.000Z',
		});
		await db.characters.add({
			id: 'char-rt-1',
			projectId,
			name: 'Elara',
			role: 'protagonist',
			traits: ['brave', 'curious'],
			goals: ['find truth'],
			flaws: ['reckless'],
			arcs: ['hero journey'],
			notes: 'Main character',
			tags: ['hero'],
			createdAt: '2026-04-10T00:00:00.000Z',
			updatedAt: '2026-04-10T00:00:00.000Z',
		});
		await db.chapters.add({
			id: 'ch-rt-1',
			projectId,
			title: 'The Beginning',
			order: 1,
			summary: 'First chapter',
			wordCount: 2500,
			arcRefs: [],
			createdAt: '2026-04-10T00:00:00.000Z',
			updatedAt: '2026-04-10T00:00:00.000Z',
		});
		await db.scenes.add({
			id: 'sc-rt-1',
			chapterId: 'ch-rt-1',
			projectId,
			title: 'Opening Scene',
			summary: 'The story opens',
			povCharacterId: 'char-rt-1',
			locationId: null,
			timelineEventId: null,
			order: 1,
			content: 'It was a dark and stormy night...',
			wordCount: 8,
			characterIds: ['char-rt-1'],
			locationIds: [],
			arcRefs: [],
			createdAt: '2026-04-10T00:00:00.000Z',
			updatedAt: '2026-04-10T00:00:00.000Z',
		});
		await db.locations.add({
			id: 'loc-rt-1',
			projectId,
			name: 'Castle Driftwood',
			description: 'A crumbling castle',
			tags: ['castle', 'ruins'],
			createdAt: '2026-04-10T00:00:00.000Z',
			updatedAt: '2026-04-10T00:00:00.000Z',
		});
		await db.acts.add({
			id: 'act-rt-1',
			projectId,
			title: 'Act One',
			order: 1,
			planningNotes: 'Setup arc',
			createdAt: '2026-04-10T00:00:00.000Z',
			updatedAt: '2026-04-10T00:00:00.000Z',
		});
		await db.arcs.add({
			id: 'arc-rt-1',
			projectId,
			title: 'Hero Arc',
			description: 'Main story arc',
			purpose: 'Drive narrative',
			order: 1,
			createdAt: '2026-04-10T00:00:00.000Z',
			updatedAt: '2026-04-10T00:00:00.000Z',
		});
	}

	it('exports and restores a project with full data parity', async () => {
		await seedProject();

		// Export
		const { blob } = await buildBackupArchive(projectId);

		// Clear all data
		await resetDb();

		// Verify data is gone
		expect(await db.projects.count()).toBe(0);
		expect(await db.characters.count()).toBe(0);

		// Parse and restore
		const parsed = await parseBackupArchive(new File([blob], 'test.novellum.zip'));
		const result = await restoreBackupSnapshot(parsed);

		expect(result.success).toBe(true);
		expect(result.rowsRestored).toBeGreaterThan(0);

		// Verify parity
		const project = await db.projects.get(projectId);
		expect(project).toBeDefined();
		expect(project!.title).toBe('Roundtrip Novel');
		expect(project!.genre).toBe('Fantasy');
		expect(project!.logline).toBe('A test of portability');

		const characters = await db.characters.where('projectId').equals(projectId).toArray();
		expect(characters).toHaveLength(1);
		expect(characters[0].name).toBe('Elara');
		expect(characters[0].traits).toEqual(['brave', 'curious']);

		const chapters = await db.chapters.where('projectId').equals(projectId).toArray();
		expect(chapters).toHaveLength(1);
		expect(chapters[0].title).toBe('The Beginning');

		const scenes = await db.scenes.where('projectId').equals(projectId).toArray();
		expect(scenes).toHaveLength(1);
		expect(scenes[0].content).toBe('It was a dark and stormy night...');

		const locations = await db.locations.where('projectId').equals(projectId).toArray();
		expect(locations).toHaveLength(1);
		expect(locations[0].name).toBe('Castle Driftwood');

		const acts = await db.acts.where('projectId').equals(projectId).toArray();
		expect(acts).toHaveLength(1);

		const arcs = await db.arcs.where('projectId').equals(projectId).toArray();
		expect(arcs).toHaveLength(1);
		expect(arcs[0].title).toBe('Hero Arc');
	});

	it('preserves exact timestamp values through roundtrip', async () => {
		await seedProject();
		const { blob } = await buildBackupArchive(projectId);
		await resetDb();

		const parsed = await parseBackupArchive(new File([blob], 'test.zip'));
		await restoreBackupSnapshot(parsed);

		const project = await db.projects.get(projectId);
		expect(project!.createdAt).toBe('2026-04-10T00:00:00.000Z');
	});

	it('handles empty project with no child entities', async () => {
		await db.projects.add({
			id: 'empty-proj',
			title: 'Empty',
			genre: '',
			logline: '',
			synopsis: '',
			targetWordCount: 0,
			systemPrompt: '',
			negativePrompt: '',
			status: 'draft',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});

		const { blob } = await buildBackupArchive('empty-proj');
		await resetDb();

		const parsed = await parseBackupArchive(new File([blob], 'empty.zip'));
		const result = await restoreBackupSnapshot(parsed);

		expect(result.success).toBe(true);
		const project = await db.projects.get('empty-proj');
		expect(project!.title).toBe('Empty');
	});

	it('replaces existing data on restore without duplicates', async () => {
		await seedProject();
		const { blob } = await buildBackupArchive(projectId);

		// Modify existing data
		await db.projects.update(projectId, { title: 'Modified Title' });

		// Restore over existing data
		const parsed = await parseBackupArchive(new File([blob], 'test.zip'));
		const result = await restoreBackupSnapshot(parsed);

		expect(result.success).toBe(true);
		const project = await db.projects.get(projectId);
		expect(project!.title).toBe('Roundtrip Novel'); // Original title restored

		// No duplicates
		const allProjects = await db.projects.toArray();
		expect(allProjects.filter((p) => p.id === projectId)).toHaveLength(1);
	});
});
