import type Database from 'better-sqlite3';
import { SCHEMA_SQL, INDEX_SQL } from './schema.js';

function ensureProjectsCoverUrlColumn(db: Database.Database): void {
	const columns = db.prepare('PRAGMA table_info(projects)').all() as Array<{ name: string }>;
	const hasCoverUrl = columns.some((column) => column.name === 'coverUrl');

	if (!hasCoverUrl) {
		db.exec("ALTER TABLE projects ADD COLUMN coverUrl TEXT NOT NULL DEFAULT ''");
	}
}

function ensureProjectsPromptColumns(db: Database.Database): void {
	const columns = db.prepare('PRAGMA table_info(projects)').all() as Array<{ name: string }>;
	const hasSystemPrompt = columns.some((column) => column.name === 'systemPrompt');

	if (!hasSystemPrompt) {
		db.exec("ALTER TABLE projects ADD COLUMN systemPrompt TEXT NOT NULL DEFAULT ''");
		db.exec("ALTER TABLE projects ADD COLUMN negativePrompt TEXT NOT NULL DEFAULT ''");
	}
}

function ensureProjectTypeAndLastOpened(db: Database.Database): void {
	const columns = db.prepare('PRAGMA table_info(projects)').all() as Array<{ name: string }>;

	if (!columns.some((c) => c.name === 'projectType')) {
		db.exec("ALTER TABLE projects ADD COLUMN projectType TEXT NOT NULL DEFAULT 'novel'");
	}
	if (!columns.some((c) => c.name === 'lastOpenedAt')) {
		db.exec("ALTER TABLE projects ADD COLUMN lastOpenedAt TEXT NOT NULL DEFAULT ''");
	}
}

function ensureStylePresetIdColumn(db: Database.Database): void {
	const columns = db.prepare('PRAGMA table_info(projects)').all() as Array<{ name: string }>;
	if (!columns.some((c) => c.name === 'stylePresetId')) {
		db.exec("ALTER TABLE projects ADD COLUMN stylePresetId TEXT NOT NULL DEFAULT ''");
	}
}

function ensureScenesNotesColumn(db: Database.Database): void {
	const columns = db.prepare('PRAGMA table_info(scenes)').all() as Array<{ name: string }>;
	if (!columns.some((c) => c.name === 'notes')) {
		db.exec("ALTER TABLE scenes ADD COLUMN notes TEXT NOT NULL DEFAULT ''");
	}
}

function ensureActsArcIdColumn(db: Database.Database): void {
	const columns = db.prepare('PRAGMA table_info(acts)').all() as Array<{ name: string }>;
	if (!columns.some((c) => c.name === 'arcId')) {
		db.exec('ALTER TABLE acts ADD COLUMN arcId TEXT');
	}
}

function ensureCharacterPresentationColumns(db: Database.Database): void {
	const columns = db.prepare('PRAGMA table_info(characters)').all() as Array<{ name: string }>;
	if (!columns.some((c) => c.name === 'pronunciation')) {
		db.exec("ALTER TABLE characters ADD COLUMN pronunciation TEXT NOT NULL DEFAULT ''");
	}
	if (!columns.some((c) => c.name === 'aliases')) {
		db.exec("ALTER TABLE characters ADD COLUMN aliases TEXT NOT NULL DEFAULT '[]'");
	}
	if (!columns.some((c) => c.name === 'diasporaOrigin')) {
		db.exec("ALTER TABLE characters ADD COLUMN diasporaOrigin TEXT NOT NULL DEFAULT ''");
	}
	if (!columns.some((c) => c.name === 'photoUrl')) {
		db.exec("ALTER TABLE characters ADD COLUMN photoUrl TEXT NOT NULL DEFAULT ''");
	}
	if (!columns.some((c) => c.name === 'bio')) {
		db.exec("ALTER TABLE characters ADD COLUMN bio TEXT NOT NULL DEFAULT ''");
	}
	if (!columns.some((c) => c.name === 'faction')) {
		db.exec("ALTER TABLE characters ADD COLUMN faction TEXT NOT NULL DEFAULT ''");
	}
	if (!columns.some((c) => c.name === 'anomalies')) {
		db.exec("ALTER TABLE characters ADD COLUMN anomalies TEXT NOT NULL DEFAULT '[]'");
	}
}

