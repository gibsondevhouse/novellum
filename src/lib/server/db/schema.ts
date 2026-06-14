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
	systemPrompt TEXT NOT NULL DEFAULT '',
	negativePrompt TEXT NOT NULL DEFAULT '',
	projectType TEXT NOT NULL DEFAULT 'novel',
	lastOpenedAt TEXT NOT NULL DEFAULT '',
	stylePresetId TEXT NOT NULL DEFAULT '',
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
	notes TEXT NOT NULL DEFAULT '',
	characterIds TEXT NOT NULL DEFAULT '[]',
	locationIds TEXT NOT NULL DEFAULT '[]',
	arcRefs TEXT NOT NULL DEFAULT '[]',
	createdAt TEXT NOT NULL,
	updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS beats (
	id TEXT PRIMARY KEY,
	sceneId TEXT,
	arcId TEXT,
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
	occupation TEXT NOT NULL DEFAULT '',
	age TEXT NOT NULL DEFAULT '',
	height TEXT NOT NULL DEFAULT '',
	weight TEXT NOT NULL DEFAULT '',
	build TEXT NOT NULL DEFAULT '',
	hair TEXT NOT NULL DEFAULT '',
	eyes TEXT NOT NULL DEFAULT '',
	coreDesire TEXT NOT NULL DEFAULT '',
	fear TEXT NOT NULL DEFAULT '',
	contradiction TEXT NOT NULL DEFAULT '',
	temperament TEXT NOT NULL DEFAULT '',
	alignment TEXT NOT NULL DEFAULT '',
	strength TEXT NOT NULL DEFAULT '',
	flaw TEXT NOT NULL DEFAULT '',
	storyRole TEXT NOT NULL DEFAULT '',
	arcStage TEXT NOT NULL DEFAULT '',
	externalGoal TEXT NOT NULL DEFAULT '',
	internalNeed TEXT NOT NULL DEFAULT '',
	stakes TEXT NOT NULL DEFAULT '',
	conflict TEXT NOT NULL DEFAULT '',
	voiceSummary TEXT NOT NULL DEFAULT '',
	speechPattern TEXT NOT NULL DEFAULT '',
	phrases TEXT NOT NULL DEFAULT '',
	tells TEXT NOT NULL DEFAULT '',
	bodyLanguage TEXT NOT NULL DEFAULT '',
	dialogueSample TEXT NOT NULL DEFAULT '',
	immutableTraits TEXT NOT NULL DEFAULT '',
	injuries TEXT NOT NULL DEFAULT '',
	habits TEXT NOT NULL DEFAULT '',
	secrets TEXT NOT NULL DEFAULT '',
	othersKnow TEXT NOT NULL DEFAULT '',
	lastChange TEXT NOT NULL DEFAULT '',
	timelineMarkers TEXT NOT NULL DEFAULT '',
	emotionalState TEXT NOT NULL DEFAULT '',
	currentObjective TEXT NOT NULL DEFAULT '',
	currentPressure TEXT NOT NULL DEFAULT '',
	lastSeen TEXT NOT NULL DEFAULT '',
	nextMove TEXT NOT NULL DEFAULT '',
	pronunciation TEXT NOT NULL DEFAULT '',
	aliases TEXT NOT NULL DEFAULT '[]',
	diasporaOrigin TEXT NOT NULL DEFAULT '',
	photoUrl TEXT NOT NULL DEFAULT '',
	bio TEXT NOT NULL DEFAULT '',
	faction TEXT NOT NULL DEFAULT '',
	factionId TEXT,
	anomalies TEXT NOT NULL DEFAULT '[]',
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
	status TEXT NOT NULL DEFAULT '',
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
	kind TEXT NOT NULL DEFAULT '',
	realmType TEXT NOT NULL DEFAULT '',
	realityRules TEXT NOT NULL DEFAULT '',
	culturalBaseline TEXT NOT NULL DEFAULT '',
	powerStructure TEXT NOT NULL DEFAULT '',
	conflictPressure TEXT NOT NULL DEFAULT '',
	storyRole TEXT NOT NULL DEFAULT '',
	tone TEXT NOT NULL DEFAULT '',
	realmId TEXT NOT NULL DEFAULT '',
	environment TEXT NOT NULL DEFAULT '',
	notableFeatures TEXT NOT NULL DEFAULT '[]',
	purpose TEXT NOT NULL DEFAULT '',
	activityType TEXT NOT NULL DEFAULT '',
	emotionalTone TEXT NOT NULL DEFAULT '',
	changeOverTime TEXT NOT NULL DEFAULT '',
	landmarkIds TEXT NOT NULL DEFAULT '[]',
	factionIds TEXT NOT NULL DEFAULT '[]',
	characterIds TEXT NOT NULL DEFAULT '[]',
	threadIds TEXT NOT NULL DEFAULT '[]',
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
	arcId TEXT,
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
	sceneId TEXT,
	arcId TEXT,
	projectId TEXT NOT NULL,
	text TEXT NOT NULL DEFAULT '',
	createdAt TEXT NOT NULL,
	wordCount INTEGER NOT NULL DEFAULT 0,
	label TEXT NOT NULL DEFAULT '',
	source TEXT NOT NULL DEFAULT 'autosave',
	reason TEXT NOT NULL DEFAULT ''
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
	arcId TEXT,
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
	status TEXT NOT NULL DEFAULT 'planned',
	"order" INTEGER NOT NULL,
	createdAt TEXT NOT NULL,
	updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS writing_styles (
	id TEXT PRIMARY KEY,
	projectId TEXT NOT NULL,
	title TEXT NOT NULL,
	description TEXT NOT NULL DEFAULT '',
	exampleText TEXT NOT NULL DEFAULT '',
	createdAt TEXT NOT NULL,
	updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS templates (
	id TEXT PRIMARY KEY,
	projectId TEXT NOT NULL,
	name TEXT NOT NULL,
	description TEXT NOT NULL DEFAULT '',
	content TEXT NOT NULL DEFAULT '',
	type TEXT NOT NULL DEFAULT '',
	createdAt TEXT NOT NULL,
	updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS system_prompts (
	id TEXT PRIMARY KEY,
	projectId TEXT NOT NULL,
	name TEXT NOT NULL,
	content TEXT NOT NULL DEFAULT '',
	isDefault INTEGER NOT NULL DEFAULT 0,
	createdAt TEXT NOT NULL,
	updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_instructions (
	id TEXT PRIMARY KEY,
	projectId TEXT NOT NULL,
	name TEXT NOT NULL,
	content TEXT NOT NULL DEFAULT '',
	isDefault INTEGER NOT NULL DEFAULT 0,
	createdAt TEXT NOT NULL,
	updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stages (
	id TEXT PRIMARY KEY,
	beatId TEXT NOT NULL,
	projectId TEXT NOT NULL,
	title TEXT NOT NULL,
	description TEXT NOT NULL DEFAULT '',
	"order" INTEGER NOT NULL,
	status TEXT NOT NULL DEFAULT 'planned',
	createdAt TEXT NOT NULL,
	updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS milestones (
	id TEXT PRIMARY KEY,
	actId TEXT NOT NULL,
	projectId TEXT NOT NULL,
	title TEXT NOT NULL,
	description TEXT NOT NULL DEFAULT '',
	"order" INTEGER NOT NULL,
	chapterIds TEXT NOT NULL DEFAULT '[]',
	createdAt TEXT NOT NULL,
	updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS factions (
	id TEXT PRIMARY KEY,
	projectId TEXT NOT NULL,
	name TEXT NOT NULL,
	type TEXT NOT NULL DEFAULT '',
	description TEXT NOT NULL DEFAULT '',
	mission TEXT NOT NULL DEFAULT '',
	ideology TEXT NOT NULL DEFAULT '',
	createdAt TEXT NOT NULL,
	updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS themes (
	id TEXT PRIMARY KEY,
	projectId TEXT NOT NULL,
	title TEXT NOT NULL,
	description TEXT NOT NULL DEFAULT '',
	tensionPair TEXT NOT NULL DEFAULT '',
	imagery TEXT NOT NULL DEFAULT '',
	createdAt TEXT NOT NULL,
	updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS glossary_terms (
	id TEXT PRIMARY KEY,
	projectId TEXT NOT NULL,
	term TEXT NOT NULL,
	definition TEXT NOT NULL DEFAULT '',
	pronunciation TEXT NOT NULL DEFAULT '',
	category TEXT NOT NULL DEFAULT '',
	createdAt TEXT NOT NULL,
	updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS app_preferences (
	key TEXT PRIMARY KEY,
	value TEXT NOT NULL,
	updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS assets (
	id TEXT PRIMARY KEY,
	projectId TEXT NOT NULL,
	name TEXT NOT NULL,
	mimeType TEXT NOT NULL DEFAULT '',
	data TEXT NOT NULL DEFAULT '',
	sizeBytes INTEGER NOT NULL DEFAULT 0,
	createdAt TEXT NOT NULL,
	updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS agent_runs (
	id TEXT PRIMARY KEY,
	projectId TEXT,
	family TEXT NOT NULL,
	entrypoint TEXT NOT NULL DEFAULT '',
	status TEXT NOT NULL,
	requestedBy TEXT NOT NULL DEFAULT 'user',
	targetKind TEXT NOT NULL DEFAULT '',
	targetId TEXT NOT NULL DEFAULT '',
	modelProvider TEXT NOT NULL DEFAULT '',
	modelId TEXT NOT NULL DEFAULT '',
	modelCapabilitySnapshotId TEXT,
	targetJson TEXT NOT NULL DEFAULT '{}',
	inputHash TEXT NOT NULL DEFAULT '',
	contextHash TEXT NOT NULL DEFAULT '',
	statusReason TEXT NOT NULL DEFAULT '',
	errorCode TEXT NOT NULL DEFAULT '',
	errorMessageRedacted TEXT NOT NULL DEFAULT '',
	retryOfRunId TEXT,
	startedAt TEXT,
	completedAt TEXT,
	cancelledAt TEXT,
	createdAt TEXT NOT NULL,
	updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS agent_run_steps (
	id TEXT PRIMARY KEY,
	runId TEXT NOT NULL,
	sequence INTEGER NOT NULL,
	parentStepId TEXT,
	kind TEXT NOT NULL,
	status TEXT NOT NULL,
	source TEXT NOT NULL DEFAULT '',
	inputHash TEXT NOT NULL DEFAULT '',
	outputHash TEXT NOT NULL DEFAULT '',
	usageId TEXT,
	artifactId TEXT,
	errorCode TEXT NOT NULL DEFAULT '',
	errorMessageRedacted TEXT NOT NULL DEFAULT '',
	startedAt TEXT,
	completedAt TEXT,
	elapsedMs INTEGER NOT NULL DEFAULT 0,
	createdAt TEXT NOT NULL,
	updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS agent_tool_calls (
	id TEXT PRIMARY KEY,
	runId TEXT NOT NULL,
	stepId TEXT,
	invocationId TEXT NOT NULL DEFAULT '',
	toolId TEXT NOT NULL,
	capability TEXT NOT NULL DEFAULT '',
	caller TEXT NOT NULL DEFAULT '',
	status TEXT NOT NULL,
	sourceStatus TEXT NOT NULL DEFAULT '',
	inputRedactedJson TEXT NOT NULL DEFAULT '{}',
	outputRedactedJson TEXT NOT NULL DEFAULT '{}',
	inputHash TEXT NOT NULL DEFAULT '',
	outputHash TEXT NOT NULL DEFAULT '',
	artifactId TEXT,
	errorCode TEXT NOT NULL DEFAULT '',
	errorMessageRedacted TEXT NOT NULL DEFAULT '',
	startedAt TEXT,
	completedAt TEXT,
	createdAt TEXT NOT NULL,
	updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS agent_artifacts (
	id TEXT PRIMARY KEY,
	runId TEXT NOT NULL,
	stepId TEXT,
	artifactType TEXT NOT NULL,
	reviewState TEXT NOT NULL DEFAULT '',
	storageKind TEXT NOT NULL DEFAULT '',
	storageProjectId TEXT,
	storageOwnerId TEXT,
	storageKey TEXT NOT NULL DEFAULT '',
	storageRefJson TEXT NOT NULL DEFAULT '{}',
	domainType TEXT NOT NULL DEFAULT '',
	domainId TEXT NOT NULL DEFAULT '',
	domainVersion TEXT NOT NULL DEFAULT '',
	schemaVersion TEXT NOT NULL DEFAULT '1',
	summary TEXT NOT NULL DEFAULT '',
	contentHash TEXT NOT NULL DEFAULT '',
	sourceStatus TEXT NOT NULL DEFAULT '',
	createdAt TEXT NOT NULL,
	updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS agent_usage (
	id TEXT PRIMARY KEY,
	runId TEXT NOT NULL,
	stepId TEXT,
	providerId TEXT NOT NULL DEFAULT '',
	modelId TEXT NOT NULL DEFAULT '',
	usageKind TEXT NOT NULL DEFAULT 'estimate',
	promptChars INTEGER NOT NULL DEFAULT 0,
	completionChars INTEGER NOT NULL DEFAULT 0,
	estimatedPromptTokens INTEGER NOT NULL DEFAULT 0,
	estimatedCompletionTokens INTEGER NOT NULL DEFAULT 0,
	estimatedTotalTokens INTEGER NOT NULL DEFAULT 0,
	estimatedCostUsd REAL NOT NULL DEFAULT 0,
	providerPromptTokens INTEGER,
	providerCompletionTokens INTEGER,
	providerTotalTokens INTEGER,
	providerCostUsd REAL,
	finishReason TEXT NOT NULL DEFAULT '',
	usageConfidence TEXT NOT NULL DEFAULT '',
	createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS agent_run_errors (
	id TEXT PRIMARY KEY,
	runId TEXT NOT NULL,
	stepId TEXT,
	jobId TEXT,
	errorCode TEXT NOT NULL,
	errorKind TEXT NOT NULL DEFAULT '',
	errorMessageRedacted TEXT NOT NULL DEFAULT '',
	retryable INTEGER NOT NULL DEFAULT 0,
	detailsRedactedJson TEXT NOT NULL DEFAULT '{}',
	createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS agent_jobs (
	id TEXT PRIMARY KEY,
	runId TEXT,
	projectId TEXT,
	jobType TEXT NOT NULL,
	status TEXT NOT NULL,
	priority INTEGER NOT NULL DEFAULT 0,
	runAfter TEXT,
	lockedAt TEXT,
	lockedBy TEXT NOT NULL DEFAULT '',
	lockExpiresAt TEXT,
	heartbeatAt TEXT,
	attempt INTEGER NOT NULL DEFAULT 0,
	maxAttempts INTEGER NOT NULL DEFAULT 1,
	retryOfJobId TEXT,
	payloadRedactedJson TEXT NOT NULL DEFAULT '{}',
	payloadHash TEXT NOT NULL DEFAULT '',
	resultArtifactId TEXT,
	progressCurrent INTEGER NOT NULL DEFAULT 0,
	progressTotal INTEGER NOT NULL DEFAULT 0,
	progressLabel TEXT NOT NULL DEFAULT '',
	startedAt TEXT,
	completedAt TEXT,
	cancelledAt TEXT,
	errorCode TEXT NOT NULL DEFAULT '',
	errorMessageRedacted TEXT NOT NULL DEFAULT '',
	createdAt TEXT NOT NULL,
	updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS agent_trace_events (
	id TEXT PRIMARY KEY,
	runId TEXT NOT NULL,
	stepId TEXT,
	sequence INTEGER NOT NULL,
	eventType TEXT NOT NULL,
	severity TEXT NOT NULL DEFAULT 'info',
	message TEXT NOT NULL DEFAULT '',
	metadataRedactedJson TEXT NOT NULL DEFAULT '{}',
	redactionState TEXT NOT NULL DEFAULT 'redacted',
	createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS agent_trace_redactions (
	id TEXT PRIMARY KEY,
	runId TEXT NOT NULL,
	traceEventId TEXT,
	fieldPath TEXT NOT NULL,
	redactionType TEXT NOT NULL,
	replacement TEXT NOT NULL DEFAULT '',
	reason TEXT NOT NULL DEFAULT '',
	createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS project_metadata (
	projectId TEXT NOT NULL,
	scope TEXT NOT NULL,
	ownerId TEXT NOT NULL,
	key TEXT NOT NULL,
	value TEXT NOT NULL,
	updatedAt TEXT NOT NULL,
	PRIMARY KEY (projectId, scope, ownerId, key)
);

CREATE TABLE IF NOT EXISTS schema_migrations (
	version INTEGER PRIMARY KEY,
	name TEXT NOT NULL,
	applied_at TEXT NOT NULL,
	checksum TEXT NOT NULL,
	app_version TEXT NOT NULL DEFAULT ''
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
CREATE UNIQUE INDEX IF NOT EXISTS idx_character_relationships_project_pair_unique ON character_relationships(projectId, characterAId, characterBId);
CREATE INDEX IF NOT EXISTS idx_locations_projectId ON locations(projectId);
CREATE INDEX IF NOT EXISTS idx_locations_kind ON locations(projectId, kind);
CREATE INDEX IF NOT EXISTS idx_locations_realmId ON locations(projectId, realmId);
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
CREATE INDEX IF NOT EXISTS idx_writing_styles_projectId ON writing_styles(projectId);
CREATE INDEX IF NOT EXISTS idx_templates_projectId ON templates(projectId);
CREATE INDEX IF NOT EXISTS idx_system_prompts_projectId ON system_prompts(projectId);
CREATE INDEX IF NOT EXISTS idx_chat_instructions_projectId ON chat_instructions(projectId);
CREATE INDEX IF NOT EXISTS idx_stages_beatId ON stages(beatId);
CREATE INDEX IF NOT EXISTS idx_stages_projectId ON stages(projectId);
CREATE INDEX IF NOT EXISTS idx_milestones_actId ON milestones(actId);
CREATE INDEX IF NOT EXISTS idx_milestones_projectId ON milestones(projectId);
CREATE INDEX IF NOT EXISTS idx_factions_projectId ON factions(projectId);
CREATE INDEX IF NOT EXISTS idx_themes_projectId ON themes(projectId);
CREATE INDEX IF NOT EXISTS idx_glossary_terms_projectId ON glossary_terms(projectId);
CREATE INDEX IF NOT EXISTS idx_assets_projectId ON assets(projectId);
CREATE INDEX IF NOT EXISTS idx_agent_runs_project_status ON agent_runs(projectId, status);
CREATE INDEX IF NOT EXISTS idx_agent_runs_family_createdAt ON agent_runs(family, createdAt);
CREATE INDEX IF NOT EXISTS idx_agent_runs_status_updatedAt ON agent_runs(status, updatedAt);
CREATE INDEX IF NOT EXISTS idx_agent_runs_target ON agent_runs(projectId, targetKind, targetId);
CREATE INDEX IF NOT EXISTS idx_agent_runs_retryOfRunId ON agent_runs(retryOfRunId);
CREATE INDEX IF NOT EXISTS idx_agent_run_steps_run_sequence ON agent_run_steps(runId, sequence);
CREATE INDEX IF NOT EXISTS idx_agent_run_steps_status_kind ON agent_run_steps(status, kind);
CREATE INDEX IF NOT EXISTS idx_agent_run_steps_artifactId ON agent_run_steps(artifactId);
CREATE INDEX IF NOT EXISTS idx_agent_tool_calls_run ON agent_tool_calls(runId);
CREATE INDEX IF NOT EXISTS idx_agent_tool_calls_tool_status ON agent_tool_calls(toolId, status);
CREATE INDEX IF NOT EXISTS idx_agent_tool_calls_artifactId ON agent_tool_calls(artifactId);
CREATE INDEX IF NOT EXISTS idx_agent_artifacts_run ON agent_artifacts(runId);
CREATE INDEX IF NOT EXISTS idx_agent_artifacts_type_state ON agent_artifacts(artifactType, reviewState);
CREATE INDEX IF NOT EXISTS idx_agent_artifacts_storage ON agent_artifacts(storageKind, storageProjectId, storageOwnerId, storageKey);
CREATE INDEX IF NOT EXISTS idx_agent_artifacts_domain ON agent_artifacts(domainType, domainId);
CREATE INDEX IF NOT EXISTS idx_agent_usage_run ON agent_usage(runId);
CREATE INDEX IF NOT EXISTS idx_agent_run_errors_run ON agent_run_errors(runId);
CREATE INDEX IF NOT EXISTS idx_agent_run_errors_code ON agent_run_errors(errorCode);
CREATE INDEX IF NOT EXISTS idx_agent_jobs_project_status ON agent_jobs(projectId, status);
CREATE INDEX IF NOT EXISTS idx_agent_jobs_status_runAfter ON agent_jobs(status, runAfter);
CREATE INDEX IF NOT EXISTS idx_agent_jobs_lockExpiresAt ON agent_jobs(lockExpiresAt);
CREATE INDEX IF NOT EXISTS idx_agent_jobs_runId ON agent_jobs(runId);
CREATE INDEX IF NOT EXISTS idx_agent_jobs_resultArtifactId ON agent_jobs(resultArtifactId);
CREATE INDEX IF NOT EXISTS idx_agent_trace_events_run_sequence ON agent_trace_events(runId, sequence);
CREATE INDEX IF NOT EXISTS idx_agent_trace_redactions_run ON agent_trace_redactions(runId);
CREATE INDEX IF NOT EXISTS idx_agent_trace_redactions_event ON agent_trace_redactions(traceEventId);
CREATE INDEX IF NOT EXISTS idx_project_metadata_owner ON project_metadata(projectId, scope, ownerId);
`;
