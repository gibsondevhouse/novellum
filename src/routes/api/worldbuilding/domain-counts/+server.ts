import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';

function countWhere(table: string, projectId: string): number {
	const row = db
		.prepare(`SELECT COUNT(*) as n FROM ${table} WHERE projectId = ?`)
		.get(projectId) as { n: number } | undefined;
	return row?.n ?? 0;
}

export const GET: RequestHandler = ({ url }) => {
	const projectId = url.searchParams.get('projectId');
	if (!projectId) error(400, 'projectId is required');

	const [characters, factions, characterRelationships, locations, loreEntries, themes, glossaryTerms, plotThreads, timelineEvents] = [
		countWhere('characters', projectId),
		countWhere('factions', projectId),
		countWhere('character_relationships', projectId),
		countWhere('locations', projectId),
		countWhere('lore_entries', projectId),
		countWhere('themes', projectId),
		countWhere('glossary_terms', projectId),
		countWhere('plot_threads', projectId),
		countWhere('timeline_events', projectId),
	];

	return json({
		personae: characters + factions + characterRelationships,
		atlas: locations,
		archive: loreEntries + themes + glossaryTerms,
		threads: plotThreads,
		chronicles: timelineEvents,
	});
};
