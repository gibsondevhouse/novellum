import type {
	Character,
	CharacterRelationship,
	Faction,
	GlossaryTerm,
	Location,
	LoreEntry,
	Theme,
	TimelineEvent,
} from '$lib/db/domain-types';

export interface StoryBibleSqliteStatement {
	all(...params: unknown[]): unknown[];
	get(...params: unknown[]): unknown;
}

export interface StoryBibleSqliteDatabase {
	prepare(sql: string): StoryBibleSqliteStatement;
}

export interface StoryBibleQueryOptions {
	search?: string;
	limit?: number;
	offset?: number;
	ids?: readonly string[];
	category?: string;
	kind?: string;
	tag?: string;
}

export interface StoryBibleListResult<T> {
	items: T[];
	total: number;
	limit: number;
	offset: number;
}

export interface StoryBibleSnapshot {
	characters: Character[];
	locations: Location[];
	factions: Faction[];
	loreEntries: LoreEntry[];
	glossaryTerms: GlossaryTerm[];
	timelineEvents: TimelineEvent[];
	themes: Theme[];
	relationships: CharacterRelationship[];
}

type StoryBibleRow = Record<string, unknown>;

interface StoryBibleTableConfig<T> {
	table: string;
	orderBy: string;
	searchColumns: readonly string[];
	filterColumns?: {
		category?: string;
		kind?: string;
	};
	tagColumn?: string;
	mapRow: (row: StoryBibleRow) => T;
}

interface WhereClause {
	sql: string;
	params: unknown[];
}

const DEFAULT_PAGE_LIMIT = 50;
const MAX_PAGE_LIMIT = 200;

const RESERVED_COLUMNS = new Set(['order', 'group', 'select', 'table', 'index']);

function quoteColumn(column: string): string {
	return RESERVED_COLUMNS.has(column) ? `"${column}"` : column;
}

function normalizeText(value: string | undefined): string {
	return value?.trim() ?? '';
}

function normalizeLimit(limit: number | undefined): number {
	if (typeof limit !== 'number' || !Number.isFinite(limit)) return DEFAULT_PAGE_LIMIT;
	return Math.min(MAX_PAGE_LIMIT, Math.max(1, Math.trunc(limit)));
}

function normalizeOffset(offset: number | undefined): number {
	if (typeof offset !== 'number' || !Number.isFinite(offset)) return 0;
	return Math.max(0, Math.trunc(offset));
}

function escapeLike(value: string): string {
	return value.replace(/[\\%_]/g, (match) => `\\${match}`);
}

function buildWhereClause<T>(
	config: StoryBibleTableConfig<T>,
	projectId: string,
	options: StoryBibleQueryOptions,
): WhereClause {
	const params: unknown[] = [projectId];
	const conditions = ['projectId = ?'];
	const search = normalizeText(options.search);

	if (search) {
		const searchConditions = config.searchColumns.map(
			(column) => `${quoteColumn(column)} LIKE ? ESCAPE '\\'`,
		);
		conditions.push(`(${searchConditions.join(' OR ')})`);
		for (let i = 0; i < config.searchColumns.length; i += 1) {
			params.push(`%${escapeLike(search)}%`);
		}
	}

	const ids = options.ids?.map((id) => id.trim()).filter(Boolean);
	if (ids && ids.length > 0) {
		conditions.push(`id IN (${ids.map(() => '?').join(', ')})`);
		params.push(...ids);
	}

	const category = normalizeText(options.category);
	if (category && config.filterColumns?.category) {
		conditions.push(`${quoteColumn(config.filterColumns.category)} = ?`);
		params.push(category);
	}

	const kind = normalizeText(options.kind);
	if (kind && config.filterColumns?.kind) {
		conditions.push(`${quoteColumn(config.filterColumns.kind)} = ?`);
		params.push(kind);
	}

	const tag = normalizeText(options.tag);
	if (tag && config.tagColumn) {
		conditions.push(`${quoteColumn(config.tagColumn)} LIKE ? ESCAPE '\\'`);
		params.push(`%${escapeLike(tag)}%`);
	}

	return {
		sql: `WHERE ${conditions.join(' AND ')}`,
		params,
	};
}

function stringField(row: StoryBibleRow, key: string): string {
	const value = row[key];
	if (typeof value === 'string') return value;
	if (value == null) return '';
	return String(value);
}

function optionalStringField(row: StoryBibleRow, key: string): string | undefined {
	const value = stringField(row, key);
	return value ? value : undefined;
}

