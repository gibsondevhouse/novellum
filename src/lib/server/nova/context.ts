import {
	isExplicitlyUnsupportedBinaryAttachment,
	isSupportedTextAttachment,
} from '$lib/ai/context-files.js';
import type {
	NovaContextEntityKind,
	NovaContextFileInput,
	NovaContextIncludedEntityItem,
	NovaContextIncludedItem,
	NovaContextMode,
	NovaContextRequestPayload,
	NovaContextResponsePayload,
} from '$lib/ai/nova-context-types.js';
import {
	BASE_CAPS,
	COMPRESSED_CAPS,
	DEFAULT_MAX_CONTEXT_CHARS,
	FINAL_TRIM_BUFFER,
	MODE_BUDGETS,
} from './context-caps.js';
import { getProjectGraph } from './context-graph.js';
import type { SqliteLike } from './context-graph.js';
import type { ProjectGraph } from './context-row-types.js';
import { normalizeLineBreaks, renderContextText } from './context-renderers.js';

function toPositiveInt(value: unknown): number {
	if (typeof value !== 'number') return 0;
	if (!Number.isFinite(value)) return 0;
	return Math.max(0, Math.floor(value));
}

function normalizeEntityIds(ids: string[] | undefined): string[] {
	if (!ids) return [];
	return [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
}

function filterJsonIds(raw: string, excludedEntityIds: ReadonlySet<string>): string {
	try {
		const parsed = JSON.parse(raw) as unknown;
		if (!Array.isArray(parsed)) return raw;
		const filtered = parsed.filter((entry) => {
			if (typeof entry === 'string') return !excludedEntityIds.has(entry);
			if (typeof entry === 'object' && entry !== null) {
				const record = entry as Record<string, unknown>;
				const id =
					typeof record.id === 'string'
						? record.id
						: typeof record.arcId === 'string'
							? record.arcId
							: null;
				return !id || !excludedEntityIds.has(id);
			}
			return true;
		});
		return JSON.stringify(filtered);
	} catch {
		return raw;
	}
}

function applyExcludedEntityIds(
	graph: ProjectGraph,
	excludedEntityIds: ReadonlySet<string>,
): ProjectGraph {
	if (excludedEntityIds.size === 0) return graph;
	const isExcluded = (id: string | null | undefined): boolean =>
		typeof id === 'string' && excludedEntityIds.has(id);

	return {
		...graph,
		chapters: graph.chapters
			.filter((row) => !isExcluded(row.id))
			.map((row) => ({
				...row,
				actId: isExcluded(row.actId) ? null : row.actId,
				arcRefs: filterJsonIds(row.arcRefs, excludedEntityIds),
			})),
		scenes: graph.scenes
			.filter((row) => !isExcluded(row.id))
			.map((row) => ({
				...row,
				chapterId: isExcluded(row.chapterId) ? '' : row.chapterId,
				povCharacterId: isExcluded(row.povCharacterId) ? null : row.povCharacterId,
				locationId: isExcluded(row.locationId) ? null : row.locationId,
				timelineEventId: isExcluded(row.timelineEventId) ? null : row.timelineEventId,
				characterIds: filterJsonIds(row.characterIds, excludedEntityIds),
				locationIds: filterJsonIds(row.locationIds, excludedEntityIds),
				arcRefs: filterJsonIds(row.arcRefs, excludedEntityIds),
			})),
		beats: graph.beats
			.filter((row) => !isExcluded(row.id))
			.map((row) => ({
				...row,
				sceneId: isExcluded(row.sceneId) ? null : row.sceneId,
				arcId: isExcluded(row.arcId) ? null : row.arcId,
			})),
		characters: graph.characters.filter((row) => !isExcluded(row.id)),
		characterRelationships: graph.characterRelationships.filter(
			(row) =>
				!isExcluded(row.id) && !isExcluded(row.characterAId) && !isExcluded(row.characterBId),
		),
		locations: graph.locations
			.filter((row) => !isExcluded(row.id))
			.map((row) => ({
				...row,
				realmId: isExcluded(row.realmId) ? '' : row.realmId,
				landmarkIds: filterJsonIds(row.landmarkIds, excludedEntityIds),
				factionIds: filterJsonIds(row.factionIds, excludedEntityIds),
				characterIds: filterJsonIds(row.characterIds, excludedEntityIds),
				threadIds: filterJsonIds(row.threadIds, excludedEntityIds),
			})),
		loreEntries: graph.loreEntries.filter((row) => !isExcluded(row.id)),
		plotThreads: graph.plotThreads
			.filter((row) => !isExcluded(row.id))
			.map((row) => ({
				...row,
				relatedSceneIds: filterJsonIds(row.relatedSceneIds, excludedEntityIds),
				relatedCharacterIds: filterJsonIds(row.relatedCharacterIds, excludedEntityIds),
			})),
		timelineEvents: graph.timelineEvents
			.filter((row) => !isExcluded(row.id))
			.map((row) => ({
				...row,
				relatedSceneIds: filterJsonIds(row.relatedSceneIds, excludedEntityIds),
				relatedCharacterIds: filterJsonIds(row.relatedCharacterIds, excludedEntityIds),
			})),
		storyFrames: graph.storyFrames.filter((row) => !isExcluded(row.id)),
		acts: graph.acts
			.filter((row) => !isExcluded(row.id))
			.map((row) => ({ ...row, arcId: isExcluded(row.arcId) ? null : row.arcId })),
		arcs: graph.arcs.filter((row) => !isExcluded(row.id)),
		milestones: graph.milestones
			.filter((row) => !isExcluded(row.id))
			.map((row) => ({
				...row,
				actId: isExcluded(row.actId) ? '' : row.actId,
				chapterIds: filterJsonIds(row.chapterIds, excludedEntityIds),
			})),
		writingStyles: graph.writingStyles.filter((row) => !isExcluded(row.id)),
		systemPrompts: graph.systemPrompts.filter((row) => !isExcluded(row.id)),
		chatInstructions: graph.chatInstructions.filter((row) => !isExcluded(row.id)),
	};
}

function findPinnedEntity(
	graph: ProjectGraph,
	id: string,
): Omit<NovaContextIncludedEntityItem, 'kind' | 'inclusion'> | null {
	const projectId = graph.project.id;
	const pick = <T>(
		rows: T[],
		entityType: NovaContextEntityKind,
		getId: (row: T) => string,
		getLabel: (row: T) => string,
	): Omit<NovaContextIncludedEntityItem, 'kind' | 'inclusion'> | null => {
		const row = rows.find((candidate) => getId(candidate) === id);
		if (!row) return null;
		return { id, projectId, entityType, label: getLabel(row).trim() || id };
	};

	return (
		pick(
			graph.characters,
			'character',
			(row) => row.id,
			(row) => row.name,
		) ??
		pick(
			graph.locations,
			'location',
			(row) => row.id,
			(row) => row.name,
		) ??
		pick(
			graph.loreEntries,
			'loreEntry',
			(row) => row.id,
			(row) => row.title,
		) ??
		pick(
			graph.plotThreads,
			'plotThread',
			(row) => row.id,
			(row) => row.title,
		) ??
		pick(
			graph.timelineEvents,
			'timelineEvent',
			(row) => row.id,
			(row) => row.title,
		) ??
		pick(
			graph.scenes,
			'scene',
			(row) => row.id,
			(row) => row.title,
		) ??
		pick(
			graph.chapters,
			'chapter',
			(row) => row.id,
			(row) => row.title,
		) ??
		null
	);
}

function getPinnedIncludedItems(
	graphs: ProjectGraph[],
	pinnedEntityIds: string[],
): NovaContextIncludedEntityItem[] {
	const items: NovaContextIncludedEntityItem[] = [];
	const seen = new Set<string>();
	for (const id of pinnedEntityIds) {
		for (const graph of graphs) {
			const entity = findPinnedEntity(graph, id);
			if (!entity) continue;
			const key = `${entity.projectId}:${entity.entityType}:${entity.id}`;
			if (seen.has(key)) continue;
			seen.add(key);
			items.push({ ...entity, kind: 'entity', inclusion: 'pinned' });
			break;
		}
	}
	return items;
}

interface AcceptedFilesResult {
	accepted: NovaContextFileInput[];
	warnings: string[];
}

function acceptFiles(files: NovaContextFileInput[]): AcceptedFilesResult {
	const warnings: string[] = [];
	const accepted: NovaContextFileInput[] = [];

	for (const file of files) {
		const fileRef = file.name ? `"${file.name}"` : 'a file';
		if (!isSupportedTextAttachment(file)) {
			if (isExplicitlyUnsupportedBinaryAttachment(file)) {
				warnings.push(`${fileRef} is not supported yet. Use text, markdown, JSON, or CSV for now.`);
			} else {
				warnings.push(`${fileRef} is not a supported text attachment and was skipped.`);
			}
			continue;
		}

		if (!file.text?.trim()) {
			warnings.push(`${fileRef} is empty and was skipped.`);
			continue;
		}

		accepted.push({
			id: file.id,
			name: file.name.trim(),
			mimeType: file.mimeType.trim(),
			sizeBytes: toPositiveInt(file.sizeBytes),
			text: normalizeLineBreaks(file.text),
		});
	}

	return { accepted, warnings };
}

export function buildNovaContext(
	database: SqliteLike,
	payload: NovaContextRequestPayload,
	options?: { maxContextChars?: number },
): NovaContextResponsePayload {
	const mode: NovaContextMode = payload.mode ?? 'full';
	const modeBudget = MODE_BUDGETS[mode] ?? DEFAULT_MAX_CONTEXT_CHARS;
	const maxContextChars = options?.maxContextChars ?? modeBudget;
	const warnings: string[] = [];
	const pinnedEntityIds = normalizeEntityIds(payload.pinnedEntityIds);
	const excludedEntityIds = normalizeEntityIds(payload.excludedEntityIds);
	const excludedEntityIdSet = new Set(excludedEntityIds);
	const pinnedEntityIdSet = new Set(pinnedEntityIds.filter((id) => !excludedEntityIdSet.has(id)));
	const pinnedExcludedIds = pinnedEntityIds.filter((id) => excludedEntityIdSet.has(id));
	if (pinnedExcludedIds.length > 0) {
		warnings.push(
			`Excluded context overrides took precedence over pinned IDs: ${pinnedExcludedIds.join(', ')}.`,
		);
	}

	const scopes =
		mode === 'targeted' && payload.requestedScopes && payload.requestedScopes.length > 0
			? new Set(payload.requestedScopes)
			: undefined;
	const entityHints = mode === 'targeted' ? (payload.entityHints ?? []) : [];

	const normalizedProjectIds = [
		...new Set(payload.projectIds.map((id) => id.trim()).filter(Boolean)),
	];
	const { accepted: acceptedFiles, warnings: fileWarnings } = acceptFiles(payload.files);
	warnings.push(...fileWarnings);

	const includedItems: NovaContextIncludedItem[] = [];
	const projectGraphs = [];
	for (const projectId of normalizedProjectIds) {
		const graph = getProjectGraph(database, projectId);
		if (!graph) {
			warnings.push(`Project "${projectId}" was not found and was skipped.`);
			continue;
		}
		projectGraphs.push(applyExcludedEntityIds(graph, excludedEntityIdSet));
		includedItems.push({
			kind: 'project',
			projectId: graph.project.id,
			label: graph.project.title,
		});
	}

	for (const file of acceptedFiles) {
		includedItems.push({
			kind: 'file',
			id: file.id,
			name: file.name,
			mimeType: file.mimeType,
			sizeBytes: file.sizeBytes,
		});
	}
	includedItems.push(...getPinnedIncludedItems(projectGraphs, [...pinnedEntityIdSet]));

	const UNCAPPED: typeof BASE_CAPS = {
		...BASE_CAPS,
		fileText: Number.MAX_SAFE_INTEGER,
		sceneContent: Number.MAX_SAFE_INTEGER,
		characterBio: Number.MAX_SAFE_INTEGER,
		characterNotes: Number.MAX_SAFE_INTEGER,
		locationDescription: Number.MAX_SAFE_INTEGER,
		loreContent: Number.MAX_SAFE_INTEGER,
		plotDescription: Number.MAX_SAFE_INTEGER,
		timelineDescription: Number.MAX_SAFE_INTEGER,
		systemPrompt: Number.MAX_SAFE_INTEGER,
		chatInstruction: Number.MAX_SAFE_INTEGER,
		writingStyleExample: Number.MAX_SAFE_INTEGER,
		projectSynopsis: Number.MAX_SAFE_INTEGER,
		projectLogline: Number.MAX_SAFE_INTEGER,
		chapterSummary: Number.MAX_SAFE_INTEGER,
		sceneSummary: Number.MAX_SAFE_INTEGER,
		sceneNotes: Number.MAX_SAFE_INTEGER,
		beatNotes: Number.MAX_SAFE_INTEGER,
		storyFrame: Number.MAX_SAFE_INTEGER,
		actPlanningNotes: Number.MAX_SAFE_INTEGER,
		arcDescription: Number.MAX_SAFE_INTEGER,
		arcPurpose: Number.MAX_SAFE_INTEGER,
		milestoneDescription: Number.MAX_SAFE_INTEGER,
		writingStyleDescription: Number.MAX_SAFE_INTEGER,
	};

	const renderOptions = { mode, scopes, entityHints, pinnedEntityIds: pinnedEntityIdSet };

	const raw = renderContextText(projectGraphs, acceptedFiles, UNCAPPED, renderOptions);

	let compressionPasses = 0;
	let rendered = renderContextText(projectGraphs, acceptedFiles, BASE_CAPS, renderOptions);
	if (rendered.text.length > maxContextChars) {
		compressionPasses = 1;
		rendered = renderContextText(projectGraphs, acceptedFiles, COMPRESSED_CAPS, renderOptions);
	}

	let finalHardTrimApplied = false;
	let contextText = rendered.text;
	const finalEntries = [...rendered.entries];
	if (contextText.length > maxContextChars) {
		finalHardTrimApplied = true;
		const before = contextText.length;
		const slice = Math.max(0, maxContextChars - FINAL_TRIM_BUFFER);
		contextText = `${contextText.slice(0, slice).trimEnd()}\n\n[Context hard-trimmed to fit token budget]`;
		finalEntries.push({
			source: 'project',
			sourceId: 'global',
			field: 'context.hardTrim',
			beforeChars: before,
			afterChars: contextText.length,
		});
	}

	if (compressionPasses > 0) {
		warnings.push('Context exceeded the standard budget and was compressed before sending.');
	}
	if (finalHardTrimApplied) {
		warnings.push('Context still exceeded limits after compression and was hard-trimmed.');
	}

	return {
		contextText,
		includedItems,
		truncationReport: {
			maxChars: maxContextChars,
			totalCharsBefore: raw.text.length,
			totalCharsAfter: contextText.length,
			compressionPasses,
			finalHardTrimApplied,
			entries: finalEntries,
		},
		warnings: [...new Set(warnings)],
	};
}
