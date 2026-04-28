import { describe, it, expect } from 'vitest';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const ROOT = join(__dirname, '..', '..', 'src');

const ALLOWED_PREFIXES = [
	'lib/legacy/',
	'lib/migration/',
	'modules/outliner/services/migrations/',
	'modules/export/services/portability/',
	'modules/export/services/__tests__/',
	'modules/assets/',
	'routes/settings/migrate/',
];

const IMPORT_RE = /(?:from|import)\s*['"]([^'"]+)['"]/g;

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

function isAllowed(relPath: string): boolean {
	const normalized = relPath.replace(/\\/g, '/');
	return ALLOWED_PREFIXES.some((p) => normalized.startsWith(p));
}

describe('legacy/dexie boundary guardrail', () => {
	it('only allowlisted modules import from $lib/legacy/dexie', async () => {
		const files = await walk(ROOT);
		const violations: { file: string; spec: string }[] = [];

		for (const file of files) {
			const rel = relative(ROOT, file);
			if (isAllowed(rel)) continue;

			const source = await readFile(file, 'utf8');
			IMPORT_RE.lastIndex = 0;
			let match: RegExpExecArray | null;
			while ((match = IMPORT_RE.exec(source)) !== null) {
				const spec = match[1];
				if (
					spec.includes('$lib/legacy/dexie') ||
					spec.includes('legacy/dexie/db') ||
					spec.includes('legacy/dexie/schema')
				) {
					violations.push({ file: rel, spec });
				}
			}
		}

		if (violations.length > 0) {
			const msg = violations.map((v) => `${v.file} -> ${v.spec}`).join('\n');
			throw new Error(`Disallowed legacy/dexie imports:\n${msg}`);
		}

		expect(violations).toHaveLength(0);
	});
});
