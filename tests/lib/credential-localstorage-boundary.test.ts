import { describe, it, expect } from 'vitest';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

/**
 * plan-017 stage-005 phase-005 part-002 — credential boundary
 * guardrail (stage exit gate).
 *
 * The legacy V0 build stored the OpenRouter key in `localStorage`
 * under `novellum_openrouter_key`. After the BYOK refactor the only
 * code allowed to touch that key is the one-shot migration helper in
 * `src/lib/ai/credential-service.ts`. Any other read or write is a
 * regression and a credential leakage vector.
 */

const ROOT = join(__dirname, '..', '..', 'src');

const LEGACY_KEY = 'novellum_openrouter_key';

const ALLOWLIST: ReadonlyArray<string> = ['lib/ai/credential-service.ts'];

async function walk(dir: string): Promise<string[]> {
	const entries = await readdir(dir, { withFileTypes: true });
	const out: string[] = [];
	for (const entry of entries) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			out.push(...(await walk(full)));
		} else if (
			entry.isFile() &&
			(entry.name.endsWith('.ts') ||
				entry.name.endsWith('.svelte') ||
				entry.name.endsWith('.svelte.ts'))
		) {
			out.push(full);
		}
	}
	return out;
}

describe('credential localStorage boundary guardrail', () => {
	it('only the credential-service migration helper references the legacy localStorage key', async () => {
		const files = await walk(ROOT);
		const violations: { file: string; line: number; preview: string }[] = [];

		for (const file of files) {
			const rel = relative(ROOT, file).replace(/\\/g, '/');
			if (ALLOWLIST.includes(rel)) continue;

			const source = await readFile(file, 'utf8');
			if (!source.includes(LEGACY_KEY)) continue;

			source.split('\n').forEach((line, idx) => {
				if (line.includes(LEGACY_KEY)) {
					violations.push({ file: rel, line: idx + 1, preview: line.trim().slice(0, 120) });
				}
			});
		}

		if (violations.length > 0) {
			const msg = violations.map((v) => `${v.file}:${v.line}  ${v.preview}`).join('\n');
			throw new Error(`Disallowed legacy credential key references:\n${msg}`);
		}
		expect(violations).toHaveLength(0);
	});

	it('no source file calls localStorage.{get,set,remove}Item for the legacy key (string-form)', async () => {
		const files = await walk(ROOT);
		const violations: { file: string; line: number; preview: string }[] = [];

		// Match any localStorage method call that mentions the legacy key on
		// the same line. Allowlisted via the migration helper above.
		const RE = new RegExp(
			`localStorage\\.(?:getItem|setItem|removeItem)\\([^)]*['"\`]${LEGACY_KEY}['"\`]`,
		);

		for (const file of files) {
			const rel = relative(ROOT, file).replace(/\\/g, '/');
			if (ALLOWLIST.includes(rel)) continue;

			const source = await readFile(file, 'utf8');
			source.split('\n').forEach((line, idx) => {
				if (RE.test(line)) {
					violations.push({ file: rel, line: idx + 1, preview: line.trim().slice(0, 120) });
				}
			});
		}

		if (violations.length > 0) {
			const msg = violations.map((v) => `${v.file}:${v.line}  ${v.preview}`).join('\n');
			throw new Error(`Disallowed legacy localStorage credential calls:\n${msg}`);
		}
		expect(violations).toHaveLength(0);
	});
});
