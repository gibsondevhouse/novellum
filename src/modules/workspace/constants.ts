import type { ArcStatus, ArcType, CoreArcType } from '$lib/db/types.js';
import type { StatusOption } from './types.js';

export const ARC_STATUSES: StatusOption<ArcStatus>[] = [
	{ value: 'planned', label: 'Planned' },
	{ value: 'in_progress', label: 'In Progress' },
	{ value: 'complete', label: 'Complete' },
	{ value: 'on_hold', label: 'On Hold' },
	{ value: 'cut', label: 'Cut' }
];

export const STAGE_STATUSES: StatusOption[] = [
	{ value: 'planned', label: 'Planned' },
	{ value: 'in_progress', label: 'In Progress' },
	{ value: 'completed', label: 'Completed' }
];

export interface ArcTypeOption {
	value: CoreArcType;
	label: string;
	description: string;
}

export const CORE_ARC_TYPES: ArcTypeOption[] = [
	{ value: 'character', label: 'Character', description: 'A person changes internally (beliefs, identity, flaws, growth).' },
	{ value: 'relationship', label: 'Relationship', description: 'The dynamic between characters changes (trust, power, connection).' },
	{ value: 'plot', label: 'Plot', description: 'A problem unfolds and resolves (missions, mysteries, external conflict).' },
	{ value: 'world', label: 'World', description: 'The environment, system, or rules change or are revealed.' },
	{ value: 'theme', label: 'Theme', description: 'An idea or concept is explored and transformed.' },
];

/** @deprecated Use CORE_ARC_TYPES instead */
export const ARC_TYPES: StatusOption<ArcType>[] = CORE_ARC_TYPES;
