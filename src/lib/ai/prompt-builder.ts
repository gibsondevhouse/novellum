import type { AiContext, AiTask } from './types.js';
import { resolvePromptScaffold } from './pipeline/prompt-library.js';
import {
	MAX_PROMPT_CHARS,
	CONSTRAINTS_BY_TYPE,
	TASK_DESCRIPTIONS,
	OUTPUT_FORMAT_DESCRIPTIONS,
	NOVA_IDENTITY_BLOCK,
} from './constants.js';

function serializeSceneIntent(intent: NonNullable<AiContext['sceneIntent']>): string[] {
	const lines: string[] = [];
	const goal = intent.quickGoal.trim() || intent.sceneGoal.trim();
	const obstacle = intent.quickObstacle.trim() || intent.immediateObstacle.trim();
	const outcome = intent.quickOutcome.trim() || intent.outcome.trim();

	const intentLines: string[] = [];
	if (goal) intentLines.push(`- Goal: ${goal}`);
	if (obstacle) intentLines.push(`- Obstacle: ${obstacle}`);
	if (intent.tensionSource.trim()) intentLines.push(`- Tension source: ${intent.tensionSource.trim()}`);
	if (intent.turningPoint.trim()) intentLines.push(`- Planned turning point: ${intent.turningPoint.trim()}`);
	if (outcome) intentLines.push(`- Intended outcome: ${outcome}`);
	if (intent.startState.trim() && intent.endState.trim()) {
		intentLines.push(`- State change: ${intent.startState.trim()} -> ${intent.endState.trim()}`);
	}

	if (intentLines.length > 0) {
		lines.push('\nSCENE INTENT (writer-defined direction for this scene):');
		lines.push(...intentLines);
	}

	if (intent.liveSignals.length > 0) {
		lines.push('\nLIVE WRITING SIGNALS (computed from current draft):');
		intent.liveSignals.forEach((sig) => lines.push(`- ${sig}`));
	}

	if (intent.progressFlags.length > 0) {
		lines.push('\nPROGRESS FLAGS:');
		intent.progressFlags.forEach((flag) => lines.push(`- ${flag}`));
	}

	if (intent.targetWords > 0) {
		lines.push(
			`\nDRAFT PROGRESS: ${intent.wordCount} of ${intent.targetWords} words (pacing read: ${intent.pacingHint || 'unknown'})`,
		);
	}

	return lines;
}

