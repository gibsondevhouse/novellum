import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const RUNNER_PATH = resolve(
	process.cwd(),
	'src/modules/outline/services/worldbuild-pipeline-runner.ts',
);
const runnerSource = readFileSync(RUNNER_PATH, 'utf-8');

describe('worldbuild pipeline runner source contract', () => {
	it('exports typed run input with stage key, projectId, hierarchy path, and optional instruction', () => {
		expect(runnerSource).toContain('export interface WorldbuildRunInput');
		expect(runnerSource).toContain('taskKey: WorldbuildTaskKey');
		expect(runnerSource).toContain('projectId: string');
		expect(runnerSource).toContain('hierarchyPath: PipelineHierarchyPath');
		expect(runnerSource).toContain('instruction?: string');
		expect(runnerSource).toContain('options?: Record<string, unknown>');
	});

	it('exports discriminated run result with artifact envelope + checkpoint on success', () => {
		expect(runnerSource).toContain('export type WorldbuildRunResult');
		expect(runnerSource).toContain('ok: true');
		expect(runnerSource).toContain('artifact: PipelineArtifactEnvelope<WorldbuildPayload>');
		expect(runnerSource).toContain('checkpoint: WorldbuildCheckpointRecord');
	});

	it('exports deterministic error reasons for UI-safe failure states', () => {
		expect(runnerSource).toContain('export type WorldbuildRunErrorReason');
		expect(runnerSource).toContain("'invalid_task'");
		expect(runnerSource).toContain("'invalid_path'");
		expect(runnerSource).toContain("'parse_failed'");
		expect(runnerSource).toContain("'transport_failed'");
		expect(runnerSource).toContain("'checkpoint_staging_failed'");
		expect(runnerSource).toContain("'duplicate_run'");
	});

	it('validates stageId and arcId are present before allowing a run', () => {
		expect(runnerSource).toContain('export function validateRunInput');
		expect(runnerSource).toContain('hierarchyPath.stageId === undefined');
		expect(runnerSource).toContain('hierarchyPath.stageId === null');
		expect(runnerSource).toContain('hierarchyPath.arcId === undefined');
		expect(runnerSource).toContain('hierarchyPath.arcId === null');
	});

	it('guards against duplicate concurrent runs', () => {
		expect(runnerSource).toContain('export function isRunning');
		expect(runnerSource).toContain('activeRunKey !== null');
		expect(runnerSource).toContain("reason: 'duplicate_run'");
	});

	it('builds run payload with pipeline action prefix and projectId', () => {
		expect(runnerSource).toContain('export function buildRunPayload');
		expect(runnerSource).toContain('PIPELINE_ACTION_PREFIX');
		expect(runnerSource).toContain('projectId: input.projectId');
	});

	it('sends task request to /api/ai and parses response via worldbuild agent', () => {
		expect(runnerSource).toContain("fetch('/api/ai'");
		expect(runnerSource).toContain('createWorldbuildArtifactFromModelOutput');
	});

	it('stages parsed artifact as draft checkpoint via project-metadata API', () => {
		expect(runnerSource).toContain('upsertWorldbuildCheckpoint');
		expect(runnerSource).toContain("lifecycle: 'draft'");
		expect(runnerSource).toContain('WORLDBUILD_CHECKPOINT_OWNER_ID');
		expect(runnerSource).toContain('PIPELINE_CHECKPOINT_SCHEMA_VERSION');
	});

	it('builds hierarchy references from the active path for artifact metadata', () => {
		expect(runnerSource).toContain('function buildHierarchyReferences');
		expect(runnerSource).toContain('path.arcId');
		expect(runnerSource).toContain('path.stageId');
		expect(runnerSource).toContain('hierarchyReferences:');
	});

	it('clears activeRunKey in finally block to prevent stale lock', () => {
		expect(runnerSource).toContain('} finally {');
		expect(runnerSource).toContain('activeRunKey = null');
	});

	it('does not import server-only modules', () => {
		expect(runnerSource).not.toContain('better-sqlite3');
		expect(runnerSource).not.toContain('$lib/server/');
		expect(runnerSource).not.toContain('checkpoint-service.js');
	});

	it('exports WorldbuildRunStatus type for external status tracking', () => {
		expect(runnerSource).toContain('export type WorldbuildRunStatus');
	});

	it('returns error result for invalid path without network call', () => {
		expect(runnerSource).toContain("reason: 'invalid_path'");
		expect(runnerSource).toContain('validateRunInput(input)');
	});

	it('returns error result for invalid task key without network call', () => {
		expect(runnerSource).toContain("reason: 'invalid_task'");
	});
});
