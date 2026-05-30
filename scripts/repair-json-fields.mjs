#!/usr/bin/env node

import { existsSync } from 'node:fs';
import Database from 'better-sqlite3';

const TABLE_COLUMNS = {
	locations: ['tags', 'notableFeatures', 'landmarkIds', 'factionIds', 'characterIds', 'threadIds'],
	characters: ['aliases', 'anomalies', 'traits', 'goals', 'flaws', 'arcs', 'tags'],
	lore_entries: ['tags'],
	plot_threads: ['relatedSceneIds', 'relatedCharacterIds'],
	timeline_events: ['relatedCharacterIds', 'relatedSceneIds'],
};

function printUsage() {
	console.log('Usage: node scripts/repair-json-fields.mjs [--db-path <path>] [--dry-run]');
	console.log('');
	console.log('Options:');
	console.log('  --db-path <path>  SQLite DB path (default: $NOVELLUM_DB_PATH or ./novellum.db)');
	console.log('  --dry-run         Report rows that would be repaired without writing updates');
	console.log('  -h, --help        Show this help text');
}

function parseArgs(argv) {
	let dbPath = process.env.NOVELLUM_DB_PATH || './novellum.db';
	let dryRun = false;

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (arg === '--db-path') {
			const next = argv[i + 1];
			if (!next) throw new Error('Missing value for --db-path');
			dbPath = next;
			i += 1;
			continue;
		}
		if (arg.startsWith('--db-path=')) {
			dbPath = arg.slice('--db-path='.length);
			if (!dbPath) throw new Error('Missing value for --db-path');
			continue;
		}
		if (arg === '--dry-run') {
			dryRun = true;
			continue;
		}
		if (arg === '-h' || arg === '--help') {
			printUsage();
			process.exit(0);
		}
		throw new Error(`Unknown argument: ${arg}`);
	}

	return { dbPath, dryRun };
}

function ensureDatabaseExists(dbPath) {
	if (dbPath === ':memory:' || dbPath.startsWith(':')) return;
	if (!existsSync(dbPath)) {
		throw new Error(`Database file not found: ${dbPath}`);
	}
}

function repairDoubleEncodedValue(raw) {
	if (typeof raw !== 'string') return null;
	let once;
	try {
		once = JSON.parse(raw);
	} catch {
		return null;
	}

	if (typeof once !== 'string') return null;

	let twice;
	try {
		twice = JSON.parse(once);
	} catch {
		return null;
	}

	if (!Array.isArray(twice)) return null;
	return JSON.stringify(twice);
}

function run() {
	const { dbPath, dryRun } = parseArgs(process.argv.slice(2));
	ensureDatabaseExists(dbPath);

	const db = new Database(dbPath);
	db.pragma('foreign_keys = ON');

	let totalRepairedCells = 0;
	let totalTouchedRows = 0;

	console.log(`Scanning DB: ${dbPath}`);
	console.log(dryRun ? 'Mode: dry-run (no writes)' : 'Mode: apply repairs');
	console.log('');

	for (const [table, columns] of Object.entries(TABLE_COLUMNS)) {
		const quotedColumns = columns.map((column) => `"${column}"`).join(', ');
		const rows = db.prepare(`SELECT id, ${quotedColumns} FROM "${table}"`).all();

		const updateStatements = Object.fromEntries(
			columns.map((column) => [
				column,
				db.prepare(`UPDATE "${table}" SET "${column}" = ? WHERE id = ?`),
			]),
		);

		let repairedCells = 0;
		const touchedRows = new Set();

		for (const row of rows) {
			const rowId = String(row.id);
			for (const column of columns) {
				const nextValue = repairDoubleEncodedValue(row[column]);
				if (nextValue == null || nextValue === row[column]) continue;

				repairedCells += 1;
				touchedRows.add(rowId);

				if (!dryRun) {
					updateStatements[column].run(nextValue, rowId);
				}
			}
		}

		totalRepairedCells += repairedCells;
		totalTouchedRows += touchedRows.size;

		console.log(
			`${table}: scanned ${rows.length} row(s), repaired ${repairedCells} field(s) across ${touchedRows.size} row(s)`,
		);
	}

	db.close();

	console.log('');
	console.log(
		dryRun
			? `Dry-run complete. ${totalRepairedCells} field(s) in ${totalTouchedRows} row(s) would be repaired.`
			: `Repair complete. ${totalRepairedCells} field(s) in ${totalTouchedRows} row(s) repaired.`,
	);
}

try {
	run();
} catch (error) {
	const message = error instanceof Error ? error.message : String(error);
	console.error(`repair-json-fields: ${message}`);
	process.exit(1);
}
