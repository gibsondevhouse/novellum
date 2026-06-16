import { describe, it, expect } from 'vitest';
import {
	normalizeSevenLayerOutline,
	normalizeMilestoneChapterIds,
	filterOutlineByStageStatus,
	SEVEN_LAYER_HIERARCHY,
} from '../../src/modules/outline/services/seven-layer-outline.js';
import type {
	Arc,
	Act,
	Beat,
	Chapter,
	Milestone,
	Scene,
	Stage,
} from '../../src/lib/db/domain-types.js';

const projectId = 'proj-1';
const now = '2026-05-26T00:00:00Z';

const arc = (id: string, order: number): Arc => ({
	id,
	projectId,
	title: `Arc ${id}`,
	description: '',
	purpose: '',
	order,
	createdAt: now,
	updatedAt: now,
});

const act = (id: string, order: number, arcId?: string): Act => ({
	id,
	projectId,
	arcId,
	title: `Act ${id}`,
	order,
	planningNotes: '',
	createdAt: now,
	updatedAt: now,
});

const milestone = (id: string, actId: string, order: number, chapterIds: string[]): Milestone => ({
	id,
	projectId,
	actId,
	title: `Milestone ${id}`,
	description: '',
	order,
	chapterIds,
	createdAt: now,
	updatedAt: now,
});

const chapter = (id: string, order: number): Chapter => ({
	id,
	projectId,
	title: `Chapter ${id}`,
	order,
	summary: '',
	wordCount: 0,
	createdAt: now,
	updatedAt: now,
});

const scene = (id: string, chapterId: string, order: number): Scene => ({
	id,
	projectId,
	chapterId,
	title: `Scene ${id}`,
	summary: '',
	povCharacterId: null,
	locationId: null,
	timelineEventId: null,
	order,
	content: '',
	wordCount: 0,
	notes: '',
	characterIds: [],
	locationIds: [],
	createdAt: now,
	updatedAt: now,
});

const beat = (id: string, sceneId: string, order: number): Beat => ({
	id,
	sceneId,
	projectId,
	title: `Beat ${id}`,
	type: 'action',
	order,
	notes: '',
	createdAt: now,
	updatedAt: now,
});

const stage = (id: string, beatId: string, order: number, status: Stage['status']): Stage => ({
	id,
	beatId,
	projectId,
	title: `Stage ${id}`,
	description: '',
	order,
	status,
	createdAt: now,
	updatedAt: now,
});

describe('seven-layer outline normalization', () => {
	it('exposes all seven canonical layer names in top-down order', () => {
		expect(SEVEN_LAYER_HIERARCHY).toEqual([
			'arcs',
			'acts',
			'milestones',
			'chapters',
			'scenes',
			'beats',
			'stages',
		]);
	});

	it('returns all seven buckets even when inputs are empty', () => {
		const outline = normalizeSevenLayerOutline({});
		expect(outline.arcs).toEqual([]);
		expect(outline.acts).toEqual([]);
		expect(outline.milestones).toEqual([]);
		expect(outline.chapters).toEqual([]);
		expect(outline.scenes).toEqual([]);
		expect(outline.beats).toEqual([]);
		expect(outline.stages).toEqual([]);
	});

	it('sorts every layer deterministically by order then title', () => {
		const outline = normalizeSevenLayerOutline({
			arcs: [arc('a2', 2), arc('a1', 1)],
			acts: [act('act2', 2), act('act1', 1)],
			chapters: [chapter('c2', 2), chapter('c1', 1)],
			scenes: [scene('s2', 'c1', 2), scene('s1', 'c1', 1)],
			beats: [beat('b2', 's1', 2), beat('b1', 's1', 1)],
			stages: [
				stage('st2', 'b1', 2, 'planned'),
				stage('st1', 'b1', 1, 'in_progress'),
			],
		});
		expect(outline.arcs.map((a) => a.id)).toEqual(['a1', 'a2']);
		expect(outline.acts.map((a) => a.id)).toEqual(['act1', 'act2']);
		expect(outline.chapters.map((c) => c.id)).toEqual(['c1', 'c2']);
		expect(outline.scenes.map((s) => s.id)).toEqual(['s1', 's2']);
		expect(outline.beats.map((b) => b.id)).toEqual(['b1', 'b2']);
		expect(outline.stages.map((s) => s.id)).toEqual(['st1', 'st2']);
	});

	it('normalizes milestone chapterIds into deterministic canonical chapter order', () => {
		// Chapters declared in mixed order; canonical order is c1 < c2 < c3
		const outline = normalizeSevenLayerOutline({
			chapters: [chapter('c3', 3), chapter('c1', 1), chapter('c2', 2)],
			milestones: [milestone('m1', 'act1', 1, ['c3', 'c1', 'c2'])],
		});
		expect(outline.milestones[0].chapterIds).toEqual(['c1', 'c2', 'c3']);
	});

	it('accepts SQLite-encoded milestone chapterIds from API responses', () => {
		const encodedMilestone = {
			...milestone('m1', 'act1', 1, []),
			chapterIds: '["c3","c1","c2"]',
		} as unknown as Milestone;

		const outline = normalizeSevenLayerOutline({
			chapters: [chapter('c3', 3), chapter('c1', 1), chapter('c2', 2)],
			milestones: [encodedMilestone],
		});

		expect(outline.milestones[0].chapterIds).toEqual(['c1', 'c2', 'c3']);
	});

	it('drops invalid milestone chapterIds instead of throwing', () => {
		expect(normalizeMilestoneChapterIds('not-json')).toEqual([]);
		expect(normalizeMilestoneChapterIds([null, 'c1', 42, ''])).toEqual(['c1']);
	});

	it('keeps scenes with beats but no stages intact (no null-crash, empty stages bucket)', () => {
		const outline = normalizeSevenLayerOutline({
			scenes: [scene('s1', 'c1', 1)],
			beats: [beat('b1', 's1', 1)],
			// stages intentionally omitted
		});
		expect(outline.stages).toEqual([]);
		expect(outline.beats).toHaveLength(1);
	});

	it('does not mutate input arrays', () => {
		const inputArcs = [arc('a2', 2), arc('a1', 1)];
		const snapshot = inputArcs.map((a) => a.id);
		normalizeSevenLayerOutline({ arcs: inputArcs });
		expect(inputArcs.map((a) => a.id)).toEqual(snapshot);
	});
});

