/**
 * plan-027 stage-003 phase-003 part-002 — scene-draft card source
 * contract test.
 *
 * The Novellum component test convention is source-string assertion
 * (the repo does not install `@testing-library/svelte`). These checks
 * lock the explicit-action guardrail: Accept / Reject / Copy are the
 * only user-driven affordances, each has an ARIA label, and no
 * manuscript-mutating import sneaks in.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const SOURCE_PATH = resolve(
	process.cwd(),
	'src/modules/nova/components/NovaSceneDraftCard.svelte',
);
const source = readFileSync(SOURCE_PATH, 'utf-8');

describe('NovaSceneDraftCard source contract', () => {
	it('exposes Accept, Reject, and Copy controls with ARIA labels', () => {
		expect(source).toContain('aria-label="Save scene draft as checkpoint for review and confirmation"');
		expect(source).toContain('aria-label="Reject scene draft"');
		expect(source).toContain('aria-label="Copy drafted prose to clipboard"');
		expect(source).toContain(": 'Accept'");
		expect(source).toContain(": 'Reject'");
	});

	it('awaits callbacks rather than mutating the manuscript optimistically', () => {
		expect(source).toContain('onAccept?:');
		expect(source).toContain('onConfirmAccept?:');
		expect(source).toContain('onReject?:');
		expect(source).toContain('await onAccept(envelope)');
		expect(source).toContain('await onConfirmAccept(envelope, stagedCheckpoint');
		expect(source).toContain('await onReject(envelope)');
		expect(source).not.toContain('Marked as accepted');
		// Guardrail: no editor-store / manuscript-write imports or calls.
		expect(source).not.toMatch(/from ['"][^'"]*editor[^'"]*['"]/);
		expect(source).not.toMatch(/\binsertText\b|\bapplyEdit\b|manuscriptStore|editorStore/);
	});

	it('uses the clipboard API for Copy and never reaches into stores', () => {
		expect(source).toContain('navigator.clipboard');
		expect(source).toContain('writeText(payload.prose)');
	});

	it('renders sidecar metadata required by reviewers', () => {
		expect(source).toContain('sidecar.sceneId');
		expect(source).toContain('sidecar.wordCount');
		expect(source).toContain('sidecar.povCharacterId');
		expect(source).toContain('sidecar.uncertainties');
		expect(source).toContain('sidecar.continuityRisks');
	});

	it('uses Svelte 5 Runes only (no Svelte 4 reactivity)', () => {
		expect(source).toContain('$props()');
		expect(source).toContain('$state');
		expect(source).toContain('$derived');
		expect(source).not.toMatch(/export let /);
		expect(source).not.toMatch(/\n\t*\$:/);
	});

	it('uses only design tokens for visual values', () => {
		// Token enforcement is global via `pnpm check:tokens`, but lock
		// the card-local invariants here as a fast regression signal.
		expect(source).toContain('var(--color-surface-overlay)');
		expect(source).toContain('var(--radius-md)');
		expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
	});
});
