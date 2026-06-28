/**
 * plan-028 stage-001 phase-003 part-001 — scope header + detail shell
 * source contract tests.
 *
 * Repository convention: source-string assertions for Svelte component
 * behavior contracts (no @testing-library/svelte dependency).
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const SUMMARY_BAR_PATH = resolve(
	process.cwd(),
	'src/modules/outline/components/OutlineSummaryBar.svelte',
);
const WORKSPACE_SHELL_PATH = resolve(process.cwd(), 'src/lib/components/ui/WorkspaceShell.svelte');
const OUTLINE_PAGE_PATH = resolve(process.cwd(), 'src/routes/projects/[id]/outline/+page.svelte');

const summaryBarSource = readFileSync(SUMMARY_BAR_PATH, 'utf-8');
const workspaceShellSource = readFileSync(WORKSPACE_SHELL_PATH, 'utf-8');
const outlinePageSource = readFileSync(OUTLINE_PAGE_PATH, 'utf-8');

describe('pipeline scope header shell source contract', () => {
	it('renders active layer/path summary and readiness state in OutlineSummaryBar', () => {
		expect(summaryBarSource).toContain('Focus: {currentLayerLabel}');
		expect(summaryBarSource).toContain("pathSegments.join(' / ')");
		expect(summaryBarSource).toContain('data-readiness={readiness}');
		expect(summaryBarSource).toContain('readinessLabel');
	});

	it('gates stage action region behind explicit stage-selection flag', () => {
		expect(summaryBarSource).toContain('{#if showStageActions}');
		expect(summaryBarSource).toContain('data-testid="stage-action-region"');
		expect(summaryBarSource).toContain('aria-label="Run stage orchestration"');
		expect(outlinePageSource).toContain(
			'const showStageActionRegion = $derived(Boolean(selectedStage));',
		);
		expect(outlinePageSource).toContain('showStageActions={showStageActionRegion}');
	});

	it('adds shared mainHeader slot support in WorkspaceShell', () => {
		expect(workspaceShellSource).toContain('mainHeader?: Snippet;');
		expect(workspaceShellSource).toContain('{#if mainHeader}');
		expect(workspaceShellSource).toContain('workspace-shell__main-header');
		expect(workspaceShellSource).toContain('workspace-shell__main-content');
	});

	it('wires outline page through the shared mainHeader shell slot', () => {
		expect(outlinePageSource).toContain('{#snippet mainHeader()}');
		expect(outlinePageSource).toContain('<OutlineSummaryBar');
		expect(outlinePageSource).toContain('currentLayerLabel={currentLayerLabel}');
		expect(outlinePageSource).toContain('pathSegments={pathSegments}');
	});

	it('uses Svelte 5 runes only (no Svelte 4 reactive labels)', () => {
		expect(summaryBarSource).not.toMatch(/\n\t*\$:/);
		expect(workspaceShellSource).not.toMatch(/\n\t*\$:/);
		expect(outlinePageSource).not.toMatch(/\n\t*\$:/);
	});
});
