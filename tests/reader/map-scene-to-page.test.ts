import { describe, it, expect } from 'vitest';
import {
	buildReaderPages,
	mapSceneIdToReaderPageId,
	type ReaderInputChapter,
	type ReaderInputProject,
} from '$modules/reader/reader-pages.js';

/**
 * plan-023 stage-003 phase-004 — scene→reader page mapping helper.
 *
 * The helper translates an authoring scene id into the deterministic
 * `ReaderPage.id` produced by `buildReaderPages`. The books route uses
 * it to forward `targetPageId` to BookReaderView/ReaderFullscreenShell.
 *
 * Fixture: 2 chapters × 3 scenes each, all with non-trivial content so
 * each scene materializes as a `scene` page (not `empty-scene`).
 */

const project: ReaderInputProject = {
	id: 'p1',
	title: 'Two-Chapter Test',
	logline: 'Fixture for scene-to-page mapping.',
	genre: 'Test',
};

function makeChapter(id: string, order: number, sceneIds: string[]): ReaderInputChapter {
	return {
		id,
		title: `Chapter ${order}`,
		order,
		scenes: sceneIds.map((sid, idx) => ({
			id: sid,
			title: `Scene ${idx + 1}`,
			order: idx + 1,
			content: `<p>Body of ${sid}.</p>`,
		})),
	};
}

const chapters: ReaderInputChapter[] = [
	makeChapter('c1', 1, ['s1', 's2', 's3']),
	makeChapter('c2', 2, ['s4', 's5', 's6']),
];

describe('mapSceneIdToReaderPageId', () => {
	it('returns the page id for the first scene of the first chapter', () => {
		const pageId = mapSceneIdToReaderPageId('s1', project, chapters);
		expect(pageId).not.toBeNull();
		const pages = buildReaderPages(project, chapters);
		const expected = pages.find((p) => p.sceneId === 's1');
		expect(pageId).toBe(expected!.id);
	});

	it('returns the page id for the last scene of the last chapter', () => {
		const pageId = mapSceneIdToReaderPageId('s6', project, chapters);
		expect(pageId).not.toBeNull();
		const pages = buildReaderPages(project, chapters);
		const expected = pages.find((p) => p.sceneId === 's6');
		expect(pageId).toBe(expected!.id);
	});

	it('returns the page id for a middle scene', () => {
		const pageId = mapSceneIdToReaderPageId('s4', project, chapters);
		const pages = buildReaderPages(project, chapters);
		expect(pageId).toBe(pages.find((p) => p.sceneId === 's4')!.id);
	});

	it('returns null for an unknown sceneId without throwing', () => {
		expect(mapSceneIdToReaderPageId('does-not-exist', project, chapters)).toBeNull();
	});

	it('returns null for an empty sceneId', () => {
		expect(mapSceneIdToReaderPageId('', project, chapters)).toBeNull();
	});

	it('produces stable, deterministic page ids across repeated calls', () => {
		const a = mapSceneIdToReaderPageId('s2', project, chapters);
		const b = mapSceneIdToReaderPageId('s2', project, chapters);
		// Note: not memoized — values are equal but not necessarily reference-equal.
		expect(a).toBe(b);
		expect(a).not.toBeNull();
	});
});
