// AI module public types

export type AISessionId = number;

export type NovaContextAttachmentKind = 'project' | 'file';

export interface NovaContextFileInput {
	id: string;
	name: string;
	mimeType: string;
	sizeBytes: number;
	text: string;
}

export type NovaContextMode = 'off' | 'summary' | 'targeted' | 'full';

export interface NovaContextPlan {
	mode: NovaContextMode;
	reason: string;
	projectIds: string[];
	includeFiles: boolean;
	requestedScopes: string[];
	entityHints: string[];
}

export interface NovaContextRequestPayload {
	projectIds: string[];
	files: NovaContextFileInput[];
	prompt?: string;
	mode?: NovaContextMode;
	requestedScopes?: string[];
	entityHints?: string[];
}

export interface NovaContextTruncationEntry {
	source: NovaContextAttachmentKind;
	sourceId: string;
	field: string;
	beforeChars: number;
	afterChars: number;
}

export interface NovaContextTruncationReport {
	maxChars: number;
	totalCharsBefore: number;
	totalCharsAfter: number;
	compressionPasses: number;
	finalHardTrimApplied: boolean;
	entries: NovaContextTruncationEntry[];
}

export interface NovaContextIncludedProjectItem {
	kind: 'project';
	projectId: string;
	label: string;
}

export interface NovaContextIncludedFileItem {
	kind: 'file';
	id: string;
	name: string;
	mimeType: string;
	sizeBytes: number;
}

export type NovaContextIncludedItem = NovaContextIncludedProjectItem | NovaContextIncludedFileItem;

export interface NovaContextResponsePayload {
	contextText: string;
	includedItems: NovaContextIncludedItem[];
	truncationReport: NovaContextTruncationReport;
	warnings: string[];
}

export interface NovaSessionProjectAttachment {
	id: string;
	kind: 'project';
	projectId: string;
	label: string;
}

export interface NovaSessionFileAttachment extends NovaContextFileInput {
	kind: 'file';
}

export type NovaSessionContextItem = NovaSessionProjectAttachment | NovaSessionFileAttachment;
