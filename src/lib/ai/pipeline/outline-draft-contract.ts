import { z } from 'zod';
import { outlineBeatSchema } from './worldbuild-schemas.js';

export const OUTLINE_DRAFT_SCHEMA_VERSION = '1.0.0' as const;
export const OUTLINE_DRAFT_CHECKPOINT_OWNER_ID = 'outlineDraftCheckpoints.v1' as const;
export const OUTLINE_DRAFT_TASK_KEY = 'vibe-outline.draft' as const;
export const OUTLINE_DRAFT_ARTIFACT_TYPE = 'vibe-outline.draft' as const;
export const OUTLINE_DRAFT_ARTIFACT_VERSION = 1 as const;
export const OUTLINE_SCENE_INTENT_MAX_LENGTH = 1_200 as const;

export const OUTLINE_DRAFT_LIFECYCLE_VALUES = [
	'draft',
	'review',
	'accepted',
	'rejected',
] as const;

export type OutlineDraftLifecycle = (typeof OUTLINE_DRAFT_LIFECYCLE_VALUES)[number];

const trimmedString = z.string().trim();
const nonEmptyString = trimmedString.min(1);
const nodeId = nonEmptyString.max(128);
const slug = nonEmptyString
	.max(128)
	.regex(/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/, 'Slug must use lowercase letters, numbers, dots, underscores, or hyphens.');
const title = nonEmptyString.max(200);
const shortText = z.string().trim().max(2_000);
const intentText = nonEmptyString.max(
	OUTLINE_SCENE_INTENT_MAX_LENGTH,
	`Scene intent must be ${OUTLINE_SCENE_INTENT_MAX_LENGTH} characters or fewer.`,
);
const isoString = nonEmptyString;

export const outlineSourceContextSchema = z
	.object({
		summary: nonEmptyString.max(2_000),
		includedDomains: z.array(nonEmptyString.max(80)).default([]),
		entityCounts: z.record(z.string(), z.number().int().nonnegative()).default({}),
		contextHash: trimmedString.max(128).optional(),
		promptVersion: trimmedString.max(80).optional(),
	})
	.strict();

export const outlineDraftSceneIntentSchema = z
	.object({
		goal: intentText,
		conflict: intentText,
		turn: intentText,
		outcome: intentText,
	})
	.strict();

export const outlineDraftSceneSchema = z
	.object({
		id: nodeId,
		slug,
		title,
		order: z.number().int().nonnegative(),
		summary: shortText.default(''),
		intent: outlineDraftSceneIntentSchema,
		povCharacterId: trimmedString.max(128).nullable().optional(),
		characterIds: z.array(nonEmptyString.max(128)).default([]),
		locationIds: z.array(nonEmptyString.max(128)).default([]),
		plotThreadIds: z.array(nonEmptyString.max(128)).default([]),
		targetWordCount: z.number().int().positive().optional(),
		beats: z.array(outlineBeatSchema).optional(),
	})
	.strict();

export const outlineDraftChapterSchema = z
	.object({
		id: nodeId,
		slug,
		title,
		order: z.number().int().nonnegative(),
		summary: shortText.default(''),
		scenes: z.array(outlineDraftSceneSchema).min(1, 'Chapter must include at least one scene.'),
	})
	.strict();

export const outlineDraftActSchema = z
	.object({
		id: nodeId,
		slug,
		title,
		order: z.number().int().nonnegative(),
		summary: shortText.default(''),
		chapters: z.array(outlineDraftChapterSchema).min(1, 'Act must include at least one chapter.'),
	})
	.strict();

export const outlineDraftArcSchema = z
	.object({
		id: nodeId,
		slug,
		title,
		order: z.number().int().nonnegative(),
		summary: shortText.default(''),
		purpose: shortText.default(''),
		acts: z.array(outlineDraftActSchema).min(1, 'Arc must include at least one act.'),
	})
	.strict();

const outlineDraftBaseSchema = z
	.object({
		type: z.literal(OUTLINE_DRAFT_ARTIFACT_TYPE),
		version: z.literal(OUTLINE_DRAFT_ARTIFACT_VERSION),
		schemaVersion: z.literal(OUTLINE_DRAFT_SCHEMA_VERSION),
		id: nodeId,
		projectId: nodeId,
		slug,
		title,
		sourceContext: outlineSourceContextSchema,
		arcs: z.array(outlineDraftArcSchema).min(1, 'Outline draft must include at least one arc.'),
	})
	.strict();