function decodeStringArray(value: unknown): string[] {
	if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string');
	if (typeof value !== 'string' || !value) return [];

	try {
		const parsed: unknown = JSON.parse(value);
		return Array.isArray(parsed)
			? parsed.filter((item): item is string => typeof item === 'string')
			: [];
	} catch {
		return [];
	}
}

function mapCharacter(row: StoryBibleRow): Character {
	return {
		id: stringField(row, 'id'),
		projectId: stringField(row, 'projectId'),
		name: stringField(row, 'name'),
		role: stringField(row, 'role'),
		occupation: stringField(row, 'occupation'),
		age: stringField(row, 'age'),
		height: stringField(row, 'height'),
		weight: stringField(row, 'weight'),
		build: stringField(row, 'build'),
		hair: stringField(row, 'hair'),
		eyes: stringField(row, 'eyes'),
		coreDesire: stringField(row, 'coreDesire'),
		fear: stringField(row, 'fear'),
		contradiction: stringField(row, 'contradiction'),
		temperament: stringField(row, 'temperament'),
		alignment: stringField(row, 'alignment'),
		strength: stringField(row, 'strength'),
		flaw: stringField(row, 'flaw'),
		storyRole: stringField(row, 'storyRole'),
		arcStage: stringField(row, 'arcStage'),
		externalGoal: stringField(row, 'externalGoal'),
		internalNeed: stringField(row, 'internalNeed'),
		stakes: stringField(row, 'stakes'),
		conflict: stringField(row, 'conflict'),
		voiceSummary: stringField(row, 'voiceSummary'),
		speechPattern: stringField(row, 'speechPattern'),
		phrases: stringField(row, 'phrases'),
		tells: stringField(row, 'tells'),
		bodyLanguage: stringField(row, 'bodyLanguage'),
		dialogueSample: stringField(row, 'dialogueSample'),
		immutableTraits: stringField(row, 'immutableTraits'),
		injuries: stringField(row, 'injuries'),
		habits: stringField(row, 'habits'),
		secrets: stringField(row, 'secrets'),
		othersKnow: stringField(row, 'othersKnow'),
		lastChange: stringField(row, 'lastChange'),
		timelineMarkers: stringField(row, 'timelineMarkers'),
		emotionalState: stringField(row, 'emotionalState'),
		currentObjective: stringField(row, 'currentObjective'),
		currentPressure: stringField(row, 'currentPressure'),
		lastSeen: stringField(row, 'lastSeen'),
		nextMove: stringField(row, 'nextMove'),
		pronunciation: stringField(row, 'pronunciation'),
		aliases: decodeStringArray(row.aliases),
		diasporaOrigin: stringField(row, 'diasporaOrigin'),
		photoUrl: stringField(row, 'photoUrl'),
		bio: stringField(row, 'bio'),
		faction: stringField(row, 'faction'),
		factionId: optionalStringField(row, 'factionId'),
		anomalies: decodeStringArray(row.anomalies),
		traits: decodeStringArray(row.traits),
		goals: decodeStringArray(row.goals),
		flaws: decodeStringArray(row.flaws),
		arcs: decodeStringArray(row.arcs),
		notes: stringField(row, 'notes'),
		tags: decodeStringArray(row.tags),
		createdAt: stringField(row, 'createdAt'),
		updatedAt: stringField(row, 'updatedAt'),
	};
}

function mapLocation(row: StoryBibleRow): Location {
	return {
		id: stringField(row, 'id'),
		projectId: stringField(row, 'projectId'),
		name: stringField(row, 'name'),
		description: stringField(row, 'description'),
		tags: decodeStringArray(row.tags),
		kind: stringField(row, 'kind') as Location['kind'],
		realmType: stringField(row, 'realmType') as Location['realmType'],
		realityRules: stringField(row, 'realityRules'),
		culturalBaseline: stringField(row, 'culturalBaseline'),
		powerStructure: stringField(row, 'powerStructure'),
		conflictPressure: stringField(row, 'conflictPressure'),
		storyRole: stringField(row, 'storyRole'),
		tone: stringField(row, 'tone'),
		realmId: stringField(row, 'realmId'),
		environment: stringField(row, 'environment'),
		notableFeatures: decodeStringArray(row.notableFeatures),
		purpose: stringField(row, 'purpose'),
		activityType: stringField(row, 'activityType'),
		emotionalTone: stringField(row, 'emotionalTone'),
		changeOverTime: stringField(row, 'changeOverTime'),
		landmarkIds: decodeStringArray(row.landmarkIds),
		factionIds: decodeStringArray(row.factionIds),
		characterIds: decodeStringArray(row.characterIds),
		threadIds: decodeStringArray(row.threadIds),
		createdAt: stringField(row, 'createdAt'),
		updatedAt: stringField(row, 'updatedAt'),
	};
}