function ensureCharacterIndividualsColumns(db: Database.Database): void {
	const columns = db.prepare('PRAGMA table_info(characters)').all() as Array<{ name: string }>;
	const textColumns = [
		'occupation',
		'age',
		'height',
		'weight',
		'build',
		'hair',
		'eyes',
		'coreDesire',
		'fear',
		'contradiction',
		'temperament',
		'alignment',
		'strength',
		'flaw',
		'storyRole',
		'arcStage',
		'externalGoal',
		'internalNeed',
		'stakes',
		'conflict',
		'voiceSummary',
		'speechPattern',
		'phrases',
		'tells',
		'bodyLanguage',
		'dialogueSample',
		'immutableTraits',
		'injuries',
		'habits',
		'secrets',
		'othersKnow',
		'lastChange',
		'timelineMarkers',
		'emotionalState',
		'currentObjective',
		'currentPressure',
		'lastSeen',
		'nextMove',
	] as const;

	for (const columnName of textColumns) {
		if (!columns.some((column) => column.name === columnName)) {
			db.exec(`ALTER TABLE characters ADD COLUMN ${columnName} TEXT NOT NULL DEFAULT ''`);
		}
	}
}

function backfillIndividualsFromNotesEnvelope(db: Database.Database): void {
	type CharacterRow = { id: string; notes: string | null };
	type NotesEnvelope = Record<string, unknown> & {
		kind?: string;
		version?: number;
		biography?: string;
	};

	const rows = db.prepare('SELECT id, notes FROM characters').all() as CharacterRow[];
	const updatableFields = [
		'occupation',
		'age',
		'height',
		'weight',
		'build',
		'hair',
		'eyes',
		'coreDesire',
		'fear',
		'contradiction',
		'temperament',
		'alignment',
		'strength',
		'flaw',
		'storyRole',
		'arcStage',
		'externalGoal',
		'internalNeed',
		'stakes',
		'conflict',
		'voiceSummary',
		'speechPattern',
		'phrases',
		'tells',
		'bodyLanguage',
		'dialogueSample',
		'immutableTraits',
		'injuries',
		'habits',
		'secrets',
		'othersKnow',
		'lastChange',
		'timelineMarkers',
		'emotionalState',
		'currentObjective',
		'currentPressure',
		'lastSeen',
		'nextMove',
	] as const;

	for (const row of rows) {
		if (!row.notes) continue;

		let parsed: NotesEnvelope;
		try {
			parsed = JSON.parse(row.notes) as NotesEnvelope;
		} catch {
			continue;
		}

		if (parsed.kind !== 'individual-dossier' || parsed.version !== 1) {
			continue;
		}

		const updates: Record<string, string> = {};
		for (const field of updatableFields) {
			const value = parsed[field];
			if (typeof value === 'string' && value.trim().length > 0) {
				updates[field] = value;
			}
		}

		if (typeof parsed.biography === 'string') {
			updates.notes = parsed.biography;
		}

		if (Object.keys(updates).length === 0) {
			continue;
		}

		updates.updatedAt = new Date().toISOString();
		const setClauses = Object.keys(updates).map((key) => `${key} = @${key}`);
		db.prepare(`UPDATE characters SET ${setClauses.join(', ')} WHERE id = @id`).run({
			...updates,
			id: row.id,
		});
	}
}

function ensureCharacterRelationshipStatusColumn(db: Database.Database): void {
	const columns = db
		.prepare('PRAGMA table_info(character_relationships)')
		.all() as Array<{ name: string }>;
	if (!columns.some((column) => column.name === 'status')) {
		db.exec("ALTER TABLE character_relationships ADD COLUMN status TEXT NOT NULL DEFAULT ''");
	}
}

function backfillRelationshipStatusFromDescriptionEnvelope(db: Database.Database): void {
	type RelationshipRow = { id: string; description: string | null; status: string | null };
	type DescriptionEnvelope = {
		kind?: string;
		version?: number;
		notes?: string;
		status?: string;
	};

	const rows = db
		.prepare('SELECT id, description, status FROM character_relationships')
		.all() as RelationshipRow[];

	for (const row of rows) {
		if (!row.description) continue;

		let parsed: DescriptionEnvelope;
		try {
			parsed = JSON.parse(row.description) as DescriptionEnvelope;
		} catch {
			continue;
		}

		if (parsed.kind !== 'character-relationship' || parsed.version !== 1) {
			continue;
		}

		const nextDescription = typeof parsed.notes === 'string' ? parsed.notes : '';
		const nextStatus = typeof parsed.status === 'string' ? parsed.status : '';
		db.prepare(
			'UPDATE character_relationships SET description = @description, status = @status, updatedAt = @updatedAt WHERE id = @id',
		).run({
			id: row.id,
			description: nextDescription,
			status: nextStatus,
			updatedAt: new Date().toISOString(),
		});
	}
}