describe('filterOutlineByStageStatus', () => {
	const baseOutline = normalizeSevenLayerOutline({
		stages: [
			stage('st-p', 'b1', 1, 'planned'),
			stage('st-i', 'b1', 2, 'in_progress'),
			stage('st-c', 'b1', 3, 'completed'),
		],
	});

	it('returns only stages whose lifecycle status is in the allowed set', () => {
		const filtered = filterOutlineByStageStatus(baseOutline, ['in_progress', 'completed']);
		expect(filtered.stages.map((s) => s.id)).toEqual(['st-i', 'st-c']);
	});

	it('rejects stages with statuses outside the allowed set', () => {
		const filtered = filterOutlineByStageStatus(baseOutline, ['completed']);
		expect(filtered.stages.map((s) => s.id)).toEqual(['st-c']);
		expect(filtered.stages.every((s) => s.status === 'completed')).toBe(true);
	});

	it('treats an empty allowed list as a no-op (returns all stages)', () => {
		const filtered = filterOutlineByStageStatus(baseOutline, []);
		expect(filtered.stages).toHaveLength(3);
	});

	it('leaves the other six layers untouched', () => {
		const outline = normalizeSevenLayerOutline({
			arcs: [arc('a1', 1)],
			acts: [act('act1', 1)],
			milestones: [milestone('m1', 'act1', 1, [])],
			chapters: [chapter('c1', 1)],
			scenes: [scene('s1', 'c1', 1)],
			beats: [beat('b1', 's1', 1)],
			stages: [stage('st1', 'b1', 1, 'planned')],
		});
		const filtered = filterOutlineByStageStatus(outline, ['completed']);
		expect(filtered.arcs).toEqual(outline.arcs);
		expect(filtered.acts).toEqual(outline.acts);
		expect(filtered.milestones).toEqual(outline.milestones);
		expect(filtered.chapters).toEqual(outline.chapters);
		expect(filtered.scenes).toEqual(outline.scenes);
		expect(filtered.beats).toEqual(outline.beats);
		expect(filtered.stages).toEqual([]);
	});
});

describe('seven-layer mapping must include milestones and stages', () => {
	// Regression guard: if a future refactor forgets to thread milestones or
	// stages through the hierarchy mapping, these assertions catch it.
	it('fails loudly if milestones are dropped from the bucket', () => {
		const outline = normalizeSevenLayerOutline({
			milestones: [milestone('m1', 'act1', 1, [])],
		});
		expect(outline.milestones).toBeDefined();
		expect(outline.milestones.length).toBeGreaterThan(0);
	});

	it('fails loudly if stages are dropped from the bucket', () => {
		const outline = normalizeSevenLayerOutline({
			stages: [stage('st1', 'b1', 1, 'planned')],
		});
		expect(outline.stages).toBeDefined();
		expect(outline.stages.length).toBeGreaterThan(0);
	});
});
