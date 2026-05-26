/**
 * plan-027 stage-003 phase-003 part-002 — revision-pack card source
 * contract test.
 *
 * Source-string assertion (matching the repo convention; see
 * `tests/components/chat-interface-agentic-empty-state.test.ts`).
 * Locks the severity-sort, per-issue Acknowledge action, ARIA, and
 * no-manuscript-write guardrails.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const SOURCE_PATH = resolve(
	process.cwd(),
	'src/modules/nova/components/NovaRevisionPackCard.svelte',
);
const source = readFileSync(SOURCE_PATH, 'utf-8');

describe('NovaRevisionPackCard source contract', () => {
	it('sorts issues by severity using the shared AUTHOR_SEVERITY_ORDER', () => {
		expect(source).toContain('AUTHOR_SEVERITY_ORDER');
		expect(source).toContain('[...payload.issues].sort(');
		expect(source).toContain('AUTHOR_SEVERITY_ORDER[a.severity]');
		expect(source).toContain('AUTHOR_SEVERITY_ORDER[b.severity]');
	});

	it('renders a per-issue Acknowledge action with an ARIA label', () => {
		expect(source).toContain('aria-label={`Acknowledge revision issue ${issue.id}`}');
		expect(source).toContain('handleAcknowledge(issue.id)');
		expect(source).toContain("data-testid=\"nova-revision-acknowledge\"");
		expect(source).toContain('Acknowledged');
	});

	it('emits a callback rather than mutating the manuscript', () => {
		expect(source).toContain('onAcknowledge?:');
		expect(source).toContain('onAcknowledge?.(issueId, envelope)');
		expect(source).not.toMatch(/from ['"][^'"]*editor[^'"]*['"]/);
		expect(source).not.toMatch(/\binsertText\b|\bapplyEdit\b|manuscriptStore|editorStore/);
	});

	it('exposes the issue metadata reviewers need', () => {
		expect(source).toContain('issue.severity');
		expect(source).toContain('issue.kind');
		expect(source).toContain('issue.location');
		expect(source).toContain('issue.description');
		expect(source).toContain('issue.recommendation');
	});

	it('uses Svelte 5 Runes only', () => {
		expect(source).toContain('$props()');
		expect(source).toContain('$state');
		expect(source).toContain('$derived');
		expect(source).not.toMatch(/export let /);
		expect(source).not.toMatch(/\n\t*\$:/);
	});

	it('uses only design tokens for visual values', () => {
		expect(source).toContain('var(--color-surface-overlay)');
		expect(source).toContain('var(--radius-md)');
		expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
	});
});
