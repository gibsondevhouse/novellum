import { db } from '$lib/server/db/index.js';
import { getAppliedMigrations } from '$lib/server/db/migration-runner.js';
import { createRunLedgerRepository } from '$lib/server/agent-runtime/run-ledger.js';
import { redactRuntimePayload } from '$lib/server/agent-runtime/redaction.js';
import {
	ACTIVE_PROVIDER_KEY,
	OLLAMA_BASE_URL_KEY,
	OLLAMA_MODEL_KEY,
} from '$lib/ai/provider-config.js';
import { getPreference } from '$lib/server/preferences/preferences-service.js';

export interface SupportBundle {
	version: string;
	timestamp: string;
	environment: {
		platform: string;
		nodeVersion: string;
	};
	schema: {
		version: number;
		migrations: Array<{ version: number; name: string; appliedAt: string }>;
	};
	agentRuntime: {
		recentRuns: any[];
		stats: {
			totalRuns: number;
			failedRuns: number;
			completedRuns: number;
		};
	};
	aiConfig: {
		activeProvider: string;
		ollamaBaseUrl: string;
		ollamaModel: string;
	};
}

/**
 * Generates a redacted support bundle for diagnostics.
 */
export async function generateSupportBundle(projectId?: string): Promise<SupportBundle> {
	const repository = createRunLedgerRepository();
	const appliedMigrations = getAppliedMigrations(db);
	const latestVersion = appliedMigrations.length > 0 ? appliedMigrations[appliedMigrations.length - 1].version : 0;

	const recentRuns = repository.listRuns({ projectId, limit: 10 });
	const runDetails = await Promise.all(
		recentRuns.map((run) => repository.getRunDetails(run.id))
	);

	// Redact everything again just to be safe, although the repository should have already done it.
	const redactedRuns = runDetails.map((details) => {
		if (!details) return null;
		return redactRuntimePayload(details).redacted;
	}).filter(Boolean);

	const stats = db.prepare(`
		SELECT 
			COUNT(*) as total,
			SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
			SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
		FROM agent_runs
		${projectId ? 'WHERE projectId = ?' : ''}
	`).get(projectId ? [projectId] : []) as { total: number; failed: number; completed: number };

	return {
		version: '1.0.0', // App version should be dynamic in a real app
		timestamp: new Date().toISOString(),
		environment: {
			platform: process.platform,
			nodeVersion: process.version,
		},
		schema: {
			version: latestVersion,
			migrations: appliedMigrations.map(m => ({ version: m.version, name: m.name, appliedAt: m.applied_at })),
		},
		agentRuntime: {
			recentRuns: redactedRuns,
			stats: {
				totalRuns: stats.total,
				failedRuns: stats.failed,
				completedRuns: stats.completed,
			},
		},
		aiConfig: {
			activeProvider: getPreference<string>(ACTIVE_PROVIDER_KEY) ?? 'openrouter',
			ollamaBaseUrl: getPreference<string>(OLLAMA_BASE_URL_KEY) ?? 'http://127.0.0.1:11434',
			ollamaModel: getPreference<string>(OLLAMA_MODEL_KEY) ?? 'llama3',
		},
	};
}
