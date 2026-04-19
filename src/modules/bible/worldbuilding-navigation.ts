export type WorldBuildingTopSectionId =
	| 'characters'
	| 'locations'
	| 'lore'
	| 'plot-threads'
	| 'timeline';

export type WorldBuildingTopItem = {
	id: WorldBuildingTopSectionId;
	label: string;
};

export type WorldBuildingSubItem = {
	id: string;
	label: string;
	path: string;
};

export const WORLD_BUILDING_TOP_ITEMS: WorldBuildingTopItem[] = [
	{ id: 'characters', label: 'Personae' },
	{ id: 'locations', label: 'Atlas' },
	{ id: 'lore', label: 'The Archive' },
	{ id: 'plot-threads', label: 'Threads' },
	{ id: 'timeline', label: 'Chronicles' },
];

export const WORLD_BUILDING_SECTION_LABELS: Record<WorldBuildingTopSectionId, string> = {
	characters: 'Personae',
	locations: 'Atlas',
	lore: 'The Archive',
	'plot-threads': 'Threads',
	timeline: 'Chronicles',
};

export const WORLD_BUILDING_SUB_ITEMS: Record<WorldBuildingTopSectionId, WorldBuildingSubItem[]> = {
	characters: [
		{ id: 'individuals', label: 'Individuals', path: 'characters' },
		{ id: 'factions', label: 'Factions', path: 'factions' },
		{ id: 'lineages', label: 'Lineages', path: 'species' },
		{ id: 'notes', label: 'Notes', path: 'characters/notes' },
	],
	locations: [
		{ id: 'realms', label: 'Realms', path: 'locations' },
		{ id: 'landmarks', label: 'Landmarks', path: 'locations/landmarks' },
		{ id: 'maps', label: 'Maps', path: 'locations/maps' },
		{ id: 'notes', label: 'Notes', path: 'locations/notes' },
	],
	lore: [
		{ id: 'myths', label: 'Myths', path: 'lore' },
		{ id: 'technology', label: 'Technology', path: 'lore/technology' },
		{ id: 'traditions', label: 'Traditions', path: 'lore/traditions' },
		{ id: 'notes', label: 'Notes', path: 'lore/notes' },
	],
	'plot-threads': [
		{ id: 'major-arcs', label: 'Major Arcs', path: 'plot-threads' },
		{ id: 'sub-plots', label: 'Sub-plots', path: 'plot-threads/sub-plots' },
		{ id: 'motivations', label: 'Motivations', path: 'plot-threads/motivations' },
		{ id: 'notes', label: 'Notes', path: 'plot-threads/notes' },
	],
	timeline: [
		{ id: 'eras', label: 'Eras', path: 'timeline' },
		{ id: 'key-events', label: 'Key Events', path: 'timeline/key-events' },
		{ id: 'personal-histories', label: 'Personal Histories', path: 'timeline/personal-histories' },
		{ id: 'notes', label: 'Notes', path: 'timeline/notes' },
	],
};

const TOP_SECTION_IDS = new Set<WorldBuildingTopSectionId>([
	'characters',
	'locations',
	'lore',
	'plot-threads',
	'timeline',
]);

export function getWorldBuildingTopSection(pathname: string): WorldBuildingTopSectionId | null {
	const segments = pathname.split('/').filter(Boolean);
	const wbIndex = segments.indexOf('world-building');
	if (wbIndex < 0 || wbIndex === segments.length - 1) return null;

	const section = segments[wbIndex + 1];
	if (section === 'factions' || section === 'species') return 'characters';
	if (TOP_SECTION_IDS.has(section as WorldBuildingTopSectionId)) {
		return section as WorldBuildingTopSectionId;
	}
	return null;
}

export function getWorldBuildingSubSectionId(pathname: string): string | null {
	const segments = pathname.split('/').filter(Boolean);
	const wbIndex = segments.indexOf('world-building');
	if (wbIndex < 0 || wbIndex === segments.length - 1) return null;

	const section = segments[wbIndex + 1];
	const next = segments[wbIndex + 2] ?? null;

	if (section === 'characters') {
		if (next === 'notes') return 'notes';
		return 'individuals';
	}
	if (section === 'factions') return 'factions';
	if (section === 'species') return 'lineages';

	if (section === 'locations') {
		if (next === 'landmarks') return 'landmarks';
		if (next === 'maps') return 'maps';
		if (next === 'notes') return 'notes';
		return 'realms';
	}

	if (section === 'lore') {
		if (next === 'technology') return 'technology';
		if (next === 'traditions') return 'traditions';
		if (next === 'notes') return 'notes';
		return 'myths';
	}

	if (section === 'plot-threads') {
		if (next === 'sub-plots') return 'sub-plots';
		if (next === 'motivations') return 'motivations';
		if (next === 'notes') return 'notes';
		return 'major-arcs';
	}

	if (section === 'timeline') {
		if (next === 'key-events') return 'key-events';
		if (next === 'personal-histories') return 'personal-histories';
		if (next === 'notes') return 'notes';
		return 'eras';
	}

	return null;
}
