<!--
	Renders the Nova conversation message log: user bubbles, assistant prose,
	tool-call / tool-result chips, and inline error states. Stateless — all
	data flows in via props.
-->
<script lang="ts">
	import { safeHtml } from '$lib/ai/markdown.js';
	import type { AuthorSceneDraftPayload } from '$lib/ai/pipeline/author-agent.js';
	import type { AuthorDraftCheckpoint } from '$lib/ai/pipeline/author-draft-contract.js';
	import type { AuthorRevisionPack } from '$lib/ai/pipeline/author-schemas.js';
	import type { PipelineArtifactEnvelope } from '$lib/ai/pipeline/contracts.js';
	import { dispatchSceneContentApplied } from '$lib/events/scene-content.js';
	import { editorDirty } from '$lib/stores/editor-dirty.svelte.js';
	import type { NovaMessage } from '../types.js';
	import {
		acceptSceneDraftCheckpoint,
		fetchSceneById,
		type AuthorDraftApiError,
	} from '../services/author-draft-api.js';
	import {
		classifyNovaArtifactAction,
		createInsufficientContextResult,
		createNovaArtifactActionResult,
		createStaleTargetResult,
		type NovaArtifactActionResult,
	} from '../services/artifact-action-types.js';
	import {
		rejectInlineSceneDraftCheckpoint,
		stageInlineSceneDraftCheckpoint,
		type StageInlineSceneDraftResultData,
	} from '../services/inline-scene-draft-actions.js';
	import {
		acknowledgeRevisionPackIssue,
		loadRevisionPackAcknowledgements,
		revisionPackAcknowledgementKey,
		type RevisionPackAcknowledgementState,
	} from '../services/revision-pack-acknowledgements.js';
	import NovaErrorBoundary from './NovaErrorBoundary.svelte';
	import NovaOutlineCard from './NovaOutlineCard.svelte';
	import NovaSceneDraftCard from './NovaSceneDraftCard.svelte';
	import NovaRevisionPackCard from './NovaRevisionPackCard.svelte';
	import { classifyNovaError } from '../utils/classify-nova-error.js';

	interface Props {
		messages: NovaMessage[];
		novaError: string | null;
		novaErrorType: ReturnType<typeof classifyNovaError> | null;
		onRetry: () => void;
		projectId?: string | null;
	}

	let { messages, novaError, novaErrorType, onRetry, projectId = null }: Props = $props();

	interface RevisionAcknowledgementUiState {
		loading: boolean;
		acknowledgedIssueIds: string[];
		error: string | null;
	}

	let revisionAcknowledgements = $state<Record<string, RevisionAcknowledgementUiState>>({});

	function isMissingCredentialsError(message: NovaMessage): boolean {
		return classifyNovaError(message.error ?? '') === 'invalid_key';
	}

	function renderAssistant(content: string): string {
		return safeHtml(content);
	}

	function formatToolPayload(payload: unknown): string {
		try {
			return JSON.stringify(payload ?? null, null, 2);
		} catch {
			return String(payload);
		}
	}

	function getToolResultStatus(message: NovaMessage): string {
		const payload = message.toolPayload;
		if (
			payload &&
			typeof payload === 'object' &&
			'status' in payload &&
			typeof (payload as { status: unknown }).status === 'string'
		) {
			return (payload as { status: string }).status;
		}
		return 'unknown';
	}

	function getToolResultError(message: NovaMessage): string | undefined {
		const payload = message.toolPayload;
		if (
			payload &&
			typeof payload === 'object' &&
			'error' in payload &&
			typeof (payload as { error: unknown }).error === 'string'
		) {
			return (payload as { error: string }).error;
		}
		return undefined;
	}

	function isToolStatusError(status: string): boolean {
		return status === 'error' || status === 'not-yet-supported';
	}

	function revisionAckKey(envelope: PipelineArtifactEnvelope<AuthorRevisionPack>): string {
		return revisionPackAcknowledgementKey(envelope);
	}

	function upsertRevisionAckState(
		key: string,
		next: RevisionAcknowledgementUiState,
	): void {
		revisionAcknowledgements = {
			...revisionAcknowledgements,
			[key]: next,
		};
	}

	function setRevisionAckStateFromPersisted(
		state: RevisionPackAcknowledgementState,
		loading = false,
		error: string | null = null,
	): void {
		upsertRevisionAckState(state.artifactKey, {
			loading,
			acknowledgedIssueIds: state.acknowledgedIssueIds,
			error,
		});
	}

	async function ensureRevisionAcknowledgements(
		envelope: PipelineArtifactEnvelope<AuthorRevisionPack>,
	): Promise<void> {
		const key = revisionAckKey(envelope);
		if (!projectId || revisionAcknowledgements[key]) return;
		upsertRevisionAckState(key, {
			loading: true,
			acknowledgedIssueIds: [],
			error: null,
		});
		try {
			const state = await loadRevisionPackAcknowledgements(projectId, envelope);
			setRevisionAckStateFromPersisted(state);
		} catch (err) {
			upsertRevisionAckState(key, {
				loading: false,
				acknowledgedIssueIds: [],
				error: err instanceof Error ? err.message : 'Could not load acknowledgements.',
			});
		}
	}

	$effect(() => {
		const _projectId = projectId;
		for (const message of messages) {
			if (message.artifact?.kind === 'author-revision-pack') {
				void ensureRevisionAcknowledgements(message.artifact.envelope);
			}
		}
	});

	function sceneDraftActionBase(
		envelope: PipelineArtifactEnvelope<AuthorSceneDraftPayload>,
		checkpoint: AuthorDraftCheckpoint,
	) {
		return {
			action: 'accept' as const,
			classification: classifyNovaArtifactAction('author-scene-draft', 'accept'),
			artifactKind: 'author-scene-draft' as const,
			envelope,
			projectId,
			sceneId: checkpoint.sceneId,
			checkpointId: checkpoint.id,
		};
	}

	async function handleSceneDraftAccept(
		envelope: PipelineArtifactEnvelope<AuthorSceneDraftPayload>,
	): Promise<NovaArtifactActionResult<StageInlineSceneDraftResultData>> {
		return stageInlineSceneDraftCheckpoint({ projectId, envelope });
	}

	async function handleSceneDraftConfirmAccept(
		envelope: PipelineArtifactEnvelope<AuthorSceneDraftPayload>,
		checkpoint: AuthorDraftCheckpoint,
		options: { forceOverwrite?: boolean } = {},
	): Promise<NovaArtifactActionResult<StageInlineSceneDraftResultData>> {
		const base = sceneDraftActionBase(envelope, checkpoint);
		if (!projectId) {
			return createInsufficientContextResult<StageInlineSceneDraftResultData, AuthorSceneDraftPayload>({
				...base,
				reason: 'Open a project before applying this saved draft.',
			});
		}
		if (editorDirty.sceneId === checkpoint.sceneId && editorDirty.isDirty && !options.forceOverwrite) {
			return createStaleTargetResult<StageInlineSceneDraftResultData, AuthorSceneDraftPayload>({
				...base,
				message: 'Save or discard the open scene changes before applying this draft.',
			});
		}

		try {
			const { checkpoint: updated } = await acceptSceneDraftCheckpoint(
				projectId,
				checkpoint.id,
				checkpoint.sceneId,
				{ forceOverwrite: options.forceOverwrite === true },
			);
			const updatedScene = await fetchSceneById(checkpoint.sceneId);
			dispatchSceneContentApplied({
				projectId,
				sceneId: checkpoint.sceneId,
				content: updatedScene.content ?? '',
				wordCount: updatedScene.wordCount ?? 0,
				updatedAt: updatedScene.updatedAt,
			});
			return createNovaArtifactActionResult<StageInlineSceneDraftResultData, AuthorSceneDraftPayload>({
				...base,
				status: 'succeeded',
				durability: 'durable',
				message: 'Draft applied to scene.',
				data: { checkpoint: updated },
			});
		} catch (err) {
			const apiErr = err as Partial<AuthorDraftApiError> | Error;
			const code =
				typeof (apiErr as { code?: unknown }).code === 'string'
					? (apiErr as { code: string }).code
					: undefined;
			if (code === 'stale_target') {
				return createStaleTargetResult<StageInlineSceneDraftResultData, AuthorSceneDraftPayload>({
					...base,
					message:
						apiErr instanceof Error
							? apiErr.message
							: 'This scene changed before the draft could be applied.',
				});
			}
			return createNovaArtifactActionResult<StageInlineSceneDraftResultData, AuthorSceneDraftPayload>({
				...base,
				status: 'failed',
				durability: 'durable',
				errorCode: code ?? 'accept_failed',
				message: apiErr instanceof Error ? apiErr.message : 'Could not apply the saved draft.',
				data: { checkpoint },
			});
		}
	}

	async function handleSceneDraftReject(
		envelope: PipelineArtifactEnvelope<AuthorSceneDraftPayload>,
	): Promise<NovaArtifactActionResult<StageInlineSceneDraftResultData>> {
		return rejectInlineSceneDraftCheckpoint({ projectId, envelope });
	}

	async function handleRevisionPackAcknowledge(
		issueId: string,
		envelope: PipelineArtifactEnvelope<AuthorRevisionPack>,
	): Promise<RevisionPackAcknowledgementState> {
		if (!projectId) throw new Error('Open a project before acknowledging this revision note.');
		const state = await acknowledgeRevisionPackIssue(projectId, envelope, issueId);
		setRevisionAckStateFromPersisted(state);
		return state;
	}