function addDuplicateIssue(
	ctx: z.RefinementCtx,
	seen: Map<string, { path: Array<string | number>; label: string }>,
	value: string,
	path: Array<string | number>,
	label: string,
): void {
	const previous = seen.get(value);
	if (!previous) {
		seen.set(value, { path, label });
		return;
	}

	ctx.addIssue({
		code: 'custom',
		path,
		message: `Duplicate outline ${label} "${value}" also appears at ${formatIssuePath(previous.path)}.`,
	});
}

function validateUniqueNodeKeys(
	draft: z.infer<typeof outlineDraftBaseSchema>,
	ctx: z.RefinementCtx,
): void {
	const ids = new Map<string, { path: Array<string | number>; label: string }>();
	const slugs = new Map<string, { path: Array<string | number>; label: string }>();

	for (let arcIndex = 0; arcIndex < draft.arcs.length; arcIndex++) {
		const arc = draft.arcs[arcIndex];
		const arcPath = ['arcs', arcIndex];
		addDuplicateIssue(ctx, ids, arc.id, [...arcPath, 'id'], 'id');
		addDuplicateIssue(ctx, slugs, arc.slug, [...arcPath, 'slug'], 'slug');

		for (let actIndex = 0; actIndex < arc.acts.length; actIndex++) {
			const act = arc.acts[actIndex];
			const actPath = [...arcPath, 'acts', actIndex];
			addDuplicateIssue(ctx, ids, act.id, [...actPath, 'id'], 'id');
			addDuplicateIssue(ctx, slugs, act.slug, [...actPath, 'slug'], 'slug');

			for (let chapterIndex = 0; chapterIndex < act.chapters.length; chapterIndex++) {
				const chapter = act.chapters[chapterIndex];
				const chapterPath = [...actPath, 'chapters', chapterIndex];
				addDuplicateIssue(ctx, ids, chapter.id, [...chapterPath, 'id'], 'id');
				addDuplicateIssue(ctx, slugs, chapter.slug, [...chapterPath, 'slug'], 'slug');

				for (let sceneIndex = 0; sceneIndex < chapter.scenes.length; sceneIndex++) {
					const scene = chapter.scenes[sceneIndex];
					const scenePath = [...chapterPath, 'scenes', sceneIndex];
					addDuplicateIssue(ctx, ids, scene.id, [...scenePath, 'id'], 'id');
					addDuplicateIssue(ctx, slugs, scene.slug, [...scenePath, 'slug'], 'slug');
				}
			}
		}
	}
}

export const outlineDraftSchema = outlineDraftBaseSchema.superRefine(validateUniqueNodeKeys);

export type OutlineSourceContext = z.infer<typeof outlineSourceContextSchema>;
export type OutlineDraftSceneIntent = z.infer<typeof outlineDraftSceneIntentSchema>;
export type OutlineDraftScene = z.infer<typeof outlineDraftSceneSchema>;
export type OutlineDraftChapter = z.infer<typeof outlineDraftChapterSchema>;
export type OutlineDraftAct = z.infer<typeof outlineDraftActSchema>;
export type OutlineDraftArc = z.infer<typeof outlineDraftArcSchema>;
export type OutlineDraft = z.infer<typeof outlineDraftSchema>;

const nullableAuditString = z.union([nonEmptyString.max(128), z.null()]);

export const outlineDraftReviewStateSchema = z
	.object({
		reviewedAt: isoString,
		reviewer: nullableAuditString,
		note: z.string().trim().max(1_000),
	})
	.strict();

export const outlineDraftAcceptanceStateSchema = z
	.object({
		acceptedAt: isoString,
		acceptedBy: nullableAuditString,
		note: z.string().trim().max(1_000),
		projectionMode: z.literal('atomic'),
		materializedCounts: z
			.object({
				arcs: z.number().int().nonnegative(),
				acts: z.number().int().nonnegative(),
				milestones: z.number().int().nonnegative(),
				chapters: z.number().int().nonnegative(),
				scenes: z.number().int().nonnegative(),
				beats: z.number().int().nonnegative(),
				stages: z.number().int().nonnegative(),
			})
			.strict(),
		hierarchyRootIds: z
			.object({
				arcIds: z.array(nodeId),
			})
			.strict(),
		sceneIntentPersisted: z.boolean(),
	})
	.strict();

