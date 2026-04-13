import Dexie, { type Table } from 'dexie';
import type {
	Project,
	Chapter,
	Scene,
	Beat,
	Character,
	CharacterRelationship,
	Location,
	LoreEntry,
	PlotThread,
	TimelineEvent,
	ConsistencyIssue,
	ExportSettings,
	SceneSnapshot,
} from './types.js';
import { schemaV1, schemaV2, schemaV3, schemaV4, schemaV5, schemaV6 } from './schema.js';

export class AppDB extends Dexie {
	projects!: Table<Project, string>;
	chapters!: Table<Chapter, string>;
	scenes!: Table<Scene, string>;
	beats!: Table<Beat, string>;
	characters!: Table<Character, string>;
	character_relationships!: Table<CharacterRelationship, string>;
	locations!: Table<Location, string>;
	lore_entries!: Table<LoreEntry, string>;
	plot_threads!: Table<PlotThread, string>;
	timeline_events!: Table<TimelineEvent, string>;
	consistency_issues!: Table<ConsistencyIssue, string>;
	export_settings!: Table<ExportSettings, string>;
	scene_snapshots!: Table<SceneSnapshot, string>;

	constructor() {
		super('novellum');
		// v1 → integer keys (deprecated)
		this.version(1).stores(schemaV1);
		// v2 → UUID string keys, original Path 1 table set
		this.version(2)
			.stores(schemaV2)
			.upgrade(async (tx) => {
				await tx
					.table('scenes')
					.toCollection()
					.modify((scene) => {
						if (!scene.projectId) scene.projectId = '';
						if (!scene.wordCount) scene.wordCount = 0;
						if (!scene.updatedAt) scene.updatedAt = new Date().toISOString();
						if (!scene.createdAt) scene.createdAt = new Date().toISOString();
					});
				await tx
					.table('beats')
					.toCollection()
					.modify((beat) => {
						if (!beat.projectId) beat.projectId = '';
						if (!beat.updatedAt) beat.updatedAt = new Date().toISOString();
						if (!beat.createdAt) beat.createdAt = new Date().toISOString();
					});
			});
		// v3 → full entity set with snake_case table names; drop old timelineEvents table
		this.version(3).stores({ ...schemaV3, timelineEvents: null });
		// v4 → adds consistency_issues table
		this.version(4).stores(schemaV4);
		// v5 → adds export_settings table
		this.version(5).stores(schemaV5);
		// v6 → adds scene_snapshots table
		this.version(6).stores(schemaV6);
	}
}

export const db = new AppDB();

db.open().catch((err) => {
	console.warn('[Novellum] Failed to open IndexedDB:', err);
});

/** Dev/test only — drops and recreates the database for clean testing. */
export async function resetDb(): Promise<void> {
	await db.delete();
	await db.open();
}

export type {
	Project,
	Chapter,
	Scene,
	Beat,
	Character,
	CharacterRelationship,
	Location,
	LoreEntry,
	PlotThread,
	TimelineEvent,
	ConsistencyIssue,
	ExportSettings,
	SceneSnapshot,
};
