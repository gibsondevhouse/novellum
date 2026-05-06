import { describe, it, expect } from 'vitest';
import {
	WORLD_BUILDING_LANDING_CONFIG,
	buildWorldBuildingLandingProps,
	getWorldBuildingSubSectionId,
	getWorldBuildingTopSection,
} from '../../src/modules/world-building/worldbuilding-navigation.js';

describe('worldbuilding-navigation', () => {
	it('includes a characters landing config with standard links', () => {
		const config = WORLD_BUILDING_LANDING_CONFIG.characters;

		expect(config.title).toBe('Personae');
		expect(config.ariaLabel).toBe('Personae sections');
		expect(config.links.map((link) => link.id)).toEqual([
			'individuals',
			'factions',
			'lineages',
			'notes',
		]);
	});

	it('builds project-aware hrefs from landing config links', () => {
		const landing = buildWorldBuildingLandingProps('characters', 'project-123', 'en');
		const hrefById = Object.fromEntries(landing.links.map((link) => [link.id, link.href]));

		expect(hrefById.individuals).toBe(
			'/projects/project-123/world-building/characters/individuals',
		);
		expect(hrefById.factions).toBe('/projects/project-123/world-building/factions');
		expect(hrefById.lineages).toBe('/projects/project-123/world-building/lineages');
		expect(hrefById.notes).toBe('/projects/project-123/world-building/characters/notes');
	});

	it('resolves top-section aliases for factions and lineages to characters', () => {
		expect(getWorldBuildingTopSection('/projects/p1/world-building/factions')).toBe('characters');
		expect(getWorldBuildingTopSection('/projects/p1/world-building/lineages')).toBe('characters');
		expect(getWorldBuildingTopSection('/projects/p1/world-building/timeline')).toBe('timeline');
	});

	it('resolves subsection ids for aliases and nested sections', () => {
		expect(getWorldBuildingSubSectionId('/projects/p1/world-building/factions')).toBe('factions');
		expect(getWorldBuildingSubSectionId('/projects/p1/world-building/lineages')).toBe('lineages');
		expect(getWorldBuildingSubSectionId('/projects/p1/world-building/lore/technology')).toBe(
			'technology',
		);
		expect(getWorldBuildingSubSectionId('/projects/p1/world-building/timeline/key-events')).toBe(
			'key-events',
		);
	});
});
