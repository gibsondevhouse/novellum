import { decodeJson } from '$lib/server/db/index.js';
import type {
	NovaContextFileInput,
	NovaContextMode,
	NovaContextTruncationEntry,
} from '$lib/ai/nova-context-types.js';
import type { ContextCaps } from './context-caps.js';
import type { ProjectGraph } from './context-row-types.js';

interface RenderResult {
	text: string;
	entries: NovaContextTruncationEntry[];
}

interface TruncationCollector {
	push: (entry: NovaContextTruncationEntry) => void;
}

interface AppendProjectBlockOptions {
	scopes?: ReadonlySet<string>;
	entityHints?: string[];
}

export function normalizeLineBreaks(value: string): string {
	return value.replace(/\r\n/g, '\n');
}

function maybeLine(lines: string[], label: string, value: string): void {
	const trimmed = value.trim();
	if (!trimmed) return;
	lines.push(`- ${label}: ${trimmed}`);
}

function decodeStringArray(raw: string): string[] {
	return decodeJson<string[]>(raw);
}

function decodeArcRefs(raw: string): string {
	const refs = decodeJson<Array<{ arcId: string; arcLabel?: string; role?: string }>>(raw);
	if (refs.length === 0) return 'none';
	return refs
		.map((ref) => {
			const role = ref.role ? ` (${ref.role})` : '';
			const label = ref.arcLabel ? ` ${ref.arcLabel}` : '';
			return `${ref.arcId}${label}${role}`;
		})
		.join(', ');
}

function formatList(values: string[]): string {
	return values.length > 0 ? values.join(', ') : 'none';
}

function truncateValue(
	value: string,
	maxChars: number,
	source: 'project' | 'file',
	sourceId: string,
	field: string,
	collector: TruncationCollector | null,
): string {
	const normalized = normalizeLineBreaks(value).trim();
	if (!normalized) return '';
	if (normalized.length <= maxChars) return normalized;

	const marker = `\n[Truncated from ${normalized.length} chars]`;
	const sliceMax = Math.max(0, maxChars - marker.length);
	const nextValue = `${normalized.slice(0, sliceMax).trimEnd()}${marker}`;

	collector?.push({
		source,
		sourceId,
		field,
		beforeChars: normalized.length,
		afterChars: nextValue.length,
	});

	return nextValue;
}

function filterByHints<T>(
	rows: T[],
	hints: string[],
	extract: (row: T) => Array<string | null | undefined>,
): T[] {
	if (hints.length === 0) return rows;
	const lcHints = hints.map((h) => h.toLowerCase()).filter(Boolean);
	if (lcHints.length === 0) return rows;
	const filtered = rows.filter((row) => {
		const haystack = extract(row)
			.filter((value): value is string => Boolean(value))
			.map((value) => value.toLowerCase());
		return lcHints.some((hint) => haystack.some((value) => value.includes(hint)));
	});
	return filtered.length > 0 ? filtered : rows;
}

