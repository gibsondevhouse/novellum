// Dexie store schema definitions
// version 1 → auto-increment integers (deprecated)
// version 2 → UUID string PKs, original table set from Path 1
// version 3 → complete entity set, snake_case table names, full indexes

export const schemaV1 = {
	projects: '++id, title, genre, status',
	characters: '++id, projectId, name',
	chapters: '++id, projectId, title',
	timelineEvents: '++id, projectId, timestamp',
};

// Matches what was deployed in Path 1 — do NOT change this.
export const schemaV2 = {
	projects: 'id, title, genre, status, createdAt, updatedAt',
	characters: 'id, projectId, name',
	locations: 'id, projectId, name',
	chapters: 'id, projectId, title, order',
	beats: 'id, projectId, order',
	scenes: 'id, projectId, order',
	timelineEvents: 'id, projectId, timestamp',
};

// Full entity set added in Path 2.
export const schemaV3 = {
	projects: 'id, createdAt',
	chapters: 'id, projectId, order',
	scenes: 'id, chapterId, projectId, order',
	beats: 'id, sceneId, projectId, order',
	characters: 'id, projectId',
	character_relationships: 'id, projectId, characterAId, characterBId',
	locations: 'id, projectId',
	lore_entries: 'id, projectId, category',
	plot_threads: 'id, projectId',
	timeline_events: 'id, projectId, date',
};

// Version 4 — adds consistency_issues table.
export const schemaV4 = {
	...schemaV3,
	consistency_issues: 'id, projectId, type, severity, status, sceneId, createdAt',
};

// Version 5 — adds export_settings table.
export const schemaV5 = {
	...schemaV4,
	export_settings: 'id, projectId',
};

// Version 6 — adds scene_snapshots table.
export const schemaV6 = {
	...schemaV5,
	scene_snapshots: 'id, sceneId, projectId, createdAt',
};

// Version 7 — adds story_frames and acts tables.
export const schemaV7 = {
	...schemaV6,
	story_frames: 'id, projectId',
	acts: 'id, projectId, order',
};

// Version 8 — adds arcs table.
export const schemaV8 = {
	...schemaV7,
	arcs: 'id, projectId, order',
};

// Version 9 — adds assets table.
export const schemaV9 = {
    ...schemaV8,
    assets: 'id, projectId, createdAt'
};

// Version 10 — adds milestones table.
export const schemaV10 = {
    ...schemaV9,
    milestones: 'id, actId, projectId, order'
};

// Version 11 — adds arcId index to acts for hierarchy support.
export const schemaV11 = {
    ...schemaV10,
    acts: 'id, projectId, order, arcId'
};
