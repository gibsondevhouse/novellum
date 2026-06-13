import type { WorldbuildCanonEntityFamily } from './worldbuild-canon-diff-schema.js';

export type WorldbuildCanonMergeFieldMode =
	| 'replace_if_empty'
	| 'append_unique'
	| 'link_only'
	| 'manual_review'
	| 'never';

export interface WorldbuildCanonMergeFamilyPolicy {
	family: WorldbuildCanonEntityFamily;
	label: string;
	createEnabled: boolean;
	updateEnabled: boolean;
	mergeEnabled: boolean;
	linkEnabled: boolean;
	replaceIfEmptyFields: readonly string[];
	appendUniqueFields: readonly string[];
	linkFields: readonly string[];
	protectedFields: readonly string[];
}

const CANON_BASE_PROTECTED_FIELDS = ['id', 'projectId', 'createdAt', 'updatedAt'] as const;

export const WORLDBUILD_CANON_MERGE_POLICIES: Partial<
	Record<WorldbuildCanonEntityFamily, WorldbuildCanonMergeFamilyPolicy>
> = {
	character: {
		family: 'character',
		label: 'Character',
		createEnabled: true,
		updateEnabled: true,
		mergeEnabled: true,
		linkEnabled: true,
		replaceIfEmptyFields: [
			'role',
			'bio',
			'faction',
			'coreDesire',
			'fear',
			'contradiction',
			'strength',
			'flaw',
			'storyRole',
			'externalGoal',
			'internalNeed',
			'stakes',
			'voiceSummary',
			'speechPattern',
			'notes',
		],
		appendUniqueFields: ['traits', 'goals', 'flaws', 'tags'],
		linkFields: ['factionId'],
		protectedFields: CANON_BASE_PROTECTED_FIELDS,
	},
	location: {
		family: 'location',
		label: 'Location',
		createEnabled: true,
		updateEnabled: true,
		mergeEnabled: true,
		linkEnabled: true,
		replaceIfEmptyFields: [
			'description',
			'kind',
			'realmType',
			'realityRules',
			'culturalBaseline',
			'powerStructure',
			'conflictPressure',
			'storyRole',
			'tone',
			'environment',
			'purpose',
			'activityType',
			'emotionalTone',
			'changeOverTime',
		],
		appendUniqueFields: ['tags', 'notableFeatures', 'landmarkIds', 'factionIds', 'characterIds', 'threadIds'],
		linkFields: ['realmId'],
		protectedFields: CANON_BASE_PROTECTED_FIELDS,
	},
	faction: {
		family: 'faction',
		label: 'Faction',
		createEnabled: true,
		updateEnabled: true,
		mergeEnabled: false,
		linkEnabled: true,
		replaceIfEmptyFields: ['type', 'description', 'mission', 'ideology'],
		appendUniqueFields: [],
		linkFields: [],
		protectedFields: CANON_BASE_PROTECTED_FIELDS,
	},
};

export function getWorldbuildCanonMergePolicy(
	family: WorldbuildCanonEntityFamily,
): WorldbuildCanonMergeFamilyPolicy | undefined {
	return WORLDBUILD_CANON_MERGE_POLICIES[family];
}

export function getWorldbuildCanonMergeFieldMode(
	family: WorldbuildCanonEntityFamily,
	fieldPath: string,
): WorldbuildCanonMergeFieldMode {
	const policy = getWorldbuildCanonMergePolicy(family);
	if (!policy) return 'manual_review';

	const field = fieldPath.trim();
	if (!field) return 'never';
	if (policy.protectedFields.includes(field)) return 'never';
	if (policy.appendUniqueFields.includes(field)) return 'append_unique';
	if (policy.linkFields.includes(field)) return 'link_only';
	if (policy.replaceIfEmptyFields.includes(field)) return 'replace_if_empty';
	return 'manual_review';
}
