import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const CHARACTER_ROUTE_SOURCE =
	'src/routes/projects/[id]/world-building/characters/individuals/+page.svelte';

function readCharacterRoute(): string {
	return readFileSync(CHARACTER_ROUTE_SOURCE, 'utf8');
}

function sourceBetween(source: string, start: string, end: string): string {
	const startIndex = source.indexOf(start);
	const endIndex = source.indexOf(end, startIndex + start.length);
	expect(startIndex).toBeGreaterThanOrEqual(0);
	expect(endIndex).toBeGreaterThan(startIndex);
	return source.slice(startIndex, endIndex);
}

describe('character persistence error handling', () => {
	it('gates persistence console diagnostics to development only', () => {
		const source = readCharacterRoute();
		const consoleErrorCount = source.match(/console\.error/g)?.length ?? 0;

		expect(source).toContain('function reportPersistenceFailure');
		expect(source).toContain('if (!import.meta.env.DEV) return;');
		expect(consoleErrorCount).toBe(1);
		expect(source).not.toContain('console.error(errorMessage, error)');
	});

	it('keeps save failures visible for fire-and-forget persistence operations', () => {
		const source = readCharacterRoute();
		const helper = sourceBetween(
			source,
			'async function runWithPersistenceFeedback',
			'async function runWithPersistenceResult',
		);

		expect(helper).toContain('reportPersistenceFailure({ message: errorMessage, cause: error });');
		expect(helper).toContain('saveErrorMessage = errorMessage;');
		expect(helper).toContain('return false;');
	});

	it('keeps save failures visible for persistence operations that return created records', () => {
		const source = readCharacterRoute();
		const helper = sourceBetween(
			source,
			'async function runWithPersistenceResult',
			'// Debounced field-save scheduler.',
		);

		expect(helper).toContain('reportPersistenceFailure({ message: errorMessage, cause: error });');
		expect(helper).toContain('saveErrorMessage = errorMessage;');
		expect(helper).toContain('return null;');
	});
});
