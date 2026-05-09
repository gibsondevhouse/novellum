import type Database from 'better-sqlite3';
import type {
	ActRow,
	ArcRow,
	BeatRow,
	ChapterRow,
	CharacterRelationshipRow,
	CharacterRow,
	ChatInstructionRow,
	LocationRow,
	LoreEntryRow,
	MilestoneRow,
	PlotThreadRow,
	ProjectGraph,
	ProjectRow,
	SceneRow,
	StoryFrameRow,
	SystemPromptRow,
	TimelineEventRow,
	WritingStyleRow,
} from './context-row-types.js';

export type SqliteLike = Pick<Database.Database, 'prepare'>;

function selectAll<T>(database: SqliteLike, sql: string, parameter: string): T[] {
	return database.prepare(sql).all(parameter) as T[];
}

export function getProjectGraph(database: SqliteLike, projectId: string): ProjectGraph | null {
	const project = database.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as
		| ProjectRow
		| undefined;
	if (!project) return null;

	return {
		project,
		chapters: selectAll<ChapterRow>(
			database,
			'SELECT * FROM chapters WHERE projectId = ? ORDER BY "order" ASC, createdAt ASC',
			projectId,
		),
		scenes: selectAll<SceneRow>(
			database,
			'SELECT * FROM scenes WHERE projectId = ? ORDER BY chapterId ASC, "order" ASC, createdAt ASC',
			projectId,
		),
		beats: selectAll<BeatRow>(
			database,
			'SELECT * FROM beats WHERE projectId = ? ORDER BY "order" ASC, createdAt ASC',
			projectId,
		),
		characters: selectAll<CharacterRow>(
			database,
			'SELECT * FROM characters WHERE projectId = ? ORDER BY createdAt ASC',
			projectId,
		),
		characterRelationships: selectAll<CharacterRelationshipRow>(
			database,
			'SELECT * FROM character_relationships WHERE projectId = ? ORDER BY createdAt ASC',
			projectId,
		),
		locations: selectAll<LocationRow>(
			database,
			'SELECT * FROM locations WHERE projectId = ? ORDER BY createdAt ASC',
			projectId,
		),
		loreEntries: selectAll<LoreEntryRow>(
			database,
			'SELECT * FROM lore_entries WHERE projectId = ? ORDER BY createdAt ASC',
			projectId,
		),
		plotThreads: selectAll<PlotThreadRow>(
			database,
			'SELECT * FROM plot_threads WHERE projectId = ? ORDER BY createdAt ASC',
			projectId,
		),
		timelineEvents: selectAll<TimelineEventRow>(
			database,
			'SELECT * FROM timeline_events WHERE projectId = ? ORDER BY createdAt ASC',
			projectId,
		),
		storyFrames: selectAll<StoryFrameRow>(
			database,
			'SELECT * FROM story_frames WHERE projectId = ? ORDER BY updatedAt DESC',
			projectId,
		),
		acts: selectAll<ActRow>(
			database,
			'SELECT * FROM acts WHERE projectId = ? ORDER BY "order" ASC, createdAt ASC',
			projectId,
		),
		arcs: selectAll<ArcRow>(
			database,
			'SELECT * FROM arcs WHERE projectId = ? ORDER BY "order" ASC, createdAt ASC',
			projectId,
		),
		milestones: selectAll<MilestoneRow>(
			database,
			'SELECT * FROM milestones WHERE projectId = ? ORDER BY "order" ASC, createdAt ASC',
			projectId,
		),
		writingStyles: selectAll<WritingStyleRow>(
			database,
			'SELECT * FROM writing_styles WHERE projectId = ? ORDER BY createdAt ASC',
			projectId,
		),
		systemPrompts: selectAll<SystemPromptRow>(
			database,
			'SELECT * FROM system_prompts WHERE projectId = ? ORDER BY createdAt ASC',
			projectId,
		),
		chatInstructions: selectAll<ChatInstructionRow>(
			database,
			'SELECT * FROM chat_instructions WHERE projectId = ? ORDER BY createdAt ASC',
			projectId,
		),
	};
}