function appendProjectBlock(
	lines: string[],
	graph: ProjectGraph,
	caps: ContextCaps,
	collector: TruncationCollector | null,
	options: AppendProjectBlockOptions = {},
): void {
	const projectId = graph.project.id;
	const scopes = options.scopes;
	const entityHints = options.entityHints ?? [];
	const inScope = (...names: string[]): boolean =>
		!scopes || names.some((name) => scopes.has(name));

	lines.push(`# Project: ${graph.project.title}`);
	lines.push(`- id: ${projectId}`);
	maybeLine(lines, 'genre', graph.project.genre);
	maybeLine(lines, 'status', graph.project.status);
	maybeLine(lines, 'projectType', graph.project.projectType);
	if (graph.project.targetWordCount > 0) {
		lines.push(`- targetWordCount: ${graph.project.targetWordCount}`);
	}
	maybeLine(
		lines,
		'logline',
		truncateValue(graph.project.logline, caps.projectLogline, 'project', projectId, 'project.logline', collector),
	);
	maybeLine(
		lines,
		'synopsis',
		truncateValue(graph.project.synopsis, caps.projectSynopsis, 'project', projectId, 'project.synopsis', collector),
	);
	maybeLine(lines, 'stylePresetId', graph.project.stylePresetId);
	maybeLine(lines, 'lastOpenedAt', graph.project.lastOpenedAt);
	maybeLine(lines, 'updatedAt', graph.project.updatedAt);

	if (inScope('chapters', 'manuscript')) {
		const chapterRows = filterByHints(graph.chapters, entityHints, (row) => [row.title]);
		lines.push(`## Chapters (${chapterRows.length})`);
		for (const chapter of chapterRows) {
			const chapterSummary = truncateValue(
				chapter.summary,
				caps.chapterSummary,
				'project',
				projectId,
				`chapter:${chapter.id}.summary`,
				collector,
			);
			lines.push(
				`- [${chapter.id}] order=${chapter.order} title="${chapter.title}" wordCount=${chapter.wordCount} actId=${chapter.actId ?? 'none'} arcRefs=${decodeArcRefs(chapter.arcRefs)}`,
			);
			if (chapterSummary) lines.push(`  summary: ${chapterSummary}`);
		}
	}

	if (inScope('scenes', 'manuscript')) {
		const sceneRows = filterByHints(graph.scenes, entityHints, (row) => [row.title]);
		lines.push(`## Scenes (${sceneRows.length})`);
		for (const scene of sceneRows) {
			const sceneSummary = truncateValue(
				scene.summary,
				caps.sceneSummary,
				'project',
				projectId,
				`scene:${scene.id}.summary`,
				collector,
			);
			const sceneContent = truncateValue(
				scene.content,
				caps.sceneContent,
				'project',
				projectId,
				`scene:${scene.id}.content`,
				collector,
			);
			const sceneNotes = truncateValue(
				scene.notes,
				caps.sceneNotes,
				'project',
				projectId,
				`scene:${scene.id}.notes`,
				collector,
			);
			lines.push(
				`- [${scene.id}] chapterId=${scene.chapterId} order=${scene.order} title="${scene.title}" wordCount=${scene.wordCount} pov=${scene.povCharacterId ?? 'none'} location=${scene.locationId ?? 'none'} timeline=${scene.timelineEventId ?? 'none'}`,
			);
			lines.push(`  characterIds: ${formatList(decodeStringArray(scene.characterIds))}`);
			lines.push(`  locationIds: ${formatList(decodeStringArray(scene.locationIds))}`);
			lines.push(`  arcRefs: ${decodeArcRefs(scene.arcRefs)}`);
			if (sceneSummary) lines.push(`  summary: ${sceneSummary}`);
			if (sceneNotes) lines.push(`  notes: ${sceneNotes}`);
			if (sceneContent) lines.push(`  content: ${sceneContent}`);
		}
	}

	if (inScope('beats', 'scenes', 'manuscript')) {
		const beatRows = filterByHints(graph.beats, entityHints, (row) => [row.title]);
		lines.push(`## Beats (${beatRows.length})`);
		for (const beat of beatRows) {
			const beatNotes = truncateValue(
				beat.notes,
				caps.beatNotes,
				'project',
				projectId,
				`beat:${beat.id}.notes`,
				collector,
			);
			lines.push(
				`- [${beat.id}] order=${beat.order} title="${beat.title}" type=${beat.type || 'n/a'} sceneId=${beat.sceneId ?? 'none'} arcId=${beat.arcId ?? 'none'}`,
			);
			if (beatNotes) lines.push(`  notes: ${beatNotes}`);
		}
	}

	if (inScope('characters')) {
		const characterRows = filterByHints(graph.characters, entityHints, (row) => [
			row.name,
			...decodeStringArray(row.aliases),
			...decodeStringArray(row.tags),
		]);
		lines.push(`## Characters (${characterRows.length})`);
		for (const character of characterRows) {
			const bio = truncateValue(
				character.bio,
				caps.characterBio,
				'project',
				projectId,
				`character:${character.id}.bio`,
				collector,
			);
			const notes = truncateValue(
				character.notes,
				caps.characterNotes,
				'project',
				projectId,
				`character:${character.id}.notes`,
				collector,
			);
			lines.push(
				`- [${character.id}] name="${character.name}" role=${character.role || 'n/a'} faction=${character.faction || 'none'} pronunciation=${character.pronunciation || 'n/a'} diasporaOrigin=${character.diasporaOrigin || 'n/a'}`,
			);
			lines.push(`  aliases: ${formatList(decodeStringArray(character.aliases))}`);
			lines.push(`  traits: ${formatList(decodeStringArray(character.traits))}`);
			lines.push(`  goals: ${formatList(decodeStringArray(character.goals))}`);
			lines.push(`  flaws: ${formatList(decodeStringArray(character.flaws))}`);
			lines.push(`  arcs: ${formatList(decodeStringArray(character.arcs))}`);
			lines.push(`  anomalies: ${formatList(decodeStringArray(character.anomalies))}`);
			lines.push(`  tags: ${formatList(decodeStringArray(character.tags))}`);
			if (bio) lines.push(`  bio: ${bio}`);
			if (notes) lines.push(`  notes: ${notes}`);
		}

		lines.push(`## Character Relationships (${graph.characterRelationships.length})`);
		for (const relation of graph.characterRelationships) {
			lines.push(
				`- [${relation.id}] ${relation.characterAId} -> ${relation.characterBId} type="${relation.type || 'n/a'}" description="${relation.description || ''}"`,
			);
		}
	}

	if (inScope('worldbuilding')) {
		const locationRows = filterByHints(graph.locations, entityHints, (row) => [
			row.name,
			...decodeStringArray(row.tags),
		]);
		lines.push(`## Locations (${locationRows.length})`);
		for (const location of locationRows) {
			const description = truncateValue(
				location.description,
				caps.locationDescription,
				'project',
				projectId,
				`location:${location.id}.description`,
				collector,
			);
			lines.push(
				`- [${location.id}] name="${location.name}" kind=${location.kind || 'n/a'} realmType=${location.realmType || 'n/a'} realmId=${location.realmId || 'none'} tone=${location.tone || 'n/a'}`,
			);
			lines.push(`  tags: ${formatList(decodeStringArray(location.tags))}`);
			lines.push(`  notableFeatures: ${formatList(decodeStringArray(location.notableFeatures))}`);
			lines.push(`  landmarkIds: ${formatList(decodeStringArray(location.landmarkIds))}`);
			lines.push(`  factionIds: ${formatList(decodeStringArray(location.factionIds))}`);
			lines.push(`  characterIds: ${formatList(decodeStringArray(location.characterIds))}`);
			lines.push(`  threadIds: ${formatList(decodeStringArray(location.threadIds))}`);
			maybeLine(lines, '  realityRules', location.realityRules);
			maybeLine(lines, '  culturalBaseline', location.culturalBaseline);
			maybeLine(lines, '  powerStructure', location.powerStructure);
			maybeLine(lines, '  conflictPressure', location.conflictPressure);
			maybeLine(lines, '  storyRole', location.storyRole);
			maybeLine(lines, '  environment', location.environment);
			maybeLine(lines, '  purpose', location.purpose);
			maybeLine(lines, '  activityType', location.activityType);
			maybeLine(lines, '  emotionalTone', location.emotionalTone);
			maybeLine(lines, '  changeOverTime', location.changeOverTime);
			if (description) lines.push(`  description: ${description}`);
		}
	}

	if (inScope('lore')) {
		const loreRows = filterByHints(graph.loreEntries, entityHints, (row) => [
			row.title,
			...decodeStringArray(row.tags),
		]);
		lines.push(`## Lore Entries (${loreRows.length})`);
		for (const lore of loreRows) {
			const content = truncateValue(
				lore.content,
				caps.loreContent,
				'project',
				projectId,
				`lore:${lore.id}.content`,
				collector,
			);
			lines.push(`- [${lore.id}] category=${lore.category || 'n/a'} title="${lore.title}"`);
			lines.push(`  tags: ${formatList(decodeStringArray(lore.tags))}`);
			if (content) lines.push(`  content: ${content}`);
		}
	}

	if (inScope('arcs')) {
		const threadRows = filterByHints(graph.plotThreads, entityHints, (row) => [row.title]);
		lines.push(`## Plot Threads (${threadRows.length})`);
		for (const thread of threadRows) {
			const description = truncateValue(
				thread.description,
				caps.plotDescription,
				'project',
				projectId,
				`plotThread:${thread.id}.description`,
				collector,
			);
			lines.push(`- [${thread.id}] status=${thread.status || 'n/a'} title="${thread.title}"`);
			lines.push(`  relatedSceneIds: ${formatList(decodeStringArray(thread.relatedSceneIds))}`);
			lines.push(`  relatedCharacterIds: ${formatList(decodeStringArray(thread.relatedCharacterIds))}`);
			if (description) lines.push(`  description: ${description}`);
		}
	}

	if (inScope('timeline')) {
		const timelineRows = filterByHints(graph.timelineEvents, entityHints, (row) => [row.title]);
		lines.push(`## Timeline Events (${timelineRows.length})`);
		for (const event of timelineRows) {
			const description = truncateValue(
				event.description,
				caps.timelineDescription,
				'project',
				projectId,
				`timelineEvent:${event.id}.description`,
				collector,
			);
			lines.push(`- [${event.id}] date=${event.date || 'n/a'} title="${event.title}"`);
			lines.push(`  relatedSceneIds: ${formatList(decodeStringArray(event.relatedSceneIds))}`);
			lines.push(`  relatedCharacterIds: ${formatList(decodeStringArray(event.relatedCharacterIds))}`);
			if (description) lines.push(`  description: ${description}`);
		}
	}

	if (inScope('outline')) {
		lines.push(`## Story Frames (${graph.storyFrames.length})`);
		for (const frame of graph.storyFrames) {
			const premise = truncateValue(
				frame.premise,
				caps.storyFrame,
				'project',
				projectId,
				`storyFrame:${frame.id}.premise`,
				collector,
			);
			const theme = truncateValue(
				frame.theme,
				caps.storyFrame,
				'project',
				projectId,
				`storyFrame:${frame.id}.theme`,
				collector,
			);
			const toneNotes = truncateValue(
				frame.toneNotes,
				caps.storyFrame,
				'project',
				projectId,
				`storyFrame:${frame.id}.toneNotes`,
				collector,
			);
			lines.push(`- [${frame.id}] updatedAt=${frame.updatedAt}`);
			if (premise) lines.push(`  premise: ${premise}`);
			if (theme) lines.push(`  theme: ${theme}`);
			if (toneNotes) lines.push(`  toneNotes: ${toneNotes}`);
		}
	}

	if (inScope('arcs')) {
		const actRows = filterByHints(graph.acts, entityHints, (row) => [row.title]);
		lines.push(`## Acts (${actRows.length})`);
		for (const act of actRows) {
			const planningNotes = truncateValue(
				act.planningNotes,
				caps.actPlanningNotes,
				'project',
				projectId,
				`act:${act.id}.planningNotes`,
				collector,
			);
			lines.push(
				`- [${act.id}] order=${act.order} title="${act.title}" arcId=${act.arcId ?? 'none'} updatedAt=${act.updatedAt}`,
			);
			if (planningNotes) lines.push(`  planningNotes: ${planningNotes}`);
		}
		const arcRows = filterByHints(graph.arcs, entityHints, (row) => [row.title]);
		lines.push(`## Arcs (${arcRows.length})`);
		for (const arc of arcRows) {
			const description = truncateValue(
				arc.description,
				caps.arcDescription,
				'project',
				projectId,
				`arc:${arc.id}.description`,
				collector,
			);
			const purpose = truncateValue(
				arc.purpose,
				caps.arcPurpose,
				'project',
				projectId,
				`arc:${arc.id}.purpose`,
				collector,
			);
			lines.push(
				`- [${arc.id}] order=${arc.order} title="${arc.title}" type=${arc.arcType ?? 'n/a'} status=${arc.status || 'n/a'}`,
			);
			if (purpose) lines.push(`  purpose: ${purpose}`);
			if (description) lines.push(`  description: ${description}`);
		}
		const milestoneRows = filterByHints(graph.milestones, entityHints, (row) => [row.title]);
		lines.push(`## Milestones (${milestoneRows.length})`);
		for (const milestone of milestoneRows) {
			const description = truncateValue(
				milestone.description,
				caps.milestoneDescription,
				'project',
				projectId,
				`milestone:${milestone.id}.description`,
				collector,
			);
			lines.push(
				`- [${milestone.id}] actId=${milestone.actId} order=${milestone.order} title="${milestone.title}"`,
			);
			lines.push(`  chapterIds: ${formatList(decodeStringArray(milestone.chapterIds))}`);
			if (description) lines.push(`  description: ${description}`);
		}
	}

	if (inScope('style')) {
		const styleRows = filterByHints(graph.writingStyles, entityHints, (row) => [row.title]);
		lines.push(`## Writing Styles (${styleRows.length})`);
		for (const style of styleRows) {
			const description = truncateValue(
				style.description,
				caps.writingStyleDescription,
				'project',
				projectId,
				`writingStyle:${style.id}.description`,
				collector,
			);
			const exampleText = truncateValue(
				style.exampleText,
				caps.writingStyleExample,
				'project',
				projectId,
				`writingStyle:${style.id}.exampleText`,
				collector,
			);
			lines.push(`- [${style.id}] title="${style.title}"`);
			if (description) lines.push(`  description: ${description}`);
			if (exampleText) lines.push(`  exampleText: ${exampleText}`);
		}
	}

	if (!scopes) {
		lines.push(`## System Prompts (${graph.systemPrompts.length})`);
		for (const prompt of graph.systemPrompts) {
			const content = truncateValue(
				prompt.content,
				caps.systemPrompt,
				'project',
				projectId,
				`systemPrompt:${prompt.id}.content`,
				collector,
			);
			lines.push(`- [${prompt.id}] name="${prompt.name}" default=${prompt.isDefault ? 'yes' : 'no'}`);
			if (content) lines.push(`  content: ${content}`);
		}

		lines.push(`## Chat Instructions (${graph.chatInstructions.length})`);
		for (const instruction of graph.chatInstructions) {
			const content = truncateValue(
				instruction.content,
				caps.chatInstruction,
				'project',
				projectId,
				`chatInstruction:${instruction.id}.content`,
				collector,
			);
			lines.push(
				`- [${instruction.id}] name="${instruction.name}" default=${instruction.isDefault ? 'yes' : 'no'}`,
			);
			if (content) lines.push(`  content: ${content}`);
		}
	}

	lines.push('');
}

