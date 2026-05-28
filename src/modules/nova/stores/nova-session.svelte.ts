/**
 * plan-023 stage-004 phase-003 — Nova session store.
 *
 * Holds the typed message log for the editor-side copilot. Streaming
 * lifecycle is owned here; the AbortController plumbing is delegated
 * to `createStreamController` so stage-005 can pass `signal` directly
 * to its OpenRouter fetch.
 */

import type {
	NovaArtifact,
	NovaMessage,
	NovaMessageIntent,
	NovaMessageStatus,
	NovaRole,
} from '../types.js';
import {
	createStreamController,
	type StreamController,
} from '../services/stream-controller.js';

export interface ContextDisclosureState {
	scopes: string[]; // e.g. ['scene', 'characters', 'locations']
	itemCount: number; // total items across all scopes
	warnings: string[];
	compressed: boolean;
	truncated: boolean;
}

interface AppendInput {
	role: NovaRole;
	content: string;
	status?: NovaMessageStatus;
	intent?: NovaMessageIntent;
	toolId?: string;
	toolPayload?: unknown;
}

class NovaSessionStore {
	messages = $state<NovaMessage[]>([]);
	activeStreamId = $state<string | null>(null);
	contextDisclosure = $state<ContextDisclosureState | null>(null);
	private controllers = new Map<string, StreamController>();

	get latest(): NovaMessage | null {
		return this.messages.at(-1) ?? null;
	}

	get isStreaming(): boolean {
		return this.activeStreamId !== null;
	}

	setContextDisclosure(
		scopes: string[],
		itemCount: number,
		options?: {
			warnings?: string[];
			compressed?: boolean;
			truncated?: boolean;
		},
	): void {
		this.contextDisclosure = {
			scopes,
			itemCount,
			warnings: options?.warnings ?? [],
			compressed: options?.compressed ?? false,
			truncated: options?.truncated ?? false,
		};
	}

	append(input: AppendInput): NovaMessage {
		const message: NovaMessage = {
			id: crypto.randomUUID(),
			role: input.role,
			content: input.content,
			status: input.status ?? 'complete',
			intent: input.intent ?? 'default',
			createdAt: new Date().toISOString(),
			toolId: input.toolId,
			toolPayload: input.toolPayload,
		};
		this.messages = [...this.messages, message];
		return message;
	}

	appendUnsupportedScribeAction(request: string): NovaMessage {
		const trimmed = request.trim();
		return this.append({
			role: 'nova',
			status: 'complete',
			intent: 'unsupported_action',
			content:
				'Scribe currently supports one action: build a project outline. ' +
				'For this request, switch to Chat mode for brainstorming or feedback.',
			toolPayload: {
				kind: 'unsupported-action',
				mode: 'scribe',
				request: trimmed,
				supportedActions: ['build a project outline'],
			},
		});
	}

	beginStream(role: NovaRole): NovaMessage {
		const message: NovaMessage = {
			id: crypto.randomUUID(),
			role,
			content: '',
			status: 'streaming',
			createdAt: new Date().toISOString(),
		};
		this.messages = [...this.messages, message];
		this.controllers.set(message.id, createStreamController());
		this.activeStreamId = message.id;
		return message;
	}

	appendDelta(id: string, delta: string): void {
		const idx = this.messages.findIndex((m) => m.id === id);
		if (idx === -1) return;
		// Svelte 5 runes track property writes on items inside a $state array,
		// so we mutate in place. Previously we rebuilt the entire array on
		// every SSE delta which caused N^2 DOM re-renders on long replies.
		this.messages[idx].content += delta;
	}

	endStream(id: string): void {
		this.updateStatus(id, 'complete');
		this.controllers.delete(id);
		if (this.activeStreamId === id) {
			this.activeStreamId = null;
		}
	}

	abort(id: string): void {
		const controller = this.controllers.get(id);
		controller?.abort();
		this.controllers.delete(id);
		this.updateStatus(id, 'aborted');
		if (this.activeStreamId === id) {
			this.activeStreamId = null;
		}
	}

	fail(id: string, message: string): void {
		const idx = this.messages.findIndex((m) => m.id === id);
		if (idx !== -1) {
			const next: NovaMessage = {
				...this.messages[idx],
				status: 'error',
				error: message,
			};
			this.messages = [
				...this.messages.slice(0, idx),
				next,
				...this.messages.slice(idx + 1),
			];
		}
		this.controllers.delete(id);
		if (this.activeStreamId === id) {
			this.activeStreamId = null;
		}
	}

	/**
	 * plan-027 stage-003 phase-003 part-001 — attach a parsed pipeline
	 * artifact to a Nova message. Marks the message `complete` so the
	 * stream-disposed accept/reject UI in `part-002` can render the
	 * card. Manuscript content is never mutated here.
	 */
	attachArtifact(id: string, artifact: NovaArtifact): void {
		const idx = this.messages.findIndex((m) => m.id === id);
		if (idx === -1) return;
		const next: NovaMessage = {
			...this.messages[idx],
			status: 'complete',
			artifact,
		};
		this.messages = [
			...this.messages.slice(0, idx),
			next,
			...this.messages.slice(idx + 1),
		];
		this.controllers.delete(id);
		if (this.activeStreamId === id) {
			this.activeStreamId = null;
		}
	}

	clear(): void {
		for (const controller of this.controllers.values()) {
			controller.abort();
		}
		this.controllers.clear();
		this.messages = [];
		this.activeStreamId = null;
		this.contextDisclosure = null;
	}

	/**
	 * Removes the trailing failed assistant turn (status === 'error') so a
	 * retry can run without duplicating the user prompt. Returns the user
	 * message that preceded the error, or null if no error/user pair was
	 * found. Used by NovaPanel's "Try again" button.
	 */
	removeFailedAssistantTurn(): NovaMessage | null {
		const lastIdx = this.messages.length - 1;
		if (lastIdx < 0) return null;
		const tail = this.messages[lastIdx];
		if (tail.status !== 'error') return null;
		// Drop the failed assistant message; keep history & last user prompt.
		this.messages = this.messages.slice(0, lastIdx);
		const userIdx = this.messages.findLastIndex((m) => m.role === 'user');
		return userIdx === -1 ? null : this.messages[userIdx];
	}

	/** Test hook — returns the controller's signal so consumers (and
	 * stage-005's fetch) can attach abort listeners. */
	getSignal(id: string): AbortSignal | null {
		return this.controllers.get(id)?.signal ?? null;
	}

	private updateStatus(id: string, status: NovaMessageStatus): void {
		const idx = this.messages.findIndex((m) => m.id === id);
		if (idx === -1) return;
		const next: NovaMessage = { ...this.messages[idx], status };
		this.messages = [
			...this.messages.slice(0, idx),
			next,
			...this.messages.slice(idx + 1),
		];
	}
}

export const novaSession = new NovaSessionStore();