function serializeContext(ctx: AiContext): string {
	const lines: string[] = [];

	if (ctx.project) {
		lines.push(`PROJECT: "${ctx.project.title}"`);
		if (ctx.project.genre) lines.push(`Genre: ${ctx.project.genre}`);
		if (ctx.project.status) lines.push(`Status: ${ctx.project.status}`);
		if (ctx.project.projectType) lines.push(`Project Type: ${ctx.project.projectType}`);
		if (ctx.project.targetWordCount > 0) lines.push(`Target Word Count: ${ctx.project.targetWordCount}`);
		if (ctx.project.logline) lines.push(`Logline: ${ctx.project.logline}`);
		if (ctx.project.synopsis) lines.push(`Synopsis: ${ctx.project.synopsis}`);
		if (ctx.project.stylePresetId) lines.push(`Style Preset: ${ctx.project.stylePresetId}`);
		if (ctx.project.updatedAt) lines.push(`Updated At: ${ctx.project.updatedAt}`);
	}

	if (ctx.projectCounts) {
		lines.push('\nPROJECT COUNTS:');
		lines.push(`- Chapters: ${ctx.projectCounts.chapters}`);
		lines.push(`- Scenes: ${ctx.projectCounts.scenes}`);
		lines.push(`- Beats: ${ctx.projectCounts.beats}`);
		lines.push(`- Characters: ${ctx.projectCounts.characters}`);
		lines.push(`- Character Relationships: ${ctx.projectCounts.characterRelationships}`);
		lines.push(`- Locations: ${ctx.projectCounts.locations}`);
		lines.push(`- Lore Entries: ${ctx.projectCounts.loreEntries}`);
		lines.push(`- Plot Threads: ${ctx.projectCounts.plotThreads}`);
		lines.push(`- Timeline Events: ${ctx.projectCounts.timelineEvents}`);
		lines.push(`- Acts: ${ctx.projectCounts.acts}`);
		lines.push(`- Arcs: ${ctx.projectCounts.arcs}`);
		lines.push(`- Milestones: ${ctx.projectCounts.milestones}`);
		lines.push(`- Writing Styles: ${ctx.projectCounts.writingStyles}`);
	}

	if (ctx.storyFrames && ctx.storyFrames.length > 0) {
		lines.push('\nSTORY FRAMES:');
		ctx.storyFrames.forEach((frame, index) => {
			lines.push(`- Frame ${index + 1}: premise="${frame.premise}" theme="${frame.theme}"`);
			if (frame.toneNotes) lines.push(`  Tone Notes: ${frame.toneNotes}`);
		});
	}

	if (ctx.scene) {
		lines.push(`ACTIVE SCENE: "${ctx.scene.title}"`);
		if (ctx.scene.summary) lines.push(`Summary: ${ctx.scene.summary}`);
		if (ctx.scene.content) lines.push(`Content:\n${ctx.scene.content}`);
	}

	if (ctx.sceneIntent) {
		lines.push(...serializeSceneIntent(ctx.sceneIntent));
	}

	if (ctx.adjacentScenes.length > 0) {
		ctx.adjacentScenes.forEach((s, i) => {
			lines.push(`\nADJACENT SCENE ${i + 1}: "${s.title}"`);
			if (s.content) lines.push(s.content);
		});
	}

	if (ctx.chapter) {
		lines.push(`\nCHAPTER: "${ctx.chapter.title}"`);
		if (ctx.chapter.summary) lines.push(`Summary: ${ctx.chapter.summary}`);
	}

	if (ctx.beats.length > 0) {
		lines.push('\nBEATS:');
		ctx.beats.forEach((b) => lines.push(`- [${b.type}] ${b.title}: ${b.notes}`));
	}

	if (ctx.characters.length > 0) {
		lines.push('\nCHARACTERS:');
		ctx.characters.forEach((c) =>
			lines.push(
				`- ${c.name} (${c.role}): ${(Array.isArray(c.traits) ? c.traits : []).join(', ')}`,
			),
		);
	}

	if (ctx.locations.length > 0) {
		lines.push('\nLOCATIONS:');
		ctx.locations.forEach((l) => lines.push(`- ${l.name}: ${l.description}`));
	}

	if (ctx.loreEntries.length > 0) {
		lines.push('\nLORE:');
		ctx.loreEntries.forEach((e) => lines.push(`- [${e.category}] ${e.title}: ${e.content}`));
	}

	if (ctx.plotThreads.length > 0) {
		lines.push('\nPLOT THREADS:');
		ctx.plotThreads.forEach((t) => lines.push(`- [${t.status}] ${t.title}: ${t.description}`));
	}

	if (ctx.outlineHierarchy) {
		lines.push('\nOUTLINE HIERARCHY:');
		lines.push(`Arcs: ${ctx.outlineHierarchy.arcs.length}`);
		ctx.outlineHierarchy.arcs.forEach((arc) => {
			lines.push(`- Arc ${arc.id}: ${arc.title}`);
			if (arc.description) lines.push(`  Description: ${arc.description}`);
			if (arc.purpose) lines.push(`  Purpose: ${arc.purpose}`);
		});

		lines.push(`Acts: ${ctx.outlineHierarchy.acts.length}`);
		ctx.outlineHierarchy.acts.forEach((act) => {
			lines.push(`- Act ${act.id} [arc=${act.arcId ?? 'unassigned'}]: ${act.title}`);
			if (act.planningNotes) lines.push(`  Notes: ${act.planningNotes}`);
		});

		lines.push(`Milestones: ${ctx.outlineHierarchy.milestones.length}`);
		ctx.outlineHierarchy.milestones.forEach((milestone) => {
			lines.push(`- Milestone ${milestone.id} [act=${milestone.actId}]: ${milestone.title}`);
			if (milestone.description) lines.push(`  Description: ${milestone.description}`);
		});

		lines.push(`Chapters: ${ctx.outlineHierarchy.chapters.length}`);
		ctx.outlineHierarchy.chapters.forEach((chapter) => {
			lines.push(`- Chapter ${chapter.id} [act=${chapter.actId ?? 'unassigned'}]: ${chapter.title}`);
			if (chapter.summary) lines.push(`  Summary: ${chapter.summary}`);
		});

		lines.push(`Scenes: ${ctx.outlineHierarchy.scenes.length}`);
		ctx.outlineHierarchy.scenes.forEach((scene) => {
			lines.push(`- Scene ${scene.id} [chapter=${scene.chapterId}]: ${scene.title}`);
			if (scene.summary) lines.push(`  Summary: ${scene.summary}`);
		});

		lines.push(`Beats: ${ctx.outlineHierarchy.beats.length}`);
		ctx.outlineHierarchy.beats.forEach((beat) => {
			lines.push(`- Beat ${beat.id} [scene=${beat.sceneId ?? 'unassigned'}]: ${beat.title}`);
			if (beat.notes) lines.push(`  Notes: ${beat.notes}`);
		});

		lines.push(`Stages: ${ctx.outlineHierarchy.stages.length}`);
		ctx.outlineHierarchy.stages.forEach((stage) => {
			lines.push(`- Stage ${stage.id} [beat=${stage.beatId}]: ${stage.title} (${stage.status})`);
			if (stage.description) lines.push(`  Description: ${stage.description}`);
		});
	}

	if (ctx.timelineEvents && ctx.timelineEvents.length > 0) {
		lines.push('\nTIMELINE EVENTS:');
		ctx.timelineEvents.forEach((event) =>
			lines.push(`- ${event.title} (${event.date}): ${event.description}`),
		);
	}

	if (ctx.characterRelationships && ctx.characterRelationships.length > 0) {
		lines.push('\nCHARACTER RELATIONSHIPS:');
		ctx.characterRelationships.forEach((relation) => {
			lines.push(
				`- ${relation.characterAId} <-> ${relation.characterBId} [${relation.type}]: ${relation.description}`,
			);
		});
	}

	if (ctx.factions && ctx.factions.length > 0) {
		lines.push('\nFACTIONS:');
		ctx.factions.forEach((faction) =>
			lines.push(`- ${faction.name} (${faction.type}): ${faction.description}`),
		);
	}

	if (ctx.themes && ctx.themes.length > 0) {
		lines.push('\nTHEMES:');
		ctx.themes.forEach((theme) =>
			lines.push(`- ${theme.title}: ${theme.description} | Tension: ${theme.tensionPair}`),
		);
	}

	if (ctx.glossaryTerms && ctx.glossaryTerms.length > 0) {
		lines.push('\nGLOSSARY TERMS:');
		ctx.glossaryTerms.forEach((term) =>
			lines.push(`- ${term.term}: ${term.definition} (${term.category})`),
		);
	}

	if (ctx.writingStyles && ctx.writingStyles.length > 0) {
		lines.push('\nCUSTOM WRITING STYLES:');
		ctx.writingStyles.forEach((ws) => {
			lines.push(`- ${ws.title}: ${ws.description}`);
			if (ws.exampleText) lines.push(`  Example: ${ws.exampleText}`);
		});
	}

	if (ctx.systemPrompts && ctx.systemPrompts.length > 0) {
		const activePrompt = ctx.systemPrompts.find(p => p.isDefault) || ctx.systemPrompts[0];
		if (activePrompt) {
			lines.push(`\nSYSTEM PROMPT:\n${activePrompt.content}`);
		}
	}

	if (ctx.chatInstructions && ctx.chatInstructions.length > 0) {
		const activeInstruction = ctx.chatInstructions.find(i => i.isDefault) || ctx.chatInstructions[0];
		if (activeInstruction) {
			lines.push(`\nCUSTOM INSTRUCTIONS:\n${activeInstruction.content}`);
		}
	}

	return lines.join('\n');
}