function mapFaction(row: StoryBibleRow): Faction {
	return {
		id: stringField(row, 'id'),
		projectId: stringField(row, 'projectId'),
		name: stringField(row, 'name'),
		type: stringField(row, 'type'),
		description: stringField(row, 'description'),
		mission: stringField(row, 'mission'),
		ideology: stringField(row, 'ideology'),
		createdAt: stringField(row, 'createdAt'),
		updatedAt: stringField(row, 'updatedAt'),
	};
}

function mapLoreEntry(row: StoryBibleRow): LoreEntry {
	return {
		id: stringField(row, 'id'),
		projectId: stringField(row, 'projectId'),
		title: stringField(row, 'title'),
		category: stringField(row, 'category'),
		content: stringField(row, 'content'),
		tags: decodeStringArray(row.tags),
		createdAt: stringField(row, 'createdAt'),
		updatedAt: stringField(row, 'updatedAt'),
	};
}

function mapGlossaryTerm(row: StoryBibleRow): GlossaryTerm {
	return {
		id: stringField(row, 'id'),
		projectId: stringField(row, 'projectId'),
		term: stringField(row, 'term'),
		definition: stringField(row, 'definition'),
		pronunciation: stringField(row, 'pronunciation'),
		category: stringField(row, 'category'),
		createdAt: stringField(row, 'createdAt'),
		updatedAt: stringField(row, 'updatedAt'),
	};
}

function mapTimelineEvent(row: StoryBibleRow): TimelineEvent {
	return {
		id: stringField(row, 'id'),
		projectId: stringField(row, 'projectId'),
		title: stringField(row, 'title'),
		description: stringField(row, 'description'),
		date: stringField(row, 'date'),
		relatedCharacterIds: decodeStringArray(row.relatedCharacterIds),
		relatedSceneIds: decodeStringArray(row.relatedSceneIds),
		createdAt: stringField(row, 'createdAt'),
		updatedAt: stringField(row, 'updatedAt'),
	};
}

function mapTheme(row: StoryBibleRow): Theme {
	return {
		id: stringField(row, 'id'),
		projectId: stringField(row, 'projectId'),
		title: stringField(row, 'title'),
		description: stringField(row, 'description'),
		tensionPair: stringField(row, 'tensionPair'),
		imagery: stringField(row, 'imagery'),
		createdAt: stringField(row, 'createdAt'),
		updatedAt: stringField(row, 'updatedAt'),
	};
}

function mapRelationship(row: StoryBibleRow): CharacterRelationship {
	return {
		id: stringField(row, 'id'),
		projectId: stringField(row, 'projectId'),
		characterAId: stringField(row, 'characterAId'),
		characterBId: stringField(row, 'characterBId'),
		type: stringField(row, 'type'),
		status: stringField(row, 'status'),
		description: stringField(row, 'description'),
		createdAt: stringField(row, 'createdAt'),
		updatedAt: stringField(row, 'updatedAt'),
	};
}

const CHARACTER_TABLE: StoryBibleTableConfig<Character> = {
	table: 'characters',
	orderBy: 'name ASC, createdAt ASC',
	searchColumns: ['name', 'role', 'bio', 'notes'],
	tagColumn: 'tags',
	mapRow: mapCharacter,
};

const LOCATION_TABLE: StoryBibleTableConfig<Location> = {
	table: 'locations',
	orderBy: 'name ASC, createdAt ASC',
	searchColumns: ['name', 'description', 'kind', 'realmType'],
	filterColumns: { kind: 'kind' },
	tagColumn: 'tags',
	mapRow: mapLocation,
};

const FACTION_TABLE: StoryBibleTableConfig<Faction> = {
	table: 'factions',
	orderBy: 'name ASC, createdAt ASC',
	searchColumns: ['name', 'type', 'description', 'mission', 'ideology'],
	mapRow: mapFaction,
};

const LORE_ENTRY_TABLE: StoryBibleTableConfig<LoreEntry> = {
	table: 'lore_entries',
	orderBy: 'title ASC, createdAt ASC',
	searchColumns: ['title', 'category', 'content'],
	filterColumns: { category: 'category' },
	tagColumn: 'tags',
	mapRow: mapLoreEntry,
};

const GLOSSARY_TERM_TABLE: StoryBibleTableConfig<GlossaryTerm> = {
	table: 'glossary_terms',
	orderBy: 'term ASC, createdAt ASC',
	searchColumns: ['term', 'definition', 'pronunciation', 'category'],
	filterColumns: { category: 'category' },
	mapRow: mapGlossaryTerm,
};

