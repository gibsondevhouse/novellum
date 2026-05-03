import { get } from 'svelte/store';
import { locale, translateWithFallback, type Locale } from '$lib/i18n';

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

export type WorldBuildingLandingSectionId =
	| 'characters'
	| 'locations'
	| 'lore'
	| 'plot-threads'
	| 'timeline';

export type WorldBuildingLandingLink = {
	id: string;
	label: string;
	tagline: string;
	description: string;
	path: string;
};

export type WorldBuildingLandingConfig = {
	ariaLabel: string;
	title: string;
	description: string;
	orientationTitle: string;
	orientation: string;
	links: WorldBuildingLandingLink[];
};

export const WORLD_BUILDING_TOP_ITEMS: WorldBuildingTopItem[] = [
	{ id: 'characters', label: 'Personae' },
	{ id: 'locations', label: 'Atlas' },
	{ id: 'lore', label: 'The Archive' },
	{ id: 'plot-threads', label: 'Threads' },
	{ id: 'timeline', label: 'Chronicles' },
];

function localized(
	currentLocale: Locale,
	key: string,
	fallback: string,
): string {
	return translateWithFallback(currentLocale, key, fallback);
}

export function buildWorldBuildingTopItems(currentLocale: Locale = get(locale)): WorldBuildingTopItem[] {
	return WORLD_BUILDING_TOP_ITEMS.map((item) => ({
		...item,
		label: localized(currentLocale, `worldbuilding.section.${item.id}`, item.label),
	}));
}

export const WORLD_BUILDING_SECTION_LABELS: Record<WorldBuildingTopSectionId, string> = {
	characters: 'Personae',
	locations: 'Atlas',
	lore: 'The Archive',
	'plot-threads': 'Threads',
	timeline: 'Chronicles',
};

export const WORLD_BUILDING_LANDING_CONFIG: Record<
	WorldBuildingLandingSectionId,
	WorldBuildingLandingConfig
