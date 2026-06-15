import type { AiControllerContextRef, AiControllerTargetRef } from './contracts.js';

export const AI_CONTROLLER_CONTEXT_PACKET_VERSION = '1.0.0' as const;

export interface AiControllerContextSnippet {
	id: string;
	source: 'request' | 'target' | 'project' | 'scene' | 'metadata';
	label: string;
	text: string;
	charCount: number;
	estimatedTokens: number;
	relevance: 'required' | 'optional';
	redacted: boolean;
}

export interface AiControllerTokenBudget {
	maxTokens: number;
	estimatedTokens: number;
	truncated: boolean;
	truncatedSnippetIds: string[];
}

export interface AiControllerContextPacket {
	version: typeof AI_CONTROLLER_CONTEXT_PACKET_VERSION;
	projectId: string | null;
	target: AiControllerTargetRef;
	contextRefs: AiControllerContextRef[];
	snippets: AiControllerContextSnippet[];
	tokenBudget: AiControllerTokenBudget;
	disclosure: {
		includedSources: string[];
		excludedSources: string[];
	};
	contextHash: string;
	createdAt: string;
}
