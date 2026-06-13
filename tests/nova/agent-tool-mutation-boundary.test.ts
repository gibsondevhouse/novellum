/**
 * plan-045 — Agent tool mutation boundary source contracts.
 *
 * These tests complement registry/runtime coverage by keeping mutation
 * command registrations isolated from the model-callable tool module.
 */
import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const SRC_ROOT = path.resolve(__dirname, '../../src');

function readSource(relPath: string): string {
	return fs.readFileSync(path.join(SRC_ROOT, relPath), 'utf8');
}

function expectToolCapability(source: string, toolId: string, capability: string): void {
	const pattern = new RegExp(
		`id:\\s*['"]${toolId.replace('.', '\\.')}['"][\\s\\S]*?capability:\\s*['"]${capability}['"]`,
	);
	expect(pattern.test(source), `${toolId} must declare capability ${capability}`).toBe(true);
}

describe('Agent tool mutation boundary', () => {
	const modelCallableSource = readSource('modules/nova/services/agent-tools.ts');
	const mutationSource = readSource('modules/nova/services/agent-mutation-tools.ts');
	const authorDraftCardSource = readSource('modules/nova/components/NovaAuthorDraftCheckpointCard.svelte');
	const outlineCardSource = readSource('modules/nova/components/NovaOutlineDraftCheckpointCard.svelte');
	const outlineActionsSource = readSource('modules/nova/services/outline-checkpoint-actions.ts');
	const worldbuildProposalCardSource = readSource(
		'modules/world-building/components/WorldbuildingProposalCard.svelte',
	);
	const worldbuildStoreSource = readSource(
		'modules/world-building/stores/world-building-store.svelte.ts',
	);
	const registrySource = readSource('modules/nova/services/tool-registry.ts');
	const routerSource = readSource('modules/nova/services/tool-router.ts');
	const agentLoopSource = readSource('modules/nova/services/agent-loop.ts');
	const chatServiceSource = readSource('modules/nova/services/chat-service.ts');

	it('keeps accept/reject helpers out of the model-callable tool module', () => {
		expect(modelCallableSource).not.toMatch(/acceptSceneDraftCheckpoint|rejectSceneDraftCheckpoint/);
		expect(modelCallableSource).not.toContain('authorDraft.accept_checkpoint');
		expect(modelCallableSource).not.toContain('authorDraft.reject_checkpoint');
	});

	it('declares accept/reject tools as mutation commands in the mutation module', () => {
		expectToolCapability(mutationSource, 'authorDraft.accept_checkpoint', 'mutation_command');
		expectToolCapability(mutationSource, 'authorDraft.reject_checkpoint', 'mutation_command');
	});

	it('keeps review-artifact generation model-callable but distinct from mutation commands', () => {
		expectToolCapability(
			modelCallableSource,
			'authorDraft.generate_scene_draft_checkpoint',
			'review_artifact_generation',
		);
		expect(modelCallableSource).toContain('authorDraft.generate_scene_draft_checkpoint');
	});

	it('routes model advertisement through listModelCallableTools', () => {
		expect(registrySource).toContain('export function listModelCallableTools');
		expect(agentLoopSource).toContain('listModelCallableTools()');
		expect(chatServiceSource).toContain('listModelCallableTools()');
	});

	it('blocks mutation command dispatch by default', () => {
		expect(routerSource).toContain("tool.definition.capability === 'mutation_command'");
		expect(routerSource).toContain('allowMutationCommands');
	});

	it('keeps author-draft accept/reject behind visible checkpoint-card actions', () => {
		expect(authorDraftCardSource).toContain('acceptSceneDraftCheckpoint');
		expect(authorDraftCardSource).toContain('rejectSceneDraftCheckpoint');
		expect(authorDraftCardSource).toContain('function handleBeginAccept');
		expect(authorDraftCardSource).toContain('function handleConfirmAccept');
		expect(authorDraftCardSource).toContain('function handleBeginReject');
		expect(authorDraftCardSource).toContain('async function handleReject');
		expect(authorDraftCardSource).toContain('onclick={handleBeginAccept}');
		expect(authorDraftCardSource).toContain('onclick={handleBeginReject}');
		expect(authorDraftCardSource).toContain("code === 'stale_target'");
		expect(authorDraftCardSource).toContain('editorConflict');
	});

	it('keeps outline accept/reject behind outline review card actions', () => {
		expect(modelCallableSource).not.toMatch(/acceptOutline|rejectOutline|outline\/checkpoints\/.*accept/);
		expect(outlineCardSource).toContain('actions.accept');
		expect(outlineCardSource).toContain('actions.reject');
		expect(outlineCardSource).toContain('handleBeginAccept');
		expect(outlineCardSource).toContain('handleConfirmAccept');
		expect(outlineCardSource).toContain('handleBeginReject');
		expect(outlineCardSource).toContain('handleReject');
		expect(outlineActionsSource).toContain('acceptOutlineDraftCheckpointAction');
		expect(outlineActionsSource).toContain('rejectOutlineDraftCheckpointAction');
	});

	it('keeps worldbuilding accept/reject behind UI callbacks and store actions', () => {
		expect(modelCallableSource).not.toMatch(/acceptWorldbuild|rejectWorldbuild|acceptProposal|rejectProposal/);
		expect(worldbuildProposalCardSource).toContain('onAccept?.(proposal.proposalId, proposal.projectId)');
		expect(worldbuildProposalCardSource).toContain('onReject?.(proposal.proposalId, reason, proposal.projectId)');
		expect(worldbuildStoreSource).toContain('acceptStagedWorldbuildCheckpoint');
		expect(worldbuildStoreSource).toContain('rejectStagedWorldbuildCheckpoint');
	});
});