function appendProjectSummaryBlock(
	lines: string[],
	graph: ProjectGraph,
	caps: ContextCaps,
	collector: TruncationCollector | null,
): void {
	const projectId = graph.project.id;
	lines.push(`# Project Summary: ${graph.project.title}`);
	lines.push(`- id: ${projectId}`);
	maybeLine(lines, 'genre', graph.project.genre);
	maybeLine(lines, 'status', graph.project.status);
	maybeLine(lines, 'projectType', graph.project.projectType);
	if (graph.project.targetWordCount > 0) {
		lines.push(`- targetWordCount: ${graph.project.targetWordCount}`);
	}
	maybeLine(
		lines,
		'logline',
		truncateValue(graph.project.logline, caps.projectLogline, 'project', projectId, 'project.logline', collector),
	);
	maybeLine(
		lines,
		'synopsis',
		truncateValue(graph.project.synopsis, caps.projectSynopsis, 'project', projectId, 'project.synopsis', collector),
	);
	maybeLine(lines, 'updatedAt', graph.project.updatedAt);

	lines.push(`## Counts`);
	lines.push(`- chapters: ${graph.chapters.length}`);
	lines.push(`- scenes: ${graph.scenes.length}`);
	lines.push(`- beats: ${graph.beats.length}`);
	lines.push(`- characters: ${graph.characters.length}`);
	lines.push(`- characterRelationships: ${graph.characterRelationships.length}`);
	lines.push(`- locations: ${graph.locations.length}`);
	lines.push(`- loreEntries: ${graph.loreEntries.length}`);
	lines.push(`- plotThreads: ${graph.plotThreads.length}`);
	lines.push(`- timelineEvents: ${graph.timelineEvents.length}`);
	lines.push(`- acts: ${graph.acts.length}`);
	lines.push(`- arcs: ${graph.arcs.length}`);
	lines.push(`- milestones: ${graph.milestones.length}`);
	lines.push(`- writingStyles: ${graph.writingStyles.length}`);

	const frame = graph.storyFrames[0];
	if (frame) {
		lines.push(`## Story Frame`);
		const premise = truncateValue(frame.premise, caps.storyFrame, 'project', projectId, `storyFrame:${frame.id}.premise`, collector);
		const theme = truncateValue(frame.theme, caps.storyFrame, 'project', projectId, `storyFrame:${frame.id}.theme`, collector);
		const toneNotes = truncateValue(frame.toneNotes, caps.storyFrame, 'project', projectId, `storyFrame:${frame.id}.toneNotes`, collector);
		if (premise) lines.push(`- premise: ${premise}`);
		if (theme) lines.push(`- theme: ${theme}`);
		if (toneNotes) lines.push(`- toneNotes: ${toneNotes}`);
	}

	lines.push('');
}

