import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateSupportBundle } from '$lib/server/diagnostics/agent-runtime-diagnostics.js';
import * as migrationRunner from '$lib/server/db/migration-runner.js';
import { createRunLedgerRepository } from '$lib/server/agent-runtime/run-ledger.js';
import { db } from '$lib/server/db/index.js';

vi.mock('$lib/server/db/migration-runner.js', () => ({
	getAppliedMigrations: vi.fn(() => [{ version: 1, name: 'baseline', applied_at: '2026-06-11T00:00:00Z' }]),
}));

vi.mock('$lib/server/db/index.js', () => ({
	db: {
		prepare: vi.fn(() => ({
			get: vi.fn(() => ({ total: 10, failed: 2, completed: 8 })),
			all: vi.fn(() => []),
		})),
	},
}));

describe('Agent Runtime Diagnostics', () => {
	it('should generate a redacted support bundle', async () => {
		const bundle = await generateSupportBundle();

		expect(bundle.version).toBeDefined();
		expect(bundle.timestamp).toBeDefined();
		expect(bundle.environment.platform).toBeDefined();
		expect(bundle.schema.version).toBe(1);
		expect(bundle.agentRuntime.stats.totalRuns).toBe(10);
		expect(bundle.aiConfig.activeProvider).toBeDefined();
	});
});
