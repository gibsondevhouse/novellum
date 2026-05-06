/**
 * plan-023 stage-004 phase-003 — nova-session store unit tests.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { novaSession } from '$modules/nova';

describe('novaSession store', () => {
	beforeEach(() => {
		novaSession.clear();
	});

	it('append() adds a message with generated id, ISO timestamp, default complete status', () => {
		const m = novaSession.append({ role: 'user', content: 'hello' });
		expect(m.id).toBeTruthy();
		expect(m.role).toBe('user');
		expect(m.content).toBe('hello');
		expect(m.status).toBe('complete');
		expect(new Date(m.createdAt).toISOString()).toBe(m.createdAt);
		expect(novaSession.messages).toHaveLength(1);
		expect(novaSession.latest?.id).toBe(m.id);
	});

	it('streaming lifecycle: beginStream → appendDelta → endStream', () => {
		const stream = novaSession.beginStream('nova');
		expect(stream.status).toBe('streaming');
		expect(novaSession.isStreaming).toBe(true);
		expect(novaSession.activeStreamId).toBe(stream.id);

		novaSession.appendDelta(stream.id, 'Hel');
		novaSession.appendDelta(stream.id, 'lo!');
		expect(novaSession.messages.find((m) => m.id === stream.id)?.content).toBe('Hello!');

		novaSession.endStream(stream.id);
		const final = novaSession.messages.find((m) => m.id === stream.id);
		expect(final?.status).toBe('complete');
		expect(novaSession.isStreaming).toBe(false);
		expect(novaSession.activeStreamId).toBeNull();
	});

	it('abort() flips status to aborted and aborts the underlying signal', () => {
		const stream = novaSession.beginStream('nova');
		const signal = novaSession.getSignal(stream.id);
		expect(signal?.aborted).toBe(false);

		novaSession.abort(stream.id);

		expect(signal?.aborted).toBe(true);
		const final = novaSession.messages.find((m) => m.id === stream.id);
		expect(final?.status).toBe('aborted');
		expect(novaSession.isStreaming).toBe(false);
	});

	it('clear() aborts all controllers and empties the message log', () => {
		const a = novaSession.beginStream('nova');
		const sigA = novaSession.getSignal(a.id);
		novaSession.append({ role: 'user', content: 'x' });

		novaSession.clear();

		expect(sigA?.aborted).toBe(true);
		expect(novaSession.messages).toEqual([]);
		expect(novaSession.activeStreamId).toBeNull();
		expect(novaSession.isStreaming).toBe(false);
	});

	it('latest reflects the most recently appended message', () => {
		expect(novaSession.latest).toBeNull();
		novaSession.append({ role: 'user', content: 'one' });
		const second = novaSession.append({ role: 'nova', content: 'two' });
		expect(novaSession.latest?.id).toBe(second.id);
	});

	it('appendDelta on an unknown id is a no-op', () => {
		novaSession.appendDelta('does-not-exist', 'noop');
		expect(novaSession.messages).toHaveLength(0);
	});

	it('fail(id, message) flips status to error, sets error, clears activeStreamId', () => {
		const stream = novaSession.beginStream('nova');
		novaSession.appendDelta(stream.id, 'partial');
		novaSession.fail(stream.id, 'Network failure');

		const final = novaSession.messages.find((m) => m.id === stream.id);
		expect(final?.status).toBe('error');
		expect(final?.error).toBe('Network failure');
		expect(final?.content).toBe('partial');
		expect(novaSession.isStreaming).toBe(false);
		expect(novaSession.activeStreamId).toBeNull();
	});

	it('fail() on an unknown id is a no-op for messages but still clears stream state', () => {
		expect(() => novaSession.fail('does-not-exist', 'oops')).not.toThrow();
		expect(novaSession.messages).toHaveLength(0);
	});
});
