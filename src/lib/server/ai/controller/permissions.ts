export const AI_CONTROLLER_PERMISSION_LEVELS = [
	'read_only',
	'proposal_only',
	'review_decision',
	'mutation',
] as const;

export type AiControllerPermissionLevel = (typeof AI_CONTROLLER_PERMISSION_LEVELS)[number];

export interface AiControllerPermissionMetadata {
	level: AiControllerPermissionLevel;
	humanApproval: 'not_required' | 'required_before_persistence' | 'required_before_mutation';
	canCallModel: boolean;
	canPersistArtifact: boolean;
	canMutateCanon: boolean;
	allowedToolCapabilities: readonly string[];
	description: string;
}

export const AI_CONTROLLER_PERMISSION_METADATA: Record<
	AiControllerPermissionLevel,
	AiControllerPermissionMetadata
> = {
	read_only: {
		level: 'read_only',
		humanApproval: 'not_required',
		canCallModel: true,
		canPersistArtifact: false,
		canMutateCanon: false,
		allowedToolCapabilities: ['read', 'search', 'context'],
		description: 'May read scoped context and return an answer without persisting draft artifacts.',
	},
	proposal_only: {
		level: 'proposal_only',
		humanApproval: 'required_before_mutation',
		canCallModel: true,
		canPersistArtifact: true,
		canMutateCanon: false,
		allowedToolCapabilities: ['read', 'search', 'context', 'draft_artifact'],
		description: 'May create reviewable draft artifacts but cannot mutate canon.',
	},
	review_decision: {
		level: 'review_decision',
		humanApproval: 'required_before_mutation',
		canCallModel: false,
		canPersistArtifact: true,
		canMutateCanon: true,
		allowedToolCapabilities: ['review_decision'],
		description: 'May transition an existing artifact after explicit user review.',
	},
	mutation: {
		level: 'mutation',
		humanApproval: 'required_before_mutation',
		canCallModel: false,
		canPersistArtifact: true,
		canMutateCanon: true,
		allowedToolCapabilities: [],
		description: 'Direct mutation is blocked for model-initiated workflows.',
	},
};

export function getPermissionMetadata(
	level: AiControllerPermissionLevel,
): AiControllerPermissionMetadata {
	return AI_CONTROLLER_PERMISSION_METADATA[level];
}
