import { randomUUID } from 'node:crypto';
import type Database from 'better-sqlite3';
import { db as defaultDb } from '$lib/server/db/index.js';
import type { AiControllerArtifactStatus } from './contracts.js';
import {
	ControllerArtifactLifecycleError,
	assertControllerArtifactTransition,
} from './artifact-lifecycle.js';

export const AI_CONTROLLER_ARTIFACT_OWNER_ID = 'aiControllerArtifacts.v1' as const;

export interface AiControllerStoredArtifact<TPayload = unknown> {
	id: string;
	requestId: string;
	runId: string | null;
	projectId: string | null;
	workflowId: string;
	intent: string;
	type: string;
	status: AiControllerArtifactStatus;
	payload: TPayload;
	schemaVersion: string;
	summary: string;
	decision: {
		acceptedBy?: string;
		rejectedBy?: string;
		reason?: string;
		decidedAt?: string;
	} | null;
	createdAt: string;
	updatedAt: string;
}

export interface CreateControllerArtifactInput<TPayload = unknown> {
	id?: string;
	requestId: string;
	runId?: string | null;
	projectId?: string | null;
	workflowId: string;
	intent: string;
	type: string;
	status: AiControllerArtifactStatus;
	payload: TPayload;
	schemaVersion: string;
	summary?: string;
}

export interface ControllerArtifactService {
	createArtifact<TPayload = unknown>(
		input: CreateControllerArtifactInput<TPayload>,
	): AiControllerStoredArtifact<TPayload>;
	getArtifact<TPayload = unknown>(
		projectId: string | null,
		artifactId: string,
	): AiControllerStoredArtifact<TPayload> | null;
	transitionArtifact<TPayload = unknown>(
		projectId: string | null,
		artifactId: string,
		status: AiControllerArtifactStatus,
		decision?: AiControllerStoredArtifact['decision'],
	): AiControllerStoredArtifact<TPayload>;
	acceptArtifact<TPayload = unknown>(
		projectId: string | null,
		artifactId: string,
		acceptedBy: string,
	): AiControllerStoredArtifact<TPayload>;
	rejectArtifact<TPayload = unknown>(
		projectId: string | null,
		artifactId: string,
		rejectedBy: string,
		reason: string,
	): AiControllerStoredArtifact<TPayload>;
}

export interface ControllerArtifactServiceOptions {
	db?: Database.Database;
	now?: () => string;
	createId?: () => string;
}

function storageProjectId(projectId: string | null): string {
	return projectId ?? '__global__';
}

function serialize(value: unknown): string {
	return JSON.stringify(value);
}

function parseArtifact<TPayload>(raw: string): AiControllerStoredArtifact<TPayload> {
	return JSON.parse(raw) as AiControllerStoredArtifact<TPayload>;
}

export function createControllerArtifactService(
	options: ControllerArtifactServiceOptions = {},
): ControllerArtifactService {
	const database = options.db ?? defaultDb;
	const now = options.now ?? (() => new Date().toISOString());
	const createId = options.createId ?? (() => `ai-artifact-${randomUUID()}`);

	function persist<TPayload>(artifact: AiControllerStoredArtifact<TPayload>) {
		database
			.prepare(
				`INSERT INTO project_metadata (projectId, scope, ownerId, key, value, updatedAt)
				 VALUES (?, 'pipeline', ?, ?, ?, ?)
				 ON CONFLICT(projectId, scope, ownerId, key)
				 DO UPDATE SET value = excluded.value, updatedAt = excluded.updatedAt`,
			)
			.run(
				storageProjectId(artifact.projectId),
				AI_CONTROLLER_ARTIFACT_OWNER_ID,
				artifact.id,
				serialize(artifact),
				artifact.updatedAt,
			);
	}

	return {
		createArtifact(input) {
			const timestamp = now();
			const artifact: AiControllerStoredArtifact<typeof input.payload> = {
				id: input.id ?? createId(),
				requestId: input.requestId,
				runId: input.runId ?? null,
				projectId: input.projectId ?? null,
				workflowId: input.workflowId,
				intent: input.intent,
				type: input.type,
				status: input.status,
				payload: input.payload,
				schemaVersion: input.schemaVersion,
				summary: input.summary ?? '',
				decision: null,
				createdAt: timestamp,
				updatedAt: timestamp,
			};
			persist(artifact);
			return artifact;
		},
		getArtifact(projectId, artifactId) {
			const row = database
				.prepare(
					`SELECT value FROM project_metadata
					 WHERE projectId = ? AND scope = 'pipeline' AND ownerId = ? AND key = ?`,
				)
				.get(storageProjectId(projectId), AI_CONTROLLER_ARTIFACT_OWNER_ID, artifactId) as
				| { value: string }
				| undefined;
			return row ? parseArtifact(row.value) : null;
		},
		transitionArtifact<TPayload = unknown>(
			projectId: string | null,
			artifactId: string,
			status: AiControllerArtifactStatus,
			decision: AiControllerStoredArtifact['decision'] = null,
		): AiControllerStoredArtifact<TPayload> {
			const artifact = this.getArtifact<TPayload>(projectId, artifactId);
			if (!artifact) {
				throw new ControllerArtifactLifecycleError('invalid_transition', 'Artifact was not found.');
			}
			assertControllerArtifactTransition(artifact.status, status);
			const updated: AiControllerStoredArtifact<TPayload> = {
				...artifact,
				status,
				decision,
				updatedAt: now(),
			};
			persist(updated);
			return updated;
		},
		acceptArtifact(projectId, artifactId, acceptedBy) {
			return this.transitionArtifact(projectId, artifactId, 'accepted', {
				acceptedBy,
				decidedAt: now(),
			});
		},
		rejectArtifact(projectId, artifactId, rejectedBy, reason) {
			return this.transitionArtifact(projectId, artifactId, 'rejected', {
				rejectedBy,
				reason,
				decidedAt: now(),
			});
		},
	};
}
