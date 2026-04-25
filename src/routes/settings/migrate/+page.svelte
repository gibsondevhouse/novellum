<script lang="ts">
	import { onMount } from 'svelte';
	import { preCheck, migrate } from '$lib/migration/index.js';
	import type { PreCheckResult, MigrationError } from '$lib/migration/index.js';
	import { PrimaryButton, SecondaryButton, PageHeader } from '$lib/components/ui/index.js';

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
	<PageHeader
		eyebrow="Data Portability"
		title="Migrate Data"
		description="Transfer existing browser data (IndexedDB) to the shared SQLite database."
	>
		{#snippet meta()}
			<div class="migrate-summary">
				<div class="summary-item">
					<span>Phase</span>
					<strong>{phase}</strong>
				</div>
				<div class="summary-item">
					<span>Tables</span>
					<strong>{tables.length}</strong>
				</div>
			</div>
		{/snippet}
	</PageHeader>

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

			<PrimaryButton disabled={hasConflict && !confirmed} onclick={startMigration}>
				Start Migration
			</PrimaryButton>
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
			<SecondaryButton onclick={() => (showErrors = !showErrors)}>
						{showErrors ? 'Hide' : 'Show'} error details
			</SecondaryButton>

					{#if showErrors}
						<ul class="error-list">
							{#each migrationErrors as e (e.entityId)}
								<li><strong>{e.table}</strong> ({e.entityId}): {e.message}</li>
							{/each}
						</ul>
					{/if}
				{/if}

				<PrimaryButton href="/projects">Go to Projects</PrimaryButton>
			</div>
		{:else}
			<p class="status-msg">Migrating…</p>
		{/if}
	{/if}
</div>

<style>
	.migrate-page {
		max-width: 56rem;
		margin: 0 auto;
		padding: var(--space-6) 0 var(--space-10);
		display: grid;
		gap: var(--space-5);
	}

	.migrate-page :global(.page-header) {
		padding: var(--space-5);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-xl);
		background: linear-gradient(165deg, var(--color-surface-overlay), var(--color-surface-ground));
		margin-bottom: var(--space-2);
	}

	.migrate-summary {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-3);
		min-width: 14rem;
	}

	.summary-item {
		display: grid;
		gap: 0.2rem;
		padding: var(--space-3);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-lg);
		background: color-mix(in srgb, var(--color-surface-overlay) 80%, transparent);
	}

	.summary-item span {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}

	.summary-item strong {
		font-size: var(--text-sm);
		text-transform: capitalize;
	}

	.status-msg {
		color: var(--color-text-secondary);
		padding: var(--space-4) 0;
	}

	.status-msg.error {
		color: var(--color-danger);
	}

	.warning-banner {
		background: color-mix(in srgb, var(--color-warning) 12%, transparent);
		border: 1px solid var(--color-warning);
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
		color: var(--color-success);
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

	@media (max-width: 760px) {
		.migrate-hero {
			flex-direction: column;
		}

		.migrate-summary {
			width: 100%;
			min-width: 0;
		}
	}
</style>