const TIMELINE_EVENT_TABLE: StoryBibleTableConfig<TimelineEvent> = {
	table: 'timeline_events',
	orderBy: 'date ASC, title ASC, createdAt ASC',
	searchColumns: ['title', 'description', 'date'],
	mapRow: mapTimelineEvent,
};

const THEME_TABLE: StoryBibleTableConfig<Theme> = {
	table: 'themes',
	orderBy: 'title ASC, createdAt ASC',
	searchColumns: ['title', 'description', 'tensionPair', 'imagery'],
	mapRow: mapTheme,
};

const RELATIONSHIP_TABLE: StoryBibleTableConfig<CharacterRelationship> = {
	table: 'character_relationships',
	orderBy: 'createdAt ASC',
	searchColumns: ['type', 'status', 'description'],
	mapRow: mapRelationship,
};

export class StoryBibleRepository {
	constructor(private readonly database: StoryBibleSqliteDatabase) {}

	getCharacters(
		projectId: string,
		options: StoryBibleQueryOptions = {},
	): StoryBibleListResult<Character> {
		return this.queryTable(CHARACTER_TABLE, projectId, options);
	}

	getLocations(
		projectId: string,
		options: StoryBibleQueryOptions = {},
	): StoryBibleListResult<Location> {
		return this.queryTable(LOCATION_TABLE, projectId, options);
	}

	getFactions(
		projectId: string,
		options: StoryBibleQueryOptions = {},
	): StoryBibleListResult<Faction> {
		return this.queryTable(FACTION_TABLE, projectId, options);
	}

	getLoreEntries(
		projectId: string,
		options: StoryBibleQueryOptions = {},
	): StoryBibleListResult<LoreEntry> {
		return this.queryTable(LORE_ENTRY_TABLE, projectId, options);
	}

	getGlossaryTerms(
		projectId: string,
		options: StoryBibleQueryOptions = {},
	): StoryBibleListResult<GlossaryTerm> {
		return this.queryTable(GLOSSARY_TERM_TABLE, projectId, options);
	}

	getTimelineEvents(
		projectId: string,
		options: StoryBibleQueryOptions = {},
	): StoryBibleListResult<TimelineEvent> {
		return this.queryTable(TIMELINE_EVENT_TABLE, projectId, options);
	}

	getThemes(projectId: string, options: StoryBibleQueryOptions = {}): StoryBibleListResult<Theme> {
		return this.queryTable(THEME_TABLE, projectId, options);
	}

	getCharacterRelationships(
		projectId: string,
		options: StoryBibleQueryOptions = {},
	): StoryBibleListResult<CharacterRelationship> {
		return this.queryTable(RELATIONSHIP_TABLE, projectId, options);
	}

	getProjectBible(projectId: string, options: StoryBibleQueryOptions = {}): StoryBibleSnapshot {
		const snapshotOptions = { ...options, limit: options.limit ?? MAX_PAGE_LIMIT, offset: 0 };

		return {
			characters: this.getCharacters(projectId, snapshotOptions).items,
			locations: this.getLocations(projectId, snapshotOptions).items,
			factions: this.getFactions(projectId, snapshotOptions).items,
			loreEntries: this.getLoreEntries(projectId, snapshotOptions).items,
			glossaryTerms: this.getGlossaryTerms(projectId, snapshotOptions).items,
			timelineEvents: this.getTimelineEvents(projectId, snapshotOptions).items,
			themes: this.getThemes(projectId, snapshotOptions).items,
			relationships: this.getCharacterRelationships(projectId, snapshotOptions).items,
		};
	}

	private queryTable<T>(
		config: StoryBibleTableConfig<T>,
		projectId: string,
		options: StoryBibleQueryOptions,
	): StoryBibleListResult<T> {
		const limit = normalizeLimit(options.limit);
		const offset = normalizeOffset(options.offset);
		const where = buildWhereClause(config, projectId, options);
		const countRow = this.database
			.prepare(`SELECT COUNT(*) AS total FROM ${config.table} ${where.sql}`)
			.get(...where.params) as { total?: number } | undefined;
		const rows = this.database
			.prepare(
				`SELECT * FROM ${config.table} ${where.sql} ORDER BY ${config.orderBy} LIMIT ? OFFSET ?`,
			)
			.all(...where.params, limit, offset) as StoryBibleRow[];

		return {
			items: rows.map(config.mapRow),
			total: countRow?.total ?? 0,
			limit,
			offset,
		};
	}
}
