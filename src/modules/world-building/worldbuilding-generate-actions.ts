import { novaMode, novaPanel } from '$modules/nova';
import { WORLDBUILDING_DOMAIN_SEQUENCE } from './worldbuilding-workflow.js';
import type { WorldbuildingDomainId } from './worldbuilding-workflow.js';
import { PROMPT_SEEDS } from '$lib/ai/pipeline/prompt-library-seeds.js';
import { checkDomainReadiness } from './worldbuilding-readiness.js';

export interface GenerateGuardContext {
	projectId: string;
	domainCounts: Record<WorldbuildingDomainId, number>;
}

export interface GenerateGuardResult {
	allowed: boolean;
	reason: string | null;
}

export function canGenerateDomain(
	domainId: WorldbuildingDomainId,
	context: GenerateGuardContext,
): GenerateGuardResult {
	if (!context.projectId) {
		return { allowed: false, reason: 'No project loaded' };
	}

	const readiness = checkDomainReadiness(domainId, context.domainCounts);
	if (!readiness.allowed) {
		const missing = readiness.missingDeps.join(', ');
		return { allowed: false, reason: `Requires ${missing} to have at least one record` };
	}

	return { allowed: true, reason: null };
}

function openNovaForDomain(projectId: string, domainId: WorldbuildingDomainId): void {
	const config = WORLDBUILDING_DOMAIN_SEQUENCE.find((d) => d.id === domainId);
	if (!config) return;

	const seed = PROMPT_SEEDS[config.promptSeedKey];
	const prompt = seed ? `${seed.task}\n\n(Domain: ${config.label})` : `Help me generate ${config.label} for my world.`;

	novaMode.loadForProject(projectId);
	novaMode.setMode('write');
	novaPanel.openWithPrompt(prompt);
}

export function generatePersonaeWithNova(projectId: string): void {
	openNovaForDomain(projectId, 'personae');
}

export function generateAtlasWithNova(projectId: string): void {
	openNovaForDomain(projectId, 'atlas');
}

export function generateArchiveWithNova(projectId: string): void {
	openNovaForDomain(projectId, 'archive');
}

export function generateThreadsWithNova(projectId: string): void {
	openNovaForDomain(projectId, 'threads');
}

export function generateChroniclesWithNova(projectId: string): void {
	openNovaForDomain(projectId, 'chronicles');
}

export function generateDomainWithNova(projectId: string, domainId: WorldbuildingDomainId): void {
	openNovaForDomain(projectId, domainId);
}