export const outlineDraftRejectionStateSchema = z
	.object({
		rejectedAt: isoString,
		rejectedBy: nullableAuditString,
		reason: nonEmptyString.max(1_000),
	})
	.strict();

export const outlineDraftCheckpointSchema = z
	.object({
		id: nodeId,
		projectId: nodeId,
		ownerId: z.literal(OUTLINE_DRAFT_CHECKPOINT_OWNER_ID),
		taskKey: z.literal(OUTLINE_DRAFT_TASK_KEY),
		version: z.literal(OUTLINE_DRAFT_SCHEMA_VERSION),
		lifecycle: z.enum(OUTLINE_DRAFT_LIFECYCLE_VALUES),
		draft: outlineDraftSchema,
		createdAt: isoString,
		updatedAt: isoString,
		review: z.union([outlineDraftReviewStateSchema, z.null()]),
		acceptance: z.union([outlineDraftAcceptanceStateSchema, z.null()]),
		rejection: z.union([outlineDraftRejectionStateSchema, z.null()]),
	})
	.strict()
	.superRefine((record, ctx) => {
		if (record.draft.projectId !== record.projectId) {
			ctx.addIssue({
				code: 'custom',
				path: ['draft', 'projectId'],
				message: 'Checkpoint projectId must match draft.projectId.',
			});
		}
	});

export type OutlineDraftReviewState = z.infer<typeof outlineDraftReviewStateSchema>;
export type OutlineDraftAcceptanceState = z.infer<typeof outlineDraftAcceptanceStateSchema>;
export type OutlineDraftRejectionState = z.infer<typeof outlineDraftRejectionStateSchema>;
export type OutlineDraftCheckpointRecord = z.infer<typeof outlineDraftCheckpointSchema>;

export interface OutlineDraftValidationIssue {
	path: string;
	message: string;
	code: string;
}

export type OutlineDraftValidationResult<T> =
	| { ok: true; data: T }
	| { ok: false; issues: OutlineDraftValidationIssue[] };

function formatIssuePath(path: readonly PropertyKey[]): string {
	if (path.length === 0) return '$';
	return path.reduce<string>((acc, part) => {
		if (typeof part === 'number') return `${acc}[${part}]`;
		return acc === '$' ? `$.${String(part)}` : `${acc}.${String(part)}`;
	}, '$');
}

function summarizeIssues(error: z.ZodError): OutlineDraftValidationIssue[] {
	return error.issues.map((issue) => ({
		path: formatIssuePath(issue.path),
		message: issue.message,
		code: issue.code,
	}));
}

function parseJsonCandidate(value: unknown): OutlineDraftValidationResult<unknown> {
	if (typeof value !== 'string') return { ok: true, data: value };

	try {
		return { ok: true, data: JSON.parse(value) as unknown };
	} catch {
		return {
			ok: false,
			issues: [
				{
					path: '$',
					message: 'Outline draft payload must be valid JSON.',
					code: 'invalid_json',
				},
			],
		};
	}
}

export function validateOutlineDraft(value: unknown): OutlineDraftValidationResult<OutlineDraft> {
	const candidate = parseJsonCandidate(value);
	if (!candidate.ok) return candidate;

	const result = outlineDraftSchema.safeParse(candidate.data);
	if (!result.success) {
		return { ok: false, issues: summarizeIssues(result.error) };
	}
	return { ok: true, data: result.data };
}

export function validateOutlineDraftCheckpoint(
	value: unknown,
): OutlineDraftValidationResult<OutlineDraftCheckpointRecord> {
	const candidate = parseJsonCandidate(value);
	if (!candidate.ok) return candidate;

	const result = outlineDraftCheckpointSchema.safeParse(candidate.data);
	if (!result.success) {
		return { ok: false, issues: summarizeIssues(result.error) };
	}
	return { ok: true, data: result.data };
}
