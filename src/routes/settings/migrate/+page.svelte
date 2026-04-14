<script lang="ts">
	import { onMount } from 'svelte';
	import { preCheck, migrate } from '$lib/migration/index.js';
	import type { PreCheckResult, MigrationError } from '$lib/migration/index.js';

	type TableStatus = 'pending' | 'migrating' | 'done' | 'error';

	interface TableState {
		table: string;
		dexieCount: number;
		sqliteCount: number;
		migrated: number;
		errors: number;
		status: TableStatus;
	}

	let phase: 'loading' | 'precheck' | 'migrating' | 'complete' | 'error' = $state('loading');
	let tables: TableState[] = $state([]);
	let totalMigrated = $state(0);
	let totalErrors = $state(0);
	let migrationErrors: MigrationError[] = $state([]);
	let hasConflict = $derived(tables.some((t) => t.sqliteCount > 0));
	let hasDexieData = $derived(tables.some((t) => t.dexieCount > 0));
	let confirmed = $state(false);
	let showErrors = $state(false);

	onMount(async () => {
		try {
			const results: PreCheckResult[] = await preCheck();
			tables = results.map((r) => ({
				table: r.table,
				dexieCount: r.dexieCount,
				sqliteCount: r.sqliteCount,
				migrated: 0,
				errors: 0,
				status: 'pending' as TableStatus,
			}));
			phase = 'precheck';
		} catch {
			phase = 'error';
		}
	});

	async function startMigration() {
		phase = 'migrating';

		const result = await migrate({
			onTableStart(table, _count) {
				const idx = tables.findIndex((t) => t.table === table);
				if (idx >= 0) {
					tables[idx].status = 'migrating';
				}
			},
			onTableComplete(table, migrated, errors) {
				const idx = tables.findIndex((t) => t.table === table);
				if (idx >= 0) {
					tables[idx].migrated = migrated;
					tables[idx].errors = errors;
					tables[idx].status = errors > 0 ? 'error' : 'done';
				}
			},
			onError(table, entityId, message) {
				migrationErrors.push({ table, entityId, message });
			},
		});

		totalMigrated = result.rowsMigrated;
		totalErrors = result.errors.length;
		phase = 'complete';
	}
</script>

<div class="migrate-page">
	<h1>Migrate Data</h1>
	<p class="subtitle">Transfer existing browser data (IndexedDB) to the shared SQLite database.</p>

	{#if phase === 'loading'}
		<p class="status-msg">Checking databases…</p>
	{:else if phase === 'error'}
		<p class="status-msg error">Failed to check databases. Make sure the server is running.</p>
	{:else if phase === 'precheck'}
		{#if hasConflict}
			<div class="warning-banner" role="alert">
				<strong>Warning:</strong> SQLite already contains data. Starting migration will overwrite existing
				records with matching IDs.
			</div>
		{/if}

		{#if !hasDexieData}
			<p class="status-msg">No data found in the browser database. Nothing to migrate.</p>
		{/if}

		<table class="data-table">
			<thead>
				<tr>
					<th>Table</th>
					<th>Browser Rows</th>
					<th>SQLite Rows</th>
				</tr>
			</thead>
			<tbody>
				{#each tables as t (t.table)}
					<tr>
						<td>{t.table}</td>
						<td class="num">{t.dexieCount}</td>
						<td class="num">{t.sqliteCount}</td>
					</tr>
				{/each}
			</tbody>
		</table>

		{#if hasDexieData}
			{#if hasConflict}
				<label class="confirm-label">
					<input type="checkbox" bind:checked={confirmed} />
					I understand existing SQLite records may be overwritten.
				</label>
			{/if}

			<button class="btn-primary" disabled={hasConflict && !confirmed} onclick={startMigration}>
				Start Migration
			</button>
		{/if}
	{:else if phase === 'migrating' || phase === 'complete'}
		<table class="data-table">
			<thead>
				<tr>
					<th>Table</th>
					<th>Browser Rows</th>
					<th>Migrated</th>
					<th>Errors</th>
					<th>Status</th>
				</tr>
			</thead>
			<tbody>
				{#each tables as t (t.table)}
					<tr>
						<td>{t.table}</td>
						<td class="num">{t.dexieCount}</td>
						<td class="num">{t.migrated}</td>
						<td class="num">{t.errors}</td>
						<td>
							<span class="status-badge {t.status}">{t.status}</span>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>

		{#if phase === 'complete'}
			<div class="summary">
				<p>
					<strong>Migration complete.</strong>
					{totalMigrated} rows migrated.
					{#if totalErrors > 0}
						{totalErrors} error{totalErrors === 1 ? '' : 's'} encountered.
					{/if}
				</p>

				{#if totalErrors > 0}
					<button class="btn-secondary" onclick={() => (showErrors = !showErrors)}>
						{showErrors ? 'Hide' : 'Show'} error details
					</button>

					{#if showErrors}
						<ul class="error-list">
							{#each migrationErrors as e (e.entityId)}
								<li><strong>{e.table}</strong> ({e.entityId}): {e.message}</li>
							{/each}
						</ul>
					{/if}
				{/if}

				<a href="/projects" class="btn-primary">Go to Projects</a>
			</div>
		{:else}
			<p class="status-msg">Migrating…</p>
		{/if}
	{/if}
</div>

<style>
	.migrate-page {
		max-width: 48rem;
		margin: 0 auto;
		padding: var(--space-6) var(--space-4);
	}

	h1 {
		font-size: var(--text-2xl);
		font-weight: var(--font-weight-bold);
		margin-bottom: var(--space-2);
	}

	.subtitle {
		color: var(--color-text-secondary);
		margin-bottom: var(--space-6);
	}

	.status-msg {
		color: var(--color-text-secondary);
		padding: var(--space-4) 0;
	}

	.status-msg.error {
		color: var(--color-danger);
	}

	.warning-banner {
		background: var(--color-warning-bg, rgba(255, 200, 50, 0.12));
		border: 1px solid var(--color-warning, #e6a817);
		border-radius: var(--radius-md);
		padding: var(--space-3) var(--space-4);
		margin-bottom: var(--space-4);
		font-size: var(--text-sm);
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
		margin-bottom: var(--space-4);
		font-size: var(--text-sm);
	}

	.data-table th,
	.data-table td {
		text-align: left;
		padding: var(--space-2) var(--space-3);
		border-bottom: 1px solid var(--color-border-default);
	}

	.data-table th {
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.num {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.confirm-label {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
		font-size: var(--text-sm);
		cursor: pointer;
	}

	.btn-primary {
		display: inline-block;
		background: var(--color-nova-blue);
		color: var(--color-text-primary);
		border: none;
		border-radius: var(--radius-sm);
		padding: var(--space-2) var(--space-4);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
		text-decoration: none;
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: transparent;
		color: var(--color-text-secondary);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		padding: var(--space-1) var(--space-3);
		font-size: var(--text-xs);
		cursor: pointer;
		margin-bottom: var(--space-2);
	}

	.status-badge {
		display: inline-block;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
	}

	.status-badge.pending {
		color: var(--color-text-secondary);
	}

	.status-badge.migrating {
		color: var(--color-nova-blue);
	}

	.status-badge.done {
		color: var(--color-success, #34d399);
	}

	.status-badge.error {
		color: var(--color-danger);
	}

	.summary {
		margin-top: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		align-items: flex-start;
	}

	.error-list {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		list-style: disc;
		padding-left: var(--space-4);
		max-height: 16rem;
		overflow-y: auto;
	}
</style>
