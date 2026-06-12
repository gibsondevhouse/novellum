/**
 * plan-031 stage-004 phase-006 part-002 — Agent-mode source contracts.
 *
 * Verifies that Nova tool-handling code does NOT import editor or
 * manuscript mutation paths. This prevents a class of bugs where a
 * future tool handler accidentally auto-applies content.
 *
 * Strategy: read the source text of agent-tools.ts and agent-loop.ts
 * and assert that forbidden import patterns are absent.
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const SRC_ROOT = path.resolve(__dirname, '../../src');

function readSource(relPath: string): string {
	return fs.readFileSync(path.join(SRC_ROOT, relPath), 'utf8');
}

// Paths to model-callable agent-mode tool files
const AGENT_FILES = [
	'modules/nova/services/agent-tools.ts',
	'modules/nova/services/agent-loop.ts',
];

// Forbidden import patterns: editor state mutation, manuscript writes
const FORBIDDEN_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
	{
		pattern: /from ['"].*editor.*mutation/,
		reason: 'editor mutation paths',
	},
	{
		pattern: /from ['"].*manuscript.*write/,
		reason: 'manuscript write paths',
	},
	{
		pattern: /from ['"].*modules\/editor/,
		reason: 'editor module direct imports',
	},
	{
		pattern: /from ['"].*scene-store/,
		reason: 'scene store (mutation surface)',
	},
	{
		pattern: /from ['"].*editor-store/,
		reason: 'editor store (mutation surface)',
	},
	{
		pattern: /applyProposal|applyArtifact|writeManuscript|mutateScene/,
		reason: 'manuscript mutation function names',
	},
	{
		pattern:
			/acceptSceneDraftCheckpoint|rejectSceneDraftCheckpoint|authorDraft\.accept_checkpoint|authorDraft\.reject_checkpoint/,
		reason: 'author-draft accept/reject mutation helpers or tool ids',
	},
];

function scanFile(file: string): void {
	describe(file, () => {
		const source = readSource(file);

		it('file exists and is readable', () => {
			expect(source.length).toBeGreaterThan(0);
		});

		for (const { pattern, reason } of FORBIDDEN_PATTERNS) {
			it(`does not import ${reason}`, () => {
				expect(
					pattern.test(source),
					`Found forbidden pattern "${pattern}" in ${file} (reason: ${reason})`,
				).toBe(false);
			});
		}
	});
}

describe('Agent tool source contracts — no editor/manuscript mutation imports', () => {
	for (const file of AGENT_FILES) {
		scanFile(file);
	}
});

describe('Agent tools are registered at module load', () => {
	it('agent-tools.ts exports registerAgentTools', () => {
		// Static check: source contains the export
		const source = readSource('modules/nova/services/agent-tools.ts');
		expect(source).toContain('export function registerAgentTools');
	});

	it('agent-tools.ts exports ProposalEnvelope', () => {
		const source = readSource('modules/nova/services/agent-tools.ts');
		expect(source).toContain('export interface ProposalEnvelope');
	});

	it('agent-mutation-tools.ts exports registerAgentMutationTools', () => {
		const source = readSource('modules/nova/services/agent-mutation-tools.ts');
		expect(source).toContain('export function registerAgentMutationTools');
	});

	it('agent-loop.ts exports MAX_AGENT_STEPS = 8', () => {
		const source = readSource('modules/nova/services/agent-loop.ts');
		expect(source).toContain('export const MAX_AGENT_STEPS = 8');
	});
});
