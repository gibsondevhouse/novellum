import { WORLDBUILDING_DOMAIN_SEQUENCE } from './worldbuilding-workflow.js';
import type { WorldbuildingDomainId } from './worldbuilding-workflow.js';

export type WorldbuildingReadinessState = 'idle' | 'missing-context';

export interface WorldbuildingReadinessResult {
	allowed: boolean;
	state: WorldbuildingReadinessState;
	missingDeps: string[];
}

export function checkDomainReadiness(
	domainId: WorldbuildingDomainId,
	domainCounts: Record<WorldbuildingDomainId, number>,
): WorldbuildingReadinessResult {
	const config = WORLDBUILDING_DOMAIN_SEQUENCE.find((d) => d.id === domainId);
	if (!config) {
		return { allowed: false, state: 'missing-context', missingDeps: [domainId] };
	}

	const missingDeps = config.dependencyIds.filter((depId) => (domainCounts[depId] ?? 0) === 0);

	if (missingDeps.length > 0) {
		const depLabels = missingDeps.map((id) => {
			const dep = WORLDBUILDING_DOMAIN_SEQUENCE.find((d) => d.id === id);
			return dep?.label ?? id;
		});
		return { allowed: false, state: 'missing-context', missingDeps: depLabels };
	}

	return { allowed: true, state: 'idle', missingDeps: [] };
}
