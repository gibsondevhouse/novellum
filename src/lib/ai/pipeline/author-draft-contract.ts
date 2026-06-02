import { z } from 'zod';

export const AUTHOR_DRAFT_CHECKPOINT_OWNER_ID = 'authorDraftCheckpoints.v1' as const;
export const AUTHOR_DRAFT_TASK_KEY = 'vibe-author.scene-draft' as const;
export const AUTHOR_DRAFT_ARTIFACT_TYPE = 'vibe-author.scene-draft' as const;
export const AUTHOR_DRAFT_ARTIFACT_VERSION = 1 as const;

const trimmedString = z.string().transform((value) => value.trim());

const stringListField = z
	.array(z.string())
	.transform((items) => items.map((item) => item.trim()).filter((item) => item.length > 0));

export const authorDraftArtifactSchema = z
	.object({
		type: z.literal(AUTHOR_DRAFT_ARTIFACT_TYPE),
		version: z.literal(AUTHOR_DRAFT_ARTIFACT_VERSION),
		projectId: trimmedString,
		chapterId: trimmedString,
		sceneId: trimmedString,
		title: trimmedString.optional(),
		prose: z.string(),
		wordCount: z.number().int().nonnegative(),
		sidecar: z
			.object({
				sceneId: trimmedString,
				chapterId: trimmedString,
				povCharacterId: z.union([trimmedString, z.null()]).optional(),
				wordCount: z.number().int().nonnegative(),
				usedCanonRefs: stringListField,
				uncertainties: stringListField,
				continuityRisks: stringListField,
			})
			.strict(),
	})
	.strict();

export type AuthorDraftArtifact = z.infer<typeof authorDraftArtifactSchema>;

export const AUTHOR_DRAFT_LIFECYCLE_VALUES = ['review', 'accepted', 'rejected'] as const;
export type AuthorDraftLifecycle = (typeof AUTHOR_DRAFT_LIFECYCLE_VALUES)[number];

export const authorDraftCheckpointSchema = z
	.object({
		id: trimmedString,
		projectId: trimmedString,
		taskKey: z.literal(AUTHOR_DRAFT_TASK_KEY),
		sceneId: trimmedString,
		chapterId: trimmedString,
		artifactEnvelope: authorDraftArtifactSchema,
		lifecycle: z.enum(AUTHOR_DRAFT_LIFECYCLE_VALUES),
		createdAt: trimmedString,
		updatedAt: trimmedString,
		acceptedAt: trimmedString.optional(),
		rejectedAt: trimmedString.optional(),
		appliedToSceneId: trimmedString.optional(),
		rejectReason: trimmedString.optional(),
		baseSceneUpdatedAt: trimmedString,
		baseSceneContentHash: trimmedString.optional(),
	})
	.strict();

export type AuthorDraftCheckpoint = z.infer<typeof authorDraftCheckpointSchema>;

export type SceneDraftContext = {
	project: {
		title: string;
		logline?: string;
		synopsis?: string;
	};
	chapter: {
		id: string;
		title?: string;
		position: number;
		summary?: string;
	};
	scene: {
		id: string;
		position: number;
		title?: string;
		goal?: string;
		conflict?: string;
		turn?: string;
		outcome?: string;
		povCharacterId?: string;
		targetWordCount?: number;
	};
	continuity: {
		relevantCanonRefs: string[];
		priorSceneSummary?: string;
		unresolvedThreads: string[];
	};
};