function normalizeAndDedupeCharacterRelationships(db: Database.Database): void {
	// Canonical ordering keeps (projectId, characterAId, characterBId) unique regardless of input direction.
	db.exec(`
		UPDATE character_relationships
		SET characterAId = characterBId,
			characterBId = characterAId
		WHERE characterAId > characterBId;
	`);

	// Guard against historical self-links before uniqueness enforcement.
	db.exec(`DELETE FROM character_relationships WHERE characterAId = characterBId;`);

	// Keep earliest record per canonical pair and remove newer duplicates.
	db.exec(`
		DELETE FROM character_relationships
		WHERE id IN (
			SELECT newer.id
			FROM character_relationships newer
			JOIN character_relationships older
				ON newer.projectId = older.projectId
				AND newer.characterAId = older.characterAId
				AND newer.characterBId = older.characterBId
				AND (
					newer.createdAt > older.createdAt
					OR (newer.createdAt = older.createdAt AND newer.id > older.id)
				)
		);
	`);
}

function ensureLocationNarrativeColumns(db: Database.Database): void {
	const columns = db.prepare('PRAGMA table_info(locations)').all() as Array<{ name: string }>;

	const stringColumns = [
		['kind', "TEXT NOT NULL DEFAULT ''"],
		['realmType', "TEXT NOT NULL DEFAULT ''"],
		['realityRules', "TEXT NOT NULL DEFAULT ''"],
		['culturalBaseline', "TEXT NOT NULL DEFAULT ''"],
		['powerStructure', "TEXT NOT NULL DEFAULT ''"],
		['conflictPressure', "TEXT NOT NULL DEFAULT ''"],
		['storyRole', "TEXT NOT NULL DEFAULT ''"],
		['tone', "TEXT NOT NULL DEFAULT ''"],
		['realmId', "TEXT NOT NULL DEFAULT ''"],
		['environment', "TEXT NOT NULL DEFAULT ''"],
		['purpose', "TEXT NOT NULL DEFAULT ''"],
		['activityType', "TEXT NOT NULL DEFAULT ''"],
		['emotionalTone', "TEXT NOT NULL DEFAULT ''"],
		['changeOverTime', "TEXT NOT NULL DEFAULT ''"],
	] as const;

	for (const [columnName, columnType] of stringColumns) {
		if (!columns.some((column) => column.name === columnName)) {
			db.exec(`ALTER TABLE locations ADD COLUMN ${columnName} ${columnType}`);
		}
	}

	const jsonColumns = ['notableFeatures', 'landmarkIds', 'factionIds', 'characterIds', 'threadIds'] as const;
	for (const columnName of jsonColumns) {
		if (!columns.some((column) => column.name === columnName)) {
			db.exec(`ALTER TABLE locations ADD COLUMN ${columnName} TEXT NOT NULL DEFAULT '[]'`);
		}
	}
}

export function runMigrations(db: Database.Database): void {
	db.transaction(() => {
		db.exec(SCHEMA_SQL);
		ensureProjectsCoverUrlColumn(db);
		ensureProjectsPromptColumns(db);
		ensureProjectTypeAndLastOpened(db);
		ensureStylePresetIdColumn(db);
		ensureScenesNotesColumn(db);
		ensureActsArcIdColumn(db);
		ensureCharacterPresentationColumns(db);
		ensureCharacterIndividualsColumns(db);
		backfillIndividualsFromNotesEnvelope(db);
		ensureCharacterRelationshipStatusColumn(db);
		backfillRelationshipStatusFromDescriptionEnvelope(db);
		normalizeAndDedupeCharacterRelationships(db);
		ensureLocationNarrativeColumns(db);
		db.exec(INDEX_SQL);
	})();
}
