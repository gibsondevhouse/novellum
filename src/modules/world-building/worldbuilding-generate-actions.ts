import { novaMode, novaPanel } from '$modules/nova';
import { WORLDBUILDING_DOMAIN_SEQUENCE } from './worldbuilding-workflow.js';
import type { WorldbuildingDomainId } from './worldbuilding-workflow.js';
import { PROMPT_SEEDS } from '$lib/ai/pipeline/prompt-library-seeds.js';
import {
	canGenerateDomain,
	runWorldbuildingDomainGeneration,
	type GenerateGuardContext,
	type GenerateGuardResult,
	type WorldbuildingGenerationActionResult,
} from './services/worldbuilding-generation-actions.js';
import type { WorldbuildingGenerationStateValue } from './stores/worldbuilding-generation-state.svelte.js';

export { canGenerateDomain };
export type {
	GenerateGuardContext,
	GenerateGuardResult,
	WorldbuildingGenerationActionResult,
};

export interface WorldbuildingGenerateControlState {
	disabled: boolean;
	label: string;
	ariaLabel: string;
	title: string | null;
	reviewReady: boolean;
}

export function getWorldbuildingGenerateControlState(params: {
	domainLabel: string;
	guard: GenerateGuardResult;
	state: WorldbuildingGenerationStateValue;
}): WorldbuildingGenerateControlState {
	const { domainLabel, guard, state } = params;

	if (!guard.allowed) {
		const reason = guard.reason ?? 'Missing required context';
		return {
			disabled: true,
			label: 'Generate',
			ariaLabel: `Generate ${domainLabel}: ${reason}`,
			title: reason,
			reviewReady: false,
		};
	}

	if (state === 'queued') {
		return {
			disabled: true,
			label: 'Queued...',
			ariaLabel: `Generate ${domainLabel}: queued`,
			title: 'Generation is queued for this domain.',
			reviewReady: false,
		};
	}

	if (state === 'running') {
		return {
			disabled: true,
			label: 'Generating...',
			ariaLabel: `Generate ${domainLabel}: running`,
			title: 'Generation is already running for this domain.',
			reviewReady: false,
		};
	}

	if (state === 'review-ready') {
		return {
			disabled: true,
			label: 'Review draft',
			ariaLabel: `Generate ${domainLabel}: draft pending review`,
			title: 'Review the current generated draft before starting another generation.',
			reviewReady: true,
		};
	}

	return {
		disabled: false,
		label: 'Generate',
		ariaLabel: `Generate ${domainLabel}`,
		title: null,
		reviewReady: false,
	};
}

export function openNovaGenerationHelp(projectId: string, domainId: WorldbuildingDomainId): void {
	const config = WORLDBUILDING_DOMAIN_SEQUENCE.find((d) => d.id === domainId);
	if (!config) return;

	const seed = PROMPT_SEEDS[config.promptSeedKey];
	const prompt = seed ? `${seed.task}\n\n(Domain: ${config.label})` : `Help me generate ${config.label} for my world.`;

	novaMode.loadForProject(projectId);
	novaMode.setMode('write');
	novaPanel.openWithPrompt(prompt);
}

function defaultCounts(): Record<WorldbuildingDomainId, number> {
	return { personae: 0, atlas: 0, archive: 0, threads: 0, chronicles: 0 };
}

export function generatePersonaeWithNova(
	projectId: string,
	domainCounts: Record<WorldbuildingDomainId, number> = defaultCounts(),
): Promise<WorldbuildingGenerationActionResult> {
	return runWorldbuildingDomainGeneration({ projectId, domainId: 'personae', domainCounts });
}

export function generateAtlasWithNova(
	projectId: string,
	domainCounts: Record<WorldbuildingDomainId, number> = defaultCounts(),
): Promise<WorldbuildingGenerationActionResult> {
	return runWorldbuildingDomainGeneration({ projectId, domainId: 'atlas', domainCounts });
}

export function generateArchiveWithNova(
	projectId: string,
	domainCounts: Record<WorldbuildingDomainId, number> = defaultCounts(),
): Promise<WorldbuildingGenerationActionResult> {
	return runWorldbuildingDomainGeneration({ projectId, domainId: 'archive', domainCounts });
}

export function generateThreadsWithNova(
	projectId: string,
	domainCounts: Record<WorldbuildingDomainId, number> = defaultCounts(),
): Promise<WorldbuildingGenerationActionResult> {
	return runWorldbuildingDomainGeneration({ projectId, domainId: 'threads', domainCounts });
}

export function generateChroniclesWithNova(
	projectId: string,
	domainCounts: Record<WorldbuildingDomainId, number> = defaultCounts(),
): Promise<WorldbuildingGenerationActionResult> {
	return runWorldbuildingDomainGeneration({ projectId, domainId: 'chronicles', domainCounts });
}

export function generateDomainWithNova(
	projectId: string,
	domainId: WorldbuildingDomainId,
	domainCounts: Record<WorldbuildingDomainId, number> = defaultCounts(),
): Promise<WorldbuildingGenerationActionResult> {
	return runWorldbuildingDomainGeneration({ projectId, domainId, domainCounts });
}