</script>

<NovaErrorBoundary error={novaError} errorType={novaErrorType} {onRetry} />

<ul class="nova-log" role="log" aria-label="Conversation with Nova">
	{#each messages as message (message.id)}
		{#if message.role === 'user'}
			<li class="nova-message nova-message-user">
				<div class="nova-bubble nova-bubble-user">
					{message.content}
				</div>
			</li>
		{:else if message.role === 'nova'}
			<li class="nova-message nova-message-nova">
				<div
					class="nova-bubble nova-bubble-nova"
					class:is-error={message.status === 'error'}
					class:is-unsupported={message.intent === 'unsupported_action'}
					data-testid={message.intent === 'unsupported_action' ? 'nova-unsupported-action' : undefined}
				>
					{#if message.status === 'error'}
						<p class="nova-error-text">{message.error ?? 'Something went wrong.'}</p>
						{#if isMissingCredentialsError(message)}
							<p class="nova-error-hint">
								<a href="/settings/ai">Open AI Settings</a>
							</p>
						{/if}
					{:else if message.artifact}
						{#if message.artifact.kind === 'author-outline'}
							<NovaOutlineCard envelope={message.artifact.envelope} {projectId} />
						{:else if message.artifact.kind === 'author-scene-draft'}
							<NovaSceneDraftCard
								envelope={message.artifact.envelope}
								onAccept={handleSceneDraftAccept}
								onConfirmAccept={handleSceneDraftConfirmAccept}
								onReject={handleSceneDraftReject}
							/>
						{:else if message.artifact.kind === 'author-revision-pack'}
							{@const ackKey = revisionAckKey(message.artifact.envelope)}
							{@const ackState = revisionAcknowledgements[ackKey]}
							<NovaRevisionPackCard
								envelope={message.artifact.envelope}
								acknowledgedIssueIds={ackState?.acknowledgedIssueIds ?? []}
								acknowledgementLoading={ackState?.loading ?? false}
								acknowledgementError={ackState?.error ?? null}
								onAcknowledge={handleRevisionPackAcknowledge}
							/>
						{/if}
					{:else if message.content === '' && message.status === 'streaming'}
						<span class="nova-typing" aria-label="Nova is typing">
							<span></span><span></span><span></span>
						</span>
					{:else}
						{#if message.intent === 'unsupported_action'}
							<p class="nova-unsupported-label">Write mode</p>
						{/if}
						<div class="nova-prose">
							<!-- eslint-disable-next-line svelte/no-at-html-tags -- safeHtml() runs DOMPurify sanitization -->
							{@html renderAssistant(message.content)}
						</div>
						{#if message.status === 'aborted'}
							<p class="nova-aborted">(aborted)</p>
						{/if}
					{/if}
				</div>
			</li>
		{:else if message.role === 'tool-call'}
			<li class="nova-message nova-message-tool">
				<div class="nova-tool-chip nova-tool-call" data-testid="nova-tool-call">
					<span class="nova-tool-label">Calling tool:</span>
					<code class="nova-tool-id">{message.toolId ?? 'unknown'}</code>
					<details class="nova-tool-details">
						<summary>Input</summary>
						<pre class="nova-tool-payload">{formatToolPayload(message.toolPayload)}</pre>
					</details>
				</div>
			</li>
		{:else if message.role === 'tool-result'}
			{@const toolStatus = getToolResultStatus(message)}
			{@const toolError = getToolResultError(message)}
			<li class="nova-message nova-message-tool">
				<div
					class="nova-tool-chip nova-tool-result"
					class:is-error={isToolStatusError(toolStatus)}
					data-testid="nova-tool-result"
				>
					<span class="nova-tool-label">Result:</span>
					<code class="nova-tool-id">{message.toolId ?? 'unknown'}</code>
					<span class="nova-tool-status">— {toolStatus}</span>
					{#if toolError}
						<p class="nova-tool-error">{toolError}</p>
					{/if}
					<details class="nova-tool-details">
						<summary>Output</summary>
						<pre class="nova-tool-payload">{formatToolPayload(message.toolPayload)}</pre>
					</details>
				</div>
			</li>
		{/if}
	{/each}
</ul>

<style>
	.nova-log {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.nova-message {
		display: flex;
		animation: novellum-enter var(--duration-enter) var(--ease-editorial);
	}

	.nova-message-user {
		justify-content: flex-end;
	}

	.nova-message-nova,
	.nova-message-tool {
		justify-content: flex-start;
	}

	.nova-bubble {
		max-width: 92%;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-lg);
		font-size: var(--text-sm);
		line-height: 1.65;
		overflow-wrap: break-word;
		box-shadow: var(--shadow-nova-inset-xs);
	}

	.nova-bubble-user {
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--color-surface-ground) 86%, var(--color-surface-overlay)) 0%,
				var(--color-surface-ground) 100%
			);
		border: 1px solid color-mix(in srgb, var(--color-border-default) 82%, var(--color-candle) 18%);
		color: var(--color-text-primary);
		white-space: pre-wrap;
	}

	.nova-bubble-nova {
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--color-surface-overlay) 92%, var(--color-candle) 8%) 0%,
				var(--color-surface-overlay) 100%
			);
		border: 1px solid color-mix(in srgb, var(--color-border-default) 86%, var(--color-candle) 14%);
		color: var(--color-text-primary);
	}

	.nova-bubble-nova.is-error {
		border-color: var(--color-error);
		color: var(--color-error);
	}

	.nova-bubble-nova.is-unsupported {
		border-color: color-mix(in srgb, var(--color-candle) 48%, var(--color-border-default));
		background: color-mix(in srgb, var(--color-candle) 10%, var(--color-surface-overlay));
	}

	.nova-unsupported-label {
		margin: 0 0 var(--space-2);
		font-size: 11px;
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--color-text-muted) 82%, var(--color-candle));
	}

	.nova-error-text {
		margin: 0;
		font-size: var(--text-sm);
	}

	.nova-error-hint {
		margin: var(--space-1) 0 0;
		font-size: var(--text-xs);
	}

	.nova-error-hint a {
		color: var(--color-candle);
		text-decoration: underline;
	}

	.nova-prose :global(p) {
		margin: 0 0 var(--space-2);
	}

	.nova-prose :global(ul),
	.nova-prose :global(ol) {
		margin: 0 0 var(--space-2);
		padding-left: var(--space-4);
	}

	.nova-prose :global(p:last-child) {
		margin-bottom: 0;
	}

	.nova-prose :global(code) {
		font-family: var(--font-mono);
		font-size: 0.9em;
	}

	.nova-aborted {
		margin: var(--space-2) 0 0;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		font-style: italic;
	}

	.nova-typing {
		display: inline-flex;
		gap: var(--space-1);
	}

	.nova-typing span {
		width: var(--size-dot-small);
		height: var(--size-dot-small);
		border-radius: 50%;
		background: color-mix(in srgb, var(--color-text-muted) 72%, var(--color-candle) 28%);
		animation: nova-typing-pulse var(--duration-pulse) infinite var(--ease-editorial);
	}

	.nova-typing span:nth-child(2) {
		animation-delay: 0.15s;
	}

	.nova-typing span:nth-child(3) {
		animation-delay: 0.3s;
	}

	@keyframes nova-typing-pulse {
		0%,
		80%,
		100% {
			opacity: 0.3;
			transform: scale(0.8);
		}
		40% {
			opacity: 1;
			transform: scale(1);
		}
	}

	.nova-tool-chip {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		max-width: 92%;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-lg);
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--color-surface-overlay) 90%, var(--color-candle) 10%) 0%,
				var(--color-surface-overlay) 100%
			);
		border: 1px solid color-mix(in srgb, var(--color-border-default) 84%, var(--color-candle) 16%);
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		line-height: var(--leading-relaxed);
	}

	.nova-tool-chip.is-error {
		border-color: var(--color-error);
		color: var(--color-error);
	}

	.nova-tool-label {
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.nova-tool-id {
		font-family: var(--font-mono);
		color: var(--color-text-primary);
	}

	.nova-tool-status {
		font-style: italic;
	}

	.nova-tool-error {
		margin: 0;
	}

	.nova-tool-details {
		margin-top: var(--space-1);
	}

	.nova-tool-details summary {
		cursor: pointer;
		color: var(--color-text-secondary);
	}

	.nova-tool-payload {
		margin: var(--space-1) 0 0;
		padding: var(--space-2);
		background: color-mix(in srgb, var(--color-surface-ground) 88%, var(--color-surface-overlay));
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--color-text-primary);
		white-space: pre-wrap;
		overflow-x: auto;
	}
</style>
