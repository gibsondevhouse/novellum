import { createHash } from 'node:crypto';
import type Database from 'better-sqlite3';
import { db as defaultDb } from '$lib/server/db/index.js';
import type { AiControllerJsonValue, AiControllerRequest } from './contracts.js';
import {
	AI_CONTROLLER_CONTEXT_PACKET_VERSION,
	type AiControllerContextPacket,
	type AiControllerContextSnippet,
} from './context-packet.js';

export interface AiControllerContextBuilderOptions {
	db?: Database.Database;
	now?: () => string;
	maxTokens?: number;
	maxSnippetChars?: number;
}

export interface AiControllerContextBuildInput {
	request: AiControllerRequest;
	maxTokens?: number;
}

export interface AiControllerContextBuilder {
	build(input: AiControllerContextBuildInput): AiControllerContextPacket;
}

function estimateTokens(text: string): number {
	return Math.max(1, Math.ceil(text.length / 4));
}

function compact(value: string | null | undefined, limit: number): string {
	return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, limit) : '';
}

function stableJson(value: unknown): string {
	return JSON.stringify(value, Object.keys((value && typeof value === 'object' ? value : {}) as object).sort());
}

function hashPacket(input: unknown): string {
	return `sha256:${createHash('sha256').update(JSON.stringify(input)).digest('hex')}`;
}

function jsonSummary(value: AiControllerJsonValue | undefined, limit: number): string {
	if (value === undefined) return '';
	const serialized = JSON.stringify(value);
	return serialized.length > limit ? `${serialized.slice(0, limit)}...` : serialized;
}

function makeSnippet(
	input: Omit<AiControllerContextSnippet, 'charCount' | 'estimatedTokens'>,
	maxSnippetChars: number,
): AiControllerContextSnippet {
	const text = input.text.length > maxSnippetChars
		? `${input.text.slice(0, maxSnippetChars)}...`
		: input.text;
	return {
		...input,
		text,
		charCount: text.length,
		estimatedTokens: estimateTokens(text),
	};
}

function loadProjectSnippet(
	db: Database.Database,
	projectId: string,
	maxSnippetChars: number,
): AiControllerContextSnippet | null {
	const row = db
		.prepare('SELECT title, genre, logline, synopsis FROM projects WHERE id = ?')
		.get(projectId) as
		| { title?: string; genre?: string; logline?: string; synopsis?: string }
		| undefined;
	if (!row) return null;
	const text = [
		`Title: ${compact(row.title, 120) || 'Untitled'}`,
		`Genre: ${compact(row.genre, 120) || 'Unspecified'}`,
		`Logline: ${compact(row.logline, 500) || '(none)'}`,
		`Synopsis: ${compact(row.synopsis, 1_500) || '(none)'}`,
	].join('\n');
	return makeSnippet(
		{
			id: `project:${projectId}`,
			source: 'project',
			label: 'Project summary',
			text,
			relevance: 'required',
			redacted: false,
		},
		maxSnippetChars,
	);
}

function loadSceneSnippet(
	db: Database.Database,
	sceneId: string,
	maxSnippetChars: number,
): AiControllerContextSnippet | null {
	const row = db
		.prepare('SELECT id, title, summary, content FROM scenes WHERE id = ?')
		.get(sceneId) as
		| { id: string; title?: string; summary?: string; content?: string }
		| undefined;
	if (!row) return null;
	const summary = compact(row.summary, 1_000);
	const contentPreview = compact(row.content, 1_200);
	return makeSnippet(
		{
			id: `scene:${sceneId}`,
			source: 'scene',
			label: compact(row.title, 120) || 'Scene',
			text: [
				`Scene: ${compact(row.title, 120) || row.id}`,
				summary ? `Summary: ${summary}` : '',
				contentPreview ? `Content preview: ${contentPreview}` : '',
			]
				.filter(Boolean)
				.join('\n'),
			relevance: 'required',
			redacted: Boolean(contentPreview),
		},
		maxSnippetChars,
	);
}