> = {
	characters: {
		ariaLabel: 'Personae sections',
		title: 'Personae',
		description:
			'Use this landing to orient your social world before diving into records. Personae tracks agency: who can act, who is constrained, and what identity costs to maintain.',
		orientationTitle: 'Personae Orientation',
		orientation:
			'Start by defining individual motives, then map collective pressures and inherited identity layers. Keep each record tied to story consequence, not just lore completeness.',
		links: [
			{
				id: 'individuals',
				label: 'Individuals',
				tagline: 'Specific voices with leverage and flaws',
				description:
					'Define protagonist and supporting actors with motive, contradiction, and pressure-sensitive traits.',
				path: 'characters/individuals',
			},
			{
				id: 'factions',
				label: 'Factions',
				tagline: 'Collective actors that institutionalize conflict',
				description:
					'Map group identity, social incentives, and power structures that shape decisions beyond individuals.',
				path: 'factions',
			},
			{
				id: 'lineages',
				label: 'Lineages',
				tagline: 'Inherited identity and social consequence',
				description:
					'Track bloodlines, legacy, and inherited expectation that alter status, obligation, and risk.',
				path: 'lineages',
			},
			{
				id: 'notes',
				label: 'Notes',
				tagline: 'Unsorted personae fragments',
				description:
					'Capture incomplete ideas and unresolved relationships before promoting them into canon records.',
				path: 'characters/notes',
			},
		],
	},
	locations: {
		ariaLabel: 'Atlas sections',
		title: 'Atlas',
		description:
			'Atlas is where physical reality imposes consequence. Use this landing to align geography, travel cost, and spatial pressure before adding detail.',
		orientationTitle: 'Atlas Orientation',
		orientation:
			'Build from large-scale terrain to high-impact places, then ensure map logic supports the same constraints your scenes rely on.',
		links: [
			{
				id: 'realms',
				label: 'Realms',
				tagline: 'Macro territories and environmental constraint',
				description:
					'Define major geographies, regional pressure, and movement cost across your world.',
				path: 'locations/realms',
			},
			{
				id: 'landmarks',
				label: 'Landmarks',
				tagline: 'High-impact sites of memory and conflict',
				description:
					'Catalog places where stakes concentrate and narrative turning points naturally occur.',
				path: 'locations/landmarks',
			},
			{
				id: 'maps',
				label: 'Maps',
				tagline: 'Spatial continuity and route logic',
				description:
					'Preserve travel coherence, adjacency logic, and strategic distance across story arcs.',
				path: 'locations/maps',
			},
			{
				id: 'notes',
				label: 'Notes',
				tagline: 'Unplaced spatial ideas',
				description:
					'Capture world-space fragments that are useful later but not yet assigned to a canonical location.',
				path: 'locations/notes',
			},
		],
	},
	lore: {
		ariaLabel: 'Archive sections',
		title: 'The Archive',
		description:
			'The Archive defines what the world believes to be true. Use this landing to align myth, systems, and tradition before expanding entries.',
		orientationTitle: 'Archive Orientation',
		orientation:
			'Prioritize high-consequence beliefs first, then connect technology and ritual to lived behavior, law, and conflict.',
		links: [
			{
				id: 'myths',
				label: 'Myths',
				tagline: 'Narrative frames of identity and destiny',
				description:
					'Define stories societies tell to explain legitimacy, origin, and moral order.',
				path: 'lore/myths',
			},
			{
				id: 'technology',
				label: 'Technology',
				tagline: 'Applied systems that shift power',
				description:
					'Track tools, methods, and infrastructure that alter social and narrative outcomes.',
				path: 'lore/technology',
			},
			{
				id: 'traditions',
				label: 'Traditions',
				tagline: 'Repeated practices encoding values',
				description:
					'Capture rituals and norms that reinforce belonging, hierarchy, or cultural fracture.',
				path: 'lore/traditions',
			},
			{
				id: 'notes',
				label: 'Notes',
				tagline: 'Archive fragments awaiting synthesis',
				description:
					'Park speculative ideas until they can be connected to a belief system or cultural consequence.',
				path: 'lore/notes',
			},
		],
	},
	'plot-threads': {
		ariaLabel: 'Threads sections',
		title: 'Threads',
		description:
			'Threads is your causality layer. Use this landing to align why events happen before recording where they happen.',
		orientationTitle: 'Threads Orientation',
		orientation:
			'Map major arcs first, verify sub-plot pressure, and keep motivations explicit enough that every turn has a believable parent cause.',
		links: [
			{
				id: 'major-arcs',
				label: 'Major Arcs',
				tagline: 'Primary movement of transformation',
				description:
					'Define the central causal chains that drive your story from setup to resolution.',
				path: 'plot-threads/major-arcs',
			},
			{
				id: 'sub-plots',
				label: 'Sub-plots',
				tagline: 'Secondary movement that intensifies theme',
				description:
					'Track supporting lines that sharpen pressure on the main arc without distracting from it.',
				path: 'plot-threads/sub-plots',
			},
			{
				id: 'motivations',
				label: 'Motivations',
				tagline: 'Decision logic beneath action',
				description:
					'Clarify why characters and factions choose each turn so events remain legible and earned.',
				path: 'plot-threads/motivations',
			},
			{
				id: 'notes',
				label: 'Notes',
				tagline: 'Unresolved connective tissue',
				description:
					'Collect incomplete causal ideas before assigning them to a canonical arc lane.',
				path: 'plot-threads/notes',
			},
		],
	},
	timeline: {
		ariaLabel: 'Chronicles sections',
		title: 'Chronicles',
		description:
			'Chronicles preserves temporal truth. Use this landing to align era logic, event causality, and personal chronology before filling details.',
		orientationTitle: 'Chronicles Orientation',
		orientation:
			'Lock macro chronology first, then slot key events, then reconcile personal histories with canon so continuity remains intentional.',
		links: [
			{
				id: 'eras',
				label: 'Eras',
				tagline: 'Temporal containers for macro shifts',
				description:
					'Define broad periods and enduring transitions that shape present-day narrative context.',
				path: 'timeline/eras',
			},
			{
				id: 'key-events',
				label: 'Key Events',
				tagline: 'Turning points with durable consequence',
				description:
					'Record canonical moments that alter institutions, identity, and future possibility.',
				path: 'timeline/key-events',
			},
			{
				id: 'personal-histories',
				label: 'Personal Histories',
				tagline: 'Character timelines intersecting canon',
				description: 'Track private chronology where lived memory diverges from public record.',
				path: 'timeline/personal-histories',
			},
			{
				id: 'notes',
				label: 'Notes',
				tagline: 'Loose chronology ideas',
				description:
					'Capture unresolved temporal fragments before anchoring them to an era or event line.',
				path: 'timeline/notes',
			},
		],
	},
};

export function buildWorldBuildingLandingProps(
	sectionId: WorldBuildingLandingSectionId,
	projectId: string,
	currentLocale: Locale = get(locale),
) {
	const config = WORLD_BUILDING_LANDING_CONFIG[sectionId];
	const prefix = `worldbuilding.landing.${sectionId}`;
	const ariaKeyBySection: Record<WorldBuildingLandingSectionId, string> = {
		characters: 'worldbuilding.aria.personaeSections',
		locations: 'worldbuilding.aria.atlasSections',
		lore: 'worldbuilding.aria.archiveSections',
		'plot-threads': 'worldbuilding.aria.threadsSections',
		timeline: 'worldbuilding.aria.chroniclesSections',
	};
	return {
		ariaLabel: localized(
			currentLocale,
			ariaKeyBySection[sectionId],
			config.ariaLabel,
		),
		title: localized(currentLocale, `${prefix}.title`, config.title),
		description: localized(currentLocale, `${prefix}.description`, config.description),
		orientationTitle: localized(
			currentLocale,
			`${prefix}.orientationTitle`,
			config.orientationTitle,
		),
		orientation: localized(currentLocale, `${prefix}.orientation`, config.orientation),
		links: config.links.map((link) => ({
			id: link.id,
			label: localized(currentLocale, `${prefix}.links.${link.id}.label`, link.label),
			tagline: localized(currentLocale, `${prefix}.links.${link.id}.tagline`, link.tagline),
			description: localized(
				currentLocale,
				`${prefix}.links.${link.id}.description`,
				link.description,
			),
			href: `/projects/${projectId}/world-building/${link.path}`,
		})),
	};
}

