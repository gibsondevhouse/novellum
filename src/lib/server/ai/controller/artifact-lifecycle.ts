import type { AiControllerArtifactStatus } from './contracts.js';

export const CONTROLLER_ARTIFACT_TRANSITIONS: Record<
	AiControllerArtifactStatus,
	readonly AiControllerArtifactStatus[]
> = {
	draft: ['review', 'failed', 'rejected'],
	review: ['accepted', 'rejected', 'failed'],
	accepted: [],
	rejected: [],
	failed: [],
};

export class ControllerArtifactLifecycleError extends Error {
	constructor(
		readonly code: 'invalid_transition',
		message: string,
	) {
		super(message);
		this.name = 'ControllerArtifactLifecycleError';
	}
}

export function canTransitionControllerArtifact(
	from: AiControllerArtifactStatus,
	to: AiControllerArtifactStatus,
): boolean {
	return CONTROLLER_ARTIFACT_TRANSITIONS[from].includes(to);
}

export function assertControllerArtifactTransition(
	from: AiControllerArtifactStatus,
	to: AiControllerArtifactStatus,
): void {
	if (!canTransitionControllerArtifact(from, to)) {
		throw new ControllerArtifactLifecycleError(
			'invalid_transition',
			`Cannot transition controller artifact from ${from} to ${to}.`,
		);
	}
}
