import {
	isExplicitlyUnsupportedBinaryAttachment,
	isSupportedTextAttachment,
} from '$lib/ai/context-files.js';
import type {
	NovaContextFileInput,
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
import { normalizeLineBreaks, renderContextText } from './context-renderers.js';

function toPositiveInt(value: unknown): number {
	if (typeof value !== 'number') return 0;
	if (!Number.isFinite(value)) return 0;
	return Math.max(0, Math.floor(value));
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

	const scopes =
		mode === 'targeted' && payload.requestedScopes && payload.requestedScopes.length > 0
			? new Set(payload.requestedScopes)
			: undefined;
	const entityHints = mode === 'targeted' ? payload.entityHints ?? [] : [];

	const normalizedProjectIds = [...new Set(payload.projectIds.map((id) => id.trim()).filter(Boolean))];
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
		projectGraphs.push(graph);
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

	const raw = renderContextText(projectGraphs, acceptedFiles, UNCAPPED, { mode, scopes, entityHints });

	let compressionPasses = 0;
	let rendered = renderContextText(projectGraphs, acceptedFiles, BASE_CAPS, { mode, scopes, entityHints });
	if (rendered.text.length > maxContextChars) {
		compressionPasses = 1;
		rendered = renderContextText(projectGraphs, acceptedFiles, COMPRESSED_CAPS, { mode, scopes, entityHints });
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
