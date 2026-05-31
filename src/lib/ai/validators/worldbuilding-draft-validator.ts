/**
 * Deterministic, side-effect-free validation and normalization for generated
 * worldbuilding entity drafts.
 *
 * Each entity kind has a required identity field (name/title). Drafts missing
 * that field are dropped. All other string fields default to '' and array
 * fields default to [] so downstream code never receives undefined.
 *
 * Mixed-validity arrays: valid drafts are retained, invalid ones dropped.
 * All-invalid arrays: validation fails with code 'all_invalid'.
 */

import type { EntityKind } from '../../../routes/api/worldbuilding/generate/+server.js';

export type DraftValidationCode = 'all_invalid' | 'count_exceeded';

export interface DraftValidationError {
	code: DraftValidationCode;
	message: string;
	droppedCount: number;
}

export type DraftValidationResult =
	| { ok: true; drafts: unknown[]; droppedCount: number }
	| { ok: false; error: DraftValidationError };

// ── Helpers ───────────────────────────────────────────────────────────────────

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function safeStr(record: Record<string, unknown>, key: string): string {
	const v = record[key];
	return typeof v === 'string' ? v.trim() : '';
}

function safeStrArr(record: Record<string, unknown>, key: string): string[] {
	const v = record[key];
	if (Array.isArray(v)) {
		return v.filter((item): item is string => typeof item === 'string').map((s) => s.trim()).filter(Boolean);
	}
	return [];
}

// ── Per-kind normalizers ───────────────────────────────────────────────────────

function normalizeCharacter(record: Record<string, unknown>): Record<string, unknown> | null {
	const name = safeStr(record, 'name');
	if (!name) return null;
	return {
		name,
		role: safeStr(record, 'role'),
		bio: safeStr(record, 'bio'),
		faction: safeStr(record, 'faction'),
		coreDesire: safeStr(record, 'coreDesire'),
		fear: safeStr(record, 'fear'),
		contradiction: safeStr(record, 'contradiction'),
		strength: safeStr(record, 'strength'),
		flaw: safeStr(record, 'flaw'),
		storyRole: safeStr(record, 'storyRole'),
		externalGoal: safeStr(record, 'externalGoal'),
		internalNeed: safeStr(record, 'internalNeed'),
		stakes: safeStr(record, 'stakes'),
		voiceSummary: safeStr(record, 'voiceSummary'),
		speechPattern: safeStr(record, 'speechPattern'),
		traits: safeStrArr(record, 'traits'),
		goals: safeStrArr(record, 'goals'),
		flaws: safeStrArr(record, 'flaws'),
		tags: safeStrArr(record, 'tags'),
		notes: safeStr(record, 'notes'),
	};
}

function normalizeFaction(record: Record<string, unknown>): Record<string, unknown> | null {
	const name = safeStr(record, 'name');
	if (!name) return null;
	return {
		name,
		type: safeStr(record, 'type'),
		description: safeStr(record, 'description'),
		mission: safeStr(record, 'mission'),
		ideology: safeStr(record, 'ideology'),
	};
}

function normalizeLineage(record: Record<string, unknown>): Record<string, unknown> | null {
	const name = safeStr(record, 'name');
	if (!name) return null;
	return {
		name,
		lineageType: safeStr(record, 'lineageType'),
		summary: safeStr(record, 'summary'),
		origin: safeStr(record, 'origin'),
		regionHomeland: safeStr(record, 'regionHomeland'),
		currentStatus: safeStr(record, 'currentStatus'),
		foundingOrigin: safeStr(record, 'foundingOrigin'),
		inheritedValues: safeStr(record, 'inheritedValues'),
	};
}

function normalizeLocation(record: Record<string, unknown>): Record<string, unknown> | null {
	const name = safeStr(record, 'name');
	if (!name) return null;
	return {
		name,
		description: safeStr(record, 'description'),
		tags: safeStrArr(record, 'tags'),
		realmType: safeStr(record, 'realmType') || null,
		realmId: safeStr(record, 'realmId') || null,
	};
}

function normalizeLoreEntry(record: Record<string, unknown>): Record<string, unknown> | null {
	const title = safeStr(record, 'title');
	if (!title) return null;
	return {
		title,
		category: safeStr(record, 'category'),
		content: safeStr(record, 'content'),
		tags: safeStrArr(record, 'tags'),
	};
}

function normalizePlotThread(record: Record<string, unknown>): Record<string, unknown> | null {
	const title = safeStr(record, 'title');
	if (!title) return null;
	return {
		title,
		description: safeStr(record, 'description'),
		status: safeStr(record, 'status') || 'planned',
	};
}

function normalizeTimelineEvent(record: Record<string, unknown>): Record<string, unknown> | null {
	const title = safeStr(record, 'title');
	if (!title) return null;
	return {
		title,
		description: safeStr(record, 'description'),
		date: safeStr(record, 'date'),
	};
}

function normalizeByKind(
	record: Record<string, unknown>,
	kind: EntityKind,
): Record<string, unknown> | null {
	switch (kind) {
		case 'character':
			return normalizeCharacter(record);
		case 'faction':
			return normalizeFaction(record);
		case 'lineage':
			return normalizeLineage(record);
		case 'realm':
		case 'landmark':
			return normalizeLocation(record);
		case 'lore-entry':
			return normalizeLoreEntry(record);
		case 'plot-thread':
			return normalizePlotThread(record);
		case 'timeline-event':
			return normalizeTimelineEvent(record);
	}
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Validates and normalizes an array of raw AI-generated drafts for a given entity kind.
 *
 * - Drops drafts that are not plain objects or that are missing their identity field.
 * - Normalizes surviving drafts so consumers receive predictable field shapes.
 * - Returns ok:false when zero valid drafts survive.
 */
export function validateGeneratedDrafts(
	rawDrafts: unknown[],
	kind: EntityKind,
	maxCount: number,
): DraftValidationResult {
	const valid: Record<string, unknown>[] = [];
	let droppedCount = 0;

	for (const raw of rawDrafts) {
		if (!isRecord(raw)) {
			droppedCount++;
			continue;
		}
		const normalized = normalizeByKind(raw, kind);
		if (!normalized) {
			droppedCount++;
			continue;
		}
		valid.push(normalized);
	}

	if (valid.length === 0) {
		return {
			ok: false,
			error: {
				code: 'all_invalid',
				message: `All ${rawDrafts.length} generated ${kind} drafts were invalid (missing required identity field).`,
				droppedCount,
			},
		};
	}

	return {
		ok: true,
		drafts: valid.slice(0, maxCount),
		droppedCount,
	};
}
