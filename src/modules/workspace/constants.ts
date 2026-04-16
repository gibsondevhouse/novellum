import type { ArcStatus, ArcType } from '$lib/db/types.js';
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

export const ARC_TYPES: StatusOption<ArcType>[] = [
	{ value: 'character', label: 'Character' },
	{ value: 'plot', label: 'Plot' },
	{ value: 'relationship', label: 'Relationship' },
	{ value: 'thematic', label: 'Thematic' },
	{ value: 'world', label: 'World' }
];
