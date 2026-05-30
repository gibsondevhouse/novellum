export type WorldbuildingDomainId =
	| 'personae'
	| 'atlas'
	| 'archive'
	| 'threads'
	| 'chronicles';

export interface WorldbuildingDomainConfig {
	id: WorldbuildingDomainId;
	label: string;
	sequenceNumber: number;
	dependencyIds: WorldbuildingDomainId[];
	targetEntities: string[];
	generationReadiness: string;
	entryPath: string;
	promptSeedKey: string;
}

export const WORLDBUILDING_DOMAIN_SEQUENCE: readonly WorldbuildingDomainConfig[] = [
	{
		id: 'personae',
		label: 'Personae',
		sequenceNumber: 1,
		dependencyIds: [],
		targetEntities: ['characters', 'factions', 'lineages'],
		generationReadiness: 'Recommended first',
		entryPath: 'characters',
		promptSeedKey: 'worldbuilding.generate.personae',
	},
	{
		id: 'atlas',
		label: 'Atlas',
		sequenceNumber: 2,
		dependencyIds: ['personae'],
		targetEntities: ['locations'],
		generationReadiness: 'Requires Personae',
		entryPath: 'locations',
		promptSeedKey: 'worldbuilding.generate.atlas',
	},
	{
		id: 'archive',
		label: 'The Archive',
		sequenceNumber: 3,
		dependencyIds: ['atlas'],
		targetEntities: ['lore_entries', 'themes', 'glossary_terms'],
		generationReadiness: 'Works best after Atlas',
		entryPath: 'lore',
		promptSeedKey: 'worldbuilding.generate.archive',
	},
	{
		id: 'threads',
		label: 'Threads',
		sequenceNumber: 4,
		dependencyIds: ['personae', 'atlas'],
		targetEntities: ['plot_threads'],
		generationReadiness: 'Requires Personae + Atlas',
		entryPath: 'plot-threads',
		promptSeedKey: 'worldbuilding.generate.threads',
	},
	{
		id: 'chronicles',
		label: 'Chronicles',
		sequenceNumber: 5,
		dependencyIds: ['personae', 'atlas', 'archive', 'threads'],
		targetEntities: ['timeline_events'],
		generationReadiness: 'Works best after all domains',
		entryPath: 'timeline',
		promptSeedKey: 'worldbuilding.generate.chronicles',
	},
];

export function getWorldbuildingDomainConfig(
	id: WorldbuildingDomainId,
): WorldbuildingDomainConfig | undefined {
	return WORLDBUILDING_DOMAIN_SEQUENCE.find((d) => d.id === id);
}