function enforceBudget(
	snippets: AiControllerContextSnippet[],
	maxTokens: number,
): { snippets: AiControllerContextSnippet[]; estimatedTokens: number; truncatedIds: string[] } {
	const included: AiControllerContextSnippet[] = [];
	const truncatedIds: string[] = [];
	let total = 0;
	for (const snippet of snippets) {
		if (total + snippet.estimatedTokens <= maxTokens || snippet.relevance === 'required') {
			included.push(snippet);
			total += snippet.estimatedTokens;
			continue;
		}
		truncatedIds.push(snippet.id);
	}
	return { snippets: included, estimatedTokens: total, truncatedIds };
}

export function createControllerContextBuilder(
	options: AiControllerContextBuilderOptions = {},
): AiControllerContextBuilder {
	const database = options.db ?? defaultDb;
	const now = options.now ?? (() => new Date().toISOString());
	const defaultMaxTokens = options.maxTokens ?? 4_000;
	const maxSnippetChars = options.maxSnippetChars ?? 2_000;

	return {
		build(input) {
			const request = input.request;
			const snippets: AiControllerContextSnippet[] = [];
			const instruction = compact(request.action.instruction, maxSnippetChars);
			if (instruction) {
				snippets.push(
					makeSnippet(
						{
							id: `request:${request.requestId}:instruction`,
							source: 'request',
							label: 'Author instruction',
							text: instruction,
							relevance: 'required',
							redacted: false,
						},
						maxSnippetChars,
					),
				);
			}
			const payloadSummary = jsonSummary(request.action.payload, maxSnippetChars);
			if (payloadSummary) {
				snippets.push(
					makeSnippet(
						{
							id: `request:${request.requestId}:payload`,
							source: 'request',
							label: 'Action payload summary',
							text: payloadSummary,
							relevance: 'optional',
							redacted: true,
						},
						maxSnippetChars,
					),
				);
			}
			if (request.projectId) {
				const projectSnippet = loadProjectSnippet(database, request.projectId, maxSnippetChars);
				if (projectSnippet) snippets.push(projectSnippet);
			}
			if (request.target.kind === 'scene' && request.target.id) {
				const sceneSnippet = loadSceneSnippet(database, request.target.id, maxSnippetChars);
				if (sceneSnippet) snippets.push(sceneSnippet);
			}
			for (const ref of request.contextRefs ?? []) {
				snippets.push(
					makeSnippet(
						{
							id: `ref:${ref.kind}:${ref.id}`,
							source: 'metadata',
							label: ref.reason ?? `${ref.kind} reference`,
							text: `${ref.kind}:${ref.id}`,
							relevance: ref.relevance,
							redacted: false,
						},
						maxSnippetChars,
					),
				);
			}

			const maxTokens = input.maxTokens ?? defaultMaxTokens;
			const budgeted = enforceBudget(snippets, maxTokens);
			const packetBasis = {
				version: AI_CONTROLLER_CONTEXT_PACKET_VERSION,
				projectId: request.projectId,
				target: request.target,
				contextRefs: request.contextRefs ?? [],
				snippets: budgeted.snippets.map((snippet) => ({
					id: snippet.id,
					text: snippet.text,
					relevance: snippet.relevance,
				})),
				createdAt: request.createdAt,
			};

			return {
				version: AI_CONTROLLER_CONTEXT_PACKET_VERSION,
				projectId: request.projectId,
				target: request.target,
				contextRefs: request.contextRefs ?? [],
				snippets: budgeted.snippets,
				tokenBudget: {
					maxTokens,
					estimatedTokens: budgeted.estimatedTokens,
					truncated: budgeted.truncatedIds.length > 0,
					truncatedSnippetIds: budgeted.truncatedIds,
				},
				disclosure: {
					includedSources: [...new Set(budgeted.snippets.map((snippet) => snippet.source))],
					excludedSources: budgeted.truncatedIds,
				},
				contextHash: hashPacket(stableJson(packetBasis)),
				createdAt: now(),
			};
		},
	};
}
