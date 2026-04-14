export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS projects (
	id TEXT PRIMARY KEY,
	title TEXT NOT NULL,
	coverUrl TEXT NOT NULL DEFAULT '',
	genre TEXT NOT NULL DEFAULT '',
	logline TEXT NOT NULL DEFAULT '',
	synopsis TEXT NOT NULL DEFAULT '',
	targetWordCount INTEGER NOT NULL DEFAULT 0,
	status TEXT NOT NULL DEFAULT '',
	createdAt TEXT NOT NULL,
	updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chapters (
	id TEXT PRIMARY KEY,
	projectId TEXT NOT NULL,
	title TEXT NOT NULL,
	"order" INTEGER NOT NULL,
	summary TEXT NOT NULL DEFAULT '',
	wordCount INTEGER NOT NULL DEFAULT 0,
	actId TEXT,
	arcRefs TEXT NOT NULL DEFAULT '[]',
	createdAt TEXT NOT NULL,
	updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scenes (
	id TEXT PRIMARY KEY,
	chapterId TEXT NOT NULL,
	projectId TEXT NOT NULL,
	title TEXT NOT NULL,
	summary TEXT NOT NULL DEFAULT '',
	povCharacterId TEXT,
	locationId TEXT,
	timelineEventId TEXT,
	"order" INTEGER NOT NULL,
	content TEXT NOT NULL DEFAULT '',
	wordCount INTEGER NOT NULL DEFAULT 0,
	characterIds TEXT NOT NULL DEFAULT '[]',
	locationIds TEXT NOT NULL DEFAULT '[]',
	arcRefs TEXT NOT NULL DEFAULT '[]',
	createdAt TEXT NOT NULL,
	updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS beats (
	id TEXT PRIMARY KEY,
	sceneId TEXT NOT NULL,
	projectId TEXT NOT NULL,
	title TEXT NOT NULL,
	type TEXT NOT NULL DEFAULT '',
	"order" INTEGER NOT NULL,
	notes TEXT NOT NULL DEFAULT '',
	createdAt TEXT NOT NULL,
	updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS characters (
	id TEXT PRIMARY KEY,
	projectId TEXT NOT NULL,
	name TEXT NOT NULL,
	role TEXT NOT NULL DEFAULT '',
	traits TEXT NOT NULL DEFAULT '[]',
	goals TEXT NOT NULL DEFAULT '[]',
	flaws TEXT NOT NULL DEFAULT '[]',
	arcs TEXT NOT NULL DEFAULT '[]',
	notes TEXT NOT NULL DEFAULT '',
	tags TEXT NOT NULL DEFAULT '[]',
	createdAt TEXT NOT NULL,
	updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS character_relationships (
	id TEXT PRIMARY KEY,
	projectId TEXT NOT NULL,
	characterAId TEXT NOT NULL,
	characterBId TEXT NOT NULL,
	type TEXT NOT NULL DEFAULT '',
	description TEXT NOT NULL DEFAULT '',
	createdAt TEXT NOT NULL,
	updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS locations (
	id TEXT PRIMARY KEY,
	projectId TEXT NOT NULL,
	name TEXT NOT NULL,
	description TEXT NOT NULL DEFAULT '',
	tags TEXT NOT NULL DEFAULT '[]',
	createdAt TEXT NOT NULL,
	updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lore_entries (
	id TEXT PRIMARY KEY,
	projectId TEXT NOT NULL,
	title TEXT NOT NULL,
	category TEXT NOT NULL DEFAULT '',
	content TEXT NOT NULL DEFAULT '',
	tags TEXT NOT NULL DEFAULT '[]',
	createdAt TEXT NOT NULL,
	updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS plot_threads (
	id TEXT PRIMARY KEY,
	projectId TEXT NOT NULL,
	title TEXT NOT NULL,
	description TEXT NOT NULL DEFAULT '',
	status TEXT NOT NULL DEFAULT '',
	relatedSceneIds TEXT NOT NULL DEFAULT '[]',
	relatedCharacterIds TEXT NOT NULL DEFAULT '[]',
	createdAt TEXT NOT NULL,
	updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS timeline_events (
	id TEXT PRIMARY KEY,
	projectId TEXT NOT NULL,
	title TEXT NOT NULL,
	description TEXT NOT NULL DEFAULT '',
	date TEXT NOT NULL DEFAULT '',
	relatedCharacterIds TEXT NOT NULL DEFAULT '[]',
	relatedSceneIds TEXT NOT NULL DEFAULT '[]',
	createdAt TEXT NOT NULL,
	updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS consistency_issues (
	id TEXT PRIMARY KEY,
	projectId TEXT NOT NULL,
	type TEXT NOT NULL,
	severity TEXT NOT NULL,
	description TEXT NOT NULL DEFAULT '',
	entityIds TEXT NOT NULL DEFAULT '[]',
	sceneId TEXT,
	status TEXT NOT NULL DEFAULT 'open',
	createdAt TEXT NOT NULL,
	updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS export_settings (
	id TEXT PRIMARY KEY,
	projectId TEXT NOT NULL,
	titlePage INTEGER NOT NULL DEFAULT 1,
	chapterStyle TEXT NOT NULL DEFAULT 'heading',
	fontFamily TEXT NOT NULL DEFAULT 'Georgia',
	fontSize INTEGER NOT NULL DEFAULT 12,
	lineSpacing REAL NOT NULL DEFAULT 1.5,
	createdAt TEXT NOT NULL,
	updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scene_snapshots (
	id TEXT PRIMARY KEY,
	sceneId TEXT NOT NULL,
	projectId TEXT NOT NULL,
	text TEXT NOT NULL DEFAULT '',
	createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS story_frames (
	id TEXT PRIMARY KEY,
	projectId TEXT NOT NULL,
	premise TEXT NOT NULL DEFAULT '',
	theme TEXT NOT NULL DEFAULT '',
	toneNotes TEXT NOT NULL DEFAULT '',
	updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS acts (
	id TEXT PRIMARY KEY,
	projectId TEXT NOT NULL,
	title TEXT NOT NULL,
	"order" INTEGER NOT NULL,
	planningNotes TEXT NOT NULL DEFAULT '',
	createdAt TEXT NOT NULL,
	updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS arcs (
	id TEXT PRIMARY KEY,
	projectId TEXT NOT NULL,
	title TEXT NOT NULL,
	description TEXT NOT NULL DEFAULT '',
	purpose TEXT NOT NULL DEFAULT '',
	arcType TEXT,
	"order" INTEGER NOT NULL,
	createdAt TEXT NOT NULL,
	updatedAt TEXT NOT NULL
);
`;

export const INDEX_SQL = `
CREATE INDEX IF NOT EXISTS idx_chapters_projectId ON chapters(projectId);
CREATE INDEX IF NOT EXISTS idx_scenes_projectId ON scenes(projectId);
CREATE INDEX IF NOT EXISTS idx_scenes_chapterId ON scenes(chapterId);
CREATE INDEX IF NOT EXISTS idx_beats_sceneId ON beats(sceneId);
CREATE INDEX IF NOT EXISTS idx_beats_projectId ON beats(projectId);
CREATE INDEX IF NOT EXISTS idx_characters_projectId ON characters(projectId);
CREATE INDEX IF NOT EXISTS idx_character_relationships_projectId ON character_relationships(projectId);
CREATE INDEX IF NOT EXISTS idx_character_relationships_characterAId ON character_relationships(characterAId);
CREATE INDEX IF NOT EXISTS idx_character_relationships_characterBId ON character_relationships(characterBId);
CREATE INDEX IF NOT EXISTS idx_locations_projectId ON locations(projectId);
CREATE INDEX IF NOT EXISTS idx_lore_entries_projectId ON lore_entries(projectId);
CREATE INDEX IF NOT EXISTS idx_lore_entries_category ON lore_entries(projectId, category);
CREATE INDEX IF NOT EXISTS idx_plot_threads_projectId ON plot_threads(projectId);
CREATE INDEX IF NOT EXISTS idx_timeline_events_projectId ON timeline_events(projectId);
CREATE INDEX IF NOT EXISTS idx_consistency_issues_projectId ON consistency_issues(projectId);
CREATE INDEX IF NOT EXISTS idx_consistency_issues_status ON consistency_issues(projectId, status);
CREATE INDEX IF NOT EXISTS idx_export_settings_projectId ON export_settings(projectId);
CREATE INDEX IF NOT EXISTS idx_scene_snapshots_sceneId ON scene_snapshots(sceneId);
CREATE INDEX IF NOT EXISTS idx_scene_snapshots_projectId ON scene_snapshots(projectId);
CREATE INDEX IF NOT EXISTS idx_story_frames_projectId ON story_frames(projectId);
CREATE INDEX IF NOT EXISTS idx_acts_projectId ON acts(projectId);
CREATE INDEX IF NOT EXISTS idx_arcs_projectId ON arcs(projectId);
`;