function appendFileBlocks(
	lines: string[],
	files: NovaContextFileInput[],
	caps: ContextCaps,
	collector: TruncationCollector | null,
): void {
	if (files.length === 0) return;
	lines.push('# Attached Files');
	for (const file of files) {
		lines.push(
			`## File: ${file.name} (id=${file.id}, mimeType=${file.mimeType || 'unknown'}, sizeBytes=${file.sizeBytes})`,
		);
		lines.push(
			truncateValue(file.text, caps.fileText, 'file', file.id, `file:${file.id}.text`, collector),
		);
		lines.push('');
	}
}

export function renderContextText(
	graphs: ProjectGraph[],
	files: NovaContextFileInput[],
	caps: ContextCaps,
	options: {
		mode?: NovaContextMode;
		scopes?: ReadonlySet<string>;
		entityHints?: string[];
	} = {},
): RenderResult {
	const entries: NovaContextTruncationEntry[] = [];
	const collector: TruncationCollector = {
		push: (entry) => entries.push(entry),
	};
	const lines: string[] = [];
	const mode = options.mode ?? 'full';
	for (const graph of graphs) {
		if (mode === 'summary') {
			appendProjectSummaryBlock(lines, graph, caps, collector);
		} else if (mode === 'targeted') {
			appendProjectBlock(lines, graph, caps, collector, {
				scopes: options.scopes,
				entityHints: options.entityHints,
			});
		} else {
			appendProjectBlock(lines, graph, caps, collector);
		}
	}
	appendFileBlocks(lines, files, caps, collector);

	return {
		text: lines.join('\n').trim(),
		entries,
	};
}
