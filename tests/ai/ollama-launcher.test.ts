import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Hoisted mocks shared across imports.
const spawnMock = vi.hoisted(() => vi.fn());
const accessMock = vi.hoisted(() => vi.fn());

vi.mock('node:child_process', () => ({
	spawn: spawnMock,
	default: { spawn: spawnMock },
}));

vi.mock('node:fs/promises', () => ({
	access: accessMock,
	constants: { X_OK: 1, F_OK: 0, R_OK: 4, W_OK: 2 },
	default: {
		access: accessMock,
		constants: { X_OK: 1, F_OK: 0, R_OK: 4, W_OK: 2 },
	},
}));

const ORIGINAL_FETCH = globalThis.fetch;

interface FakeChild {
	on: ReturnType<typeof vi.fn>;
	kill: ReturnType<typeof vi.fn>;
	killed: boolean;
	exitCode: number | null;
}

function createFakeChild(): FakeChild {
	return {
		on: vi.fn(),
		kill: vi.fn(),
		killed: false,
		exitCode: null,
	};
}

beforeEach(() => {
	vi.resetModules();
	const g = globalThis as Record<string, unknown>;
	delete g.__novellum_ollama_launcher__;
	spawnMock.mockReset();
	accessMock.mockReset();
});

afterEach(() => {
	globalThis.fetch = ORIGINAL_FETCH;
});

describe('ensureOllamaRunning', () => {
	it('returns alreadyRunning when /api/tags responds 200', async () => {
		globalThis.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
		const { ensureOllamaRunning } = await import(
			'../../src/lib/server/ai/ollama-launcher.js'
		);

		const result = await ensureOllamaRunning('http://127.0.0.1:11434');

		expect(result).toEqual({ ok: true, alreadyRunning: true });
		expect(spawnMock).not.toHaveBeenCalled();
	});

	it('returns not_installed when no ollama binary exists', async () => {
		globalThis.fetch = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));
		accessMock.mockRejectedValue(new Error('ENOENT'));
		const { ensureOllamaRunning } = await import(
			'../../src/lib/server/ai/ollama-launcher.js'
		);

		const result = await ensureOllamaRunning('http://127.0.0.1:11434');

		expect(result.ok).toBe(false);
		if (result.ok) throw new Error('expected failure');
		expect(result.reason).toBe('not_installed');
		expect(spawnMock).not.toHaveBeenCalled();
	});

	it('spawns ollama serve and resolves once the daemon answers', async () => {
		// First fetch: not running. Subsequent fetches: ready.
		let calls = 0;
		globalThis.fetch = vi.fn().mockImplementation(async () => {
			calls += 1;
			if (calls === 1) throw new Error('ECONNREFUSED');
			return new Response(null, { status: 200 });
		});
		// Make the first PATH candidate executable.
		accessMock.mockImplementation(async (path: string) => {
			if (path.endsWith('ollama') || path.endsWith('ollama.exe')) return undefined;
			throw new Error('ENOENT');
		});
		const fakeChild = createFakeChild();
		spawnMock.mockReturnValue(fakeChild);

		const { ensureOllamaRunning } = await import(
			'../../src/lib/server/ai/ollama-launcher.js'
		);

		const result = await ensureOllamaRunning('http://127.0.0.1:11434');

		expect(result).toEqual({ ok: true, alreadyRunning: false });
		expect(spawnMock).toHaveBeenCalledOnce();
		const [, args, options] = spawnMock.mock.calls[0];
		expect(args).toEqual(['serve']);
		expect(options.env.OLLAMA_HOST).toBe('127.0.0.1:11434');
	});

	it('coalesces concurrent calls into a single start operation', async () => {
		let calls = 0;
		globalThis.fetch = vi.fn().mockImplementation(async () => {
			calls += 1;
			if (calls === 1) throw new Error('ECONNREFUSED');
			return new Response(null, { status: 200 });
		});
		accessMock.mockResolvedValue(undefined);
		spawnMock.mockReturnValue(createFakeChild());

		const { ensureOllamaRunning } = await import(
			'../../src/lib/server/ai/ollama-launcher.js'
		);

		const [a, b] = await Promise.all([
			ensureOllamaRunning('http://127.0.0.1:11434'),
			ensureOllamaRunning('http://127.0.0.1:11434'),
		]);

		expect(a).toEqual(b);
		expect(a.ok).toBe(true);
		expect(spawnMock).toHaveBeenCalledOnce();
	});
});
