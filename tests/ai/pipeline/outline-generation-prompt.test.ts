import { describe, expect, it } from 'vitest';
import { buildOutlineContextPacket } from '../../../src/lib/ai/pipeline/outline-context-builder.js';
import {
	buildOutlineGenerationPrompt,
	buildOutlineGenerationRepairPrompt,
	OUTLINE_GENERATION_JSON_SCHEMA,
	OUTLINE_GENERATION_RESPONSE_FORMAT,
} from '../../../src/lib/ai/pipeline/outline-generation-prompt.js';

function makePacket() {
	return buildOutlineContextPacket({
		project: {
			id: 'project-1',
			title: 'Storm Ledger',
			genre: 'climate noir',
			logline: 'A courier must outrun a civil war to deliver the last weather map.',
			synopsis: 'The city survives by rationing rain until a courier exposes the storm cartel.',
			targetWordCount: 85_000,
			status: 'planning',
			projectType: 'novel',
		},
		worldbuilding: {
			characters: [{ id: 'char-1', name: 'Iri Vale', role: 'Courier' }],
			plotThreads: [{ id: 'thread-1', title: 'Steal the storm ledger' }],
		},
		outlineHierarchy: {
			scenes: [{ id: 'scene-1', title: 'Existing scene', content: 'SECRET MANUSCRIPT TEXT SHOULD NOT LEAK' }],
		},
	});
}

function schemaAt(path: string[]): Record<string, unknown> {
	let cursor: unknown = OUTLINE_GENERATION_JSON_SCHEMA;
	for (const segment of path) {
		const record = cursor as Record<string, unknown>;
		cursor = record[segment];
	}
	return cursor as Record<string, unknown>;
}

describe('buildOutlineGenerationPrompt', () => {
	it('includes the fixed ROLE/TASK/CONTEXT/CONSTRAINTS/OUTPUT sections', () => {
		const bundle = buildOutlineGenerationPrompt(makePacket());
		const headings = bundle.prompt.match(/^## .+$/gm);

		expect(headings).toMatchInlineSnapshot(`
			[
			  "## ROLE",
			  "## TASK",
			  "## CONTEXT",
			  "## CONSTRAINTS",
			  "## OUTPUT FORMAT",
			]
		`);
	});

	it('forbids direct canon writes and manuscript mutation', () => {
		const { prompt } = buildOutlineGenerationPrompt(makePacket());

		expect(prompt).toContain('Generate a proposed outline only');
		expect(prompt).toContain('Do not write canonical rows');
		expect(prompt).toContain('mutate project hierarchy');
		expect(prompt).toContain('edit manuscript text');
		expect(prompt).toContain('author must review and accept');
	});

	it('encodes structure-spine then scene-intent-card two-pass intent', () => {
		const { prompt } = buildOutlineGenerationPrompt(makePacket());

		expect(prompt).toContain('Structure spine');
		expect(prompt).toContain('Scene-intent cards');
		expect(prompt).toContain('goal, conflict, turn, and outcome');
	});

	it('does not include manuscript scene content from the context packet', () => {
		const { prompt } = buildOutlineGenerationPrompt(makePacket());

		expect(prompt).not.toContain('SECRET MANUSCRIPT TEXT SHOULD NOT LEAK');
	});

	it('attaches a strict JSON schema response format', () => {
		expect(OUTLINE_GENERATION_RESPONSE_FORMAT).toMatchObject({
			type: 'json_schema',
			jsonSchema: {
				name: 'novellum_outline_draft',
				strict: true,
			},
		});
		expect(OUTLINE_GENERATION_RESPONSE_FORMAT?.jsonSchema.schema).toBe(OUTLINE_GENERATION_JSON_SCHEMA);
	});

	it('requires arcs, acts, chapters, scenes, and scene intent fields', () => {
		expect(OUTLINE_GENERATION_JSON_SCHEMA.required).toContain('arcs');

		const arcItems = schemaAt(['properties', 'arcs', 'items']);
		expect(arcItems.required).toContain('acts');

		const actItems = schemaAt(['properties', 'arcs', 'items', 'properties', 'acts', 'items']);
		expect(actItems.required).toContain('chapters');

		const chapterItems = schemaAt([
			'properties',
			'arcs',
			'items',
			'properties',
			'acts',
			'items',
			'properties',
			'chapters',
			'items',
		]);
		expect(chapterItems.required).toContain('scenes');

		const sceneItems = schemaAt([
			'properties',
			'arcs',
			'items',
			'properties',
			'acts',
			'items',
			'properties',
			'chapters',
			'items',
			'properties',
			'scenes',
			'items',
		]);
		expect(sceneItems.required).toContain('intent');

		const intent = schemaAt([
			'properties',
			'arcs',
			'items',
			'properties',
			'acts',
			'items',
			'properties',
			'chapters',
			'items',
			'properties',
			'scenes',
			'items',
			'properties',
			'intent',
		]);
		expect(intent.required).toEqual(['goal', 'conflict', 'turn', 'outcome']);
	});
});

describe('buildOutlineGenerationRepairPrompt', () => {
	it('keeps repair bounded to schema issues and the same context', () => {
		const prompt = buildOutlineGenerationRepairPrompt({
			contextHash: 'abc123',
			validationIssues: [{ path: 'arcs.0.acts.0.chapters.0.scenes.0.intent.goal', message: 'Required' }],
		});
		const headings = prompt.match(/^## .+$/gm);

		expect(headings).toEqual(['## ROLE', '## TASK', '## CONTEXT', '## CONSTRAINTS', '## OUTPUT FORMAT']);
		expect(prompt).toContain('one bounded retry');
		expect(prompt).toContain('Use the same CONTEXT packet');
		expect(prompt).toContain('Context hash: abc123');
		expect(prompt).toContain('Fix only schema and validation problems');
		expect(prompt).toContain('Do not invent new facts');
		expect(prompt).not.toContain('SECRET MANUSCRIPT TEXT SHOULD NOT LEAK');
	});
});