export const WORLD_BUILDING_SUB_ITEMS: Record<WorldBuildingTopSectionId, WorldBuildingSubItem[]> = {
	characters: [
		{ id: 'overview', label: 'Overview', path: 'characters' },
		{ id: 'individuals', label: 'Individuals', path: 'characters/individuals' },
		{ id: 'factions', label: 'Factions', path: 'factions' },
		{ id: 'lineages', label: 'Lineages', path: 'lineages' },
		{ id: 'notes', label: 'Notes', path: 'characters/notes' },
	],
	locations: [
		{ id: 'overview', label: 'Overview', path: 'locations' },
		{ id: 'realms', label: 'Realms', path: 'locations/realms' },
		{ id: 'landmarks', label: 'Landmarks', path: 'locations/landmarks' },
		{ id: 'maps', label: 'Maps', path: 'locations/maps' },
		{ id: 'notes', label: 'Notes', path: 'locations/notes' },
	],
	lore: [
		{ id: 'overview', label: 'Overview', path: 'lore' },
		{ id: 'myths', label: 'Myths', path: 'lore/myths' },
		{ id: 'technology', label: 'Technology', path: 'lore/technology' },
		{ id: 'traditions', label: 'Traditions', path: 'lore/traditions' },
		{ id: 'notes', label: 'Notes', path: 'lore/notes' },
	],
	'plot-threads': [
		{ id: 'overview', label: 'Overview', path: 'plot-threads' },
		{ id: 'major-arcs', label: 'Major Arcs', path: 'plot-threads/major-arcs' },
		{ id: 'sub-plots', label: 'Sub-plots', path: 'plot-threads/sub-plots' },
		{ id: 'motivations', label: 'Motivations', path: 'plot-threads/motivations' },
		{ id: 'notes', label: 'Notes', path: 'plot-threads/notes' },
	],
	timeline: [
		{ id: 'overview', label: 'Overview', path: 'timeline' },
		{ id: 'eras', label: 'Eras', path: 'timeline/eras' },
		{ id: 'key-events', label: 'Key Events', path: 'timeline/key-events' },
		{ id: 'personal-histories', label: 'Personal Histories', path: 'timeline/personal-histories' },
		{ id: 'notes', label: 'Notes', path: 'timeline/notes' },
	],
};

export function buildWorldBuildingSubItems(
	topSection: WorldBuildingTopSectionId,
	currentLocale: Locale = get(locale),
): WorldBuildingSubItem[] {
	return WORLD_BUILDING_SUB_ITEMS[topSection].map((item) => ({
		...item,
		label: localized(currentLocale, `worldbuilding.sub.${item.id}`, item.label),
	}));
}

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
	if (section === 'factions' || section === 'lineages') return 'characters';
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
		if (next === null) return 'overview';
		if (next === 'individuals') return 'individuals';
		if (next === 'notes') return 'notes';
		return null;
	}
	if (section === 'factions') return 'factions';
	if (section === 'lineages') return 'lineages';

	if (section === 'locations') {
		if (next === null) return 'overview';
		if (next === 'realms') return 'realms';
		if (next === 'landmarks') return 'landmarks';
		if (next === 'maps') return 'maps';
		if (next === 'notes') return 'notes';
		return null;
	}

	if (section === 'lore') {
		if (next === null) return 'overview';
		if (next === 'myths') return 'myths';
		if (next === 'technology') return 'technology';
		if (next === 'traditions') return 'traditions';
		if (next === 'notes') return 'notes';
		return null;
	}

	if (section === 'plot-threads') {
		if (next === null) return 'overview';
		if (next === 'major-arcs') return 'major-arcs';
		if (next === 'sub-plots') return 'sub-plots';
		if (next === 'motivations') return 'motivations';
		if (next === 'notes') return 'notes';
		return null;
	}

	if (section === 'timeline') {
		if (next === null) return 'overview';
		if (next === 'eras') return 'eras';
		if (next === 'key-events') return 'key-events';
		if (next === 'personal-histories') return 'personal-histories';
		if (next === 'notes') return 'notes';
		return null;
	}

	return null;
}