export function buildPrompt(task: AiTask, ctx: AiContext): string {
	let role = task.role;
	let taskDescription = TASK_DESCRIPTIONS[task.taskType] ?? 'Complete the requested task.';
	let outputFormat = OUTPUT_FORMAT_DESCRIPTIONS[task.outputFormat] ?? task.outputFormat;
	const constraints = [
		'Do not invent facts outside the provided context unless explicitly instructed.',
		'Preserve all named entities unless suggesting alternatives.',
		'Stay within the defined task scope.',
		'Do not explain reasoning unless explicitly requested.',
		...(CONSTRAINTS_BY_TYPE[task.taskType] ?? []),
	];

	if (task.taskType === 'pipeline' && task.pipelineTask) {
		const scaffold = resolvePromptScaffold(task.pipelineTask.key, ctx.templates ?? []);
		role = scaffold.role;
		taskDescription = scaffold.task;
		outputFormat = OUTPUT_FORMAT_DESCRIPTIONS[scaffold.outputFormat] ?? scaffold.outputFormat;
		constraints.push(...scaffold.constraints);
		constraints.push(
			'Return strict machine-readable output matching OUTPUT FORMAT. Do not prepend commentary.',
		);
		if (task.pipelineTask.family === 'vibe-worldbuild') {
			constraints.push(
				'All entities and claims are proposals only. Treat every output as draft artifacts pending explicit user acceptance.',
			);
		}
		if (task.pipelineTask.family === 'vibe-author') {
			constraints.push(
				'Author-stage output is a proposal for the writer. Never imply manuscript edits will be auto-applied; the writer accepts or rejects every artifact.',
			);
			if (task.pipelineTask.stage === 'scene-draft') {
				constraints.push(
					'Emit the scene prose first, then append a fenced ```json sidecar block at the end of the response containing { sceneId, chapterId, povCharacterId, wordCount, usedCanonRefs, uncertainties, continuityRisks }. Do not include any text after the closing fence.',
				);
			}
		}
	}

	if (ctx.sceneIntent) {
		constraints.push(
			'Honor the writer-defined SCENE INTENT (goal, obstacle, turning point, outcome) when suggesting prose, plot moves, or revisions. Treat LIVE WRITING SIGNALS as observations the writer has not yet addressed — surface them when relevant rather than restating them verbatim.',
		);
	}

	let contextBody = serializeContext(ctx);

	const headerParts = [
		`## ROLE\n${NOVA_IDENTITY_BLOCK}\n\n${role}`,
		`## TASK\n${taskDescription}`
	];

	if (task.instruction) {
		headerParts.push(`## SPECIFIC COMMAND\n${task.instruction}`);
	}

	headerParts.push(
		`## CONTEXT\n${contextBody}`,
		`## CONSTRAINTS\n${constraints.map((c) => `- ${c}`).join('\n')}`,
		`## OUTPUT FORMAT\n${outputFormat}`
	);

	let prompt = headerParts.join('\n\n');

	// Hard truncation if over limit — trim CONTEXT section
	if (prompt.length > MAX_PROMPT_CHARS) {
		const contextIndex = headerParts.findIndex(p => p.startsWith('## CONTEXT'));
		if (contextIndex !== -1) {
			const truncationNote = '[Context truncated due to size limit; lower-priority context may be omitted]';
			headerParts[contextIndex] =
				`## CONTEXT\n${contextBody}\n` +
				truncationNote;
			prompt = headerParts.join('\n\n');
			while (prompt.length > MAX_PROMPT_CHARS && contextBody.length > 0) {
				contextBody = contextBody.slice(0, -32);
				headerParts[contextIndex] = `## CONTEXT\n${contextBody}\n${truncationNote}`;
				prompt = headerParts.join('\n\n');
			}
		}
	}

	return prompt;
}
