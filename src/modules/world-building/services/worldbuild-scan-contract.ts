/**
 * Scan context contract for the agentic worldbuild scan feature.
 *
 * Defines the exact set of project metadata and canon fields that are allowed
 * as input to a worldbuild scan request. Forbidden fields (systemPrompt,
 * negativePrompt, manuscript content, etc.) must never enter the scan envelope.
 *
 * All scan suggestions remain non-canonical proposals until explicit author
 * accept. No contract here permits direct canon writes.
 */

import type { WorldbuildingDomainId } from '../worldbuilding-workflow.js';

// ---------------------------------------------------------------------------
// Project context — allowed subset of project metadata for scan inputs
// ---------------------------------------------------------------------------

export interface WorldbuildScanProjectContext {
	projectId: string;
	title: string;
	/** Comma-separated genre string as stored in the project record. */
	genre: string;
	/**
	 * One-line project logline. May be empty string; callers must handle the
	 * degraded scan quality when this is missing.
	 */
	logline: string;
	/**
	 * Full synopsis text. May be empty string; callers must handle the
	 * degraded scan quality when this is missing.
	 */
	synopsis: string;
}

/**
 * Fields explicitly forbidden from the scan context envelope.
 *
 * These must never be included in a `WorldbuildScanProjectContext` or passed
 * to any scan-related prompt or API call. The list is documentation-enforced
 * here and must be respected in all scan service implementations.
 */
export const SCAN_CONTEXT_FORBIDDEN_PROJECT_FIELDS = [
	'systemPrompt',
	'negativePrompt',
	'coverUrl',
	'targetWordCount',
	'status',
	'stylePresetId',
	'projectType',
	'lastOpenedAt',
	'createdAt',
	'updatedAt',
] as const;

// ---------------------------------------------------------------------------
// Canon context — existing accepted worldbuilding entities as grounding refs
// ---------------------------------------------------------------------------

/**
 * Compact summary of existing canon entities, scoped to identifying fields
 * only. Used for duplicate suppression and grounding, not for full content
 * inclusion. Only accepted canon (not pending proposals) should appear here.
 */
export interface WorldbuildScanCanonContext {
	/** Names of accepted characters. */
	characterNames: string[];
	/** Names of accepted factions. */
	factionNames: string[];
	/** Names of accepted locations (both realms and landmarks). */
	locationNames: string[];
	/** Titles of accepted lore entries. */
	loreEntryTitles: string[];
	/** Titles of accepted plot threads. */
	plotThreadTitles: string[];
	/** Titles of accepted timeline events. */
	timelineEventTitles: string[];
}

// ---------------------------------------------------------------------------
// Combined scan context envelope
// ---------------------------------------------------------------------------

export interface WorldbuildScanContextEnvelope {
	project: WorldbuildScanProjectContext;
	/**
	 * Canon summary used for grounding and dedupe. May have empty arrays if no
	 * canon exists yet (valid for a first-scan of a new project).
	 */
	canon: WorldbuildScanCanonContext;
}

// ---------------------------------------------------------------------------
// Scan request shape
// ---------------------------------------------------------------------------

export interface WorldbuildScanRequest {
	/** Owning project id. Must match `context.project.projectId`. */
	projectId: string;
	/** Domain scope for this scan run. Scans are always per-domain. */
	domainScope: WorldbuildingDomainId;
	/** Assembled context envelope. */
	context: WorldbuildScanContextEnvelope;
	/**
	 * Max number of proposals to generate in this scan run.
	 * Defaults to 3 if omitted. Hard ceiling is 5.
	 */
	maxProposals?: 1 | 3 | 5;
}

// ---------------------------------------------------------------------------
// Context sufficiency check
// ---------------------------------------------------------------------------

export type ScanContextMissingField = 'title' | 'logline' | 'synopsis';

export type ScanContextSufficiencyResult =
	| { sufficient: true }
	| { sufficient: false; missing: ScanContextMissingField[] };

/**
 * Check whether a project context envelope contains enough metadata to produce
 * useful scan suggestions.
 *
 * A missing logline or synopsis does not block the scan entirely, but callers
 * should surface a prompt to the author before proceeding with an insufficient
 * context scan so they understand quality may be degraded.
 *
 * Title is always required; a missing title is a hard insufficiency.
 */
export function checkScanContextSufficiency(
	project: WorldbuildScanProjectContext,
): ScanContextSufficiencyResult {
	const missing: ScanContextMissingField[] = [];

	if (!project.title.trim()) missing.push('title');
	if (!project.logline.trim()) missing.push('logline');
	if (!project.synopsis.trim()) missing.push('synopsis');

	if (missing.length > 0) return { sufficient: false, missing };
	return { sufficient: true };
}

/**
 * Build a `WorldbuildScanProjectContext` from a Project record, keeping only
 * the allowed scan context fields and explicitly excluding forbidden fields.
 */
export function buildScanProjectContext(project: {
	id: string;
	title: string;
	genre: string;
	logline: string;
	synopsis: string;
}): WorldbuildScanProjectContext {
	return {
		projectId: project.id,
		title: project.title,
		genre: project.genre,
		logline: project.logline,
		synopsis: project.synopsis,
	};
}
