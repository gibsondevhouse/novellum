import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { load } from 'js-yaml';

const WORKFLOWS = [
	'.github/workflows/ci.yml',
	'.github/workflows/release.yml',
	'.github/workflows/visual-tests.yml',
];

describe('GitHub Actions workflow YAML validity', () => {
	for (const filePath of WORKFLOWS) {
		it(`parses without error: ${filePath}`, () => {
			const content = readFileSync(filePath, 'utf-8');
			expect(() => load(content)).not.toThrow();
			const parsed = load(content) as { on: unknown; jobs: unknown };
			expect(parsed).toHaveProperty('on');
			expect(parsed).toHaveProperty('jobs');
		});
	}
});
