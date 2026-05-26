import { describe, expect, it } from 'vitest';
import { Orchestrator } from '../../../src/lib/ai/orchestrator.js';
import {
	parseWorldbuildOutput,
	type WorldbuildPopulatedBiblePayload,
} from '../../../src/lib/ai/pipeline/worldbuild-agent.js';
import { PIPELINE_TASK_KEYS, resolvePipelineAction } from '../../../src/lib/ai/pipeline/task-catalog.js';
import type { WorldbuildResearchBriefs } from '../../../src/lib/ai/pipeline/worldbuild-schemas.js';

describe('worldbuild-agent parser', () => {
	it('parses premise output when JSON is wrapped with extra prose', () => {
		const raw = `Draft preview:\n${JSON.stringify({
			hook: 'A failed smuggler must steal weather itself.',
			genreBlend: 'climate noir + mythic fantasy',
			readerPromise: 'Escalating heists against planetary governance.',
			coreConflict: 'Personal redemption vs ecological collapse.',
			worldPressure: 'Artificial storms are rationed by oligarch houses.',
			tone: 'Urgent and haunted',
			scope: 'Single-city uprising',
			nonNegotiables: ['No chosen-one reveal'],
			openQuestions: ['Who controls the storm vaults?'],
		})}`;

		const result = parseWorldbuildOutput(PIPELINE_TASK_KEYS.WORLDBUILD_PREMISE, raw);
		expect(result.ok).toBe(true);
		if (!result.ok) {
			throw new Error('Expected successful parse');
		}

		expect(result.payload).toMatchObject({
			hook: 'A failed smuggler must steal weather itself.',
			nonNegotiables: ['No chosen-one reveal'],
		});
		expect(result.fallbackMessage).toBeNull();
	});

	it('returns schema validation failure with fallback messaging', () => {
		const raw = JSON.stringify({
			realityMode: 'material + mythic',
			environment: 'Flooded megacity',
			powerOrder: 'Storm guild councils',
			socialOrder: 'Debt castes',
			scarcity: 'Portable heat',
			magicOrTechRules: 'Storm siphons require blood cost',
			taboos: 'No unauthorized weather edits',
			ordinaryLifeBaseline: 'Crowded barge neighborhoods',
			conflictEngines: ['ration wars'],
			aestheticAnchors: ['neon rain'],
			// Missing questionsForResearch on purpose
		});

		const result = parseWorldbuildOutput(PIPELINE_TASK_KEYS.WORLDBUILD_WORLDSPEC, raw);
		expect(result.ok).toBe(false);
		if (result.ok) {
			throw new Error('Expected parse failure');
		}

		expect(result.error.code).toBe('schema_validation_failed');
		expect(result.fallbackMessage).toContain('strict JSON');
	});

	it('parses research briefs and normalizes singular candidate answer values', () => {
		const raw = JSON.stringify({
			researchBriefs: [
				{
					question: 'How long can the storm battery hold charge?',
					whyItMatters: 'Determines siege-length scenes.',
					candidateAnswers: '36-hour nominal load',
					selectedRecommendation: 'Use 36-hour baseline with failure risk at 28 hours.',
					confidence: 0.72,
					sourceNote: 'Pilot interviews + weather-grid manuals.',
					canonImpact: 'Caps mission windows and raises urgency.',
				},
			],
		});

		const result = parseWorldbuildOutput(PIPELINE_TASK_KEYS.WORLDBUILD_RESEARCH, raw);
		expect(result.ok).toBe(true);
		if (!result.ok) {
			throw new Error('Expected successful parse');
		}

		const payload = result.payload as WorldbuildResearchBriefs;
		expect(payload.researchBriefs[0].candidateAnswers).toEqual([
			'36-hour nominal load',
		]);
		expect(payload.researchBriefs[0].confidence).toBe('0.72');
	});

	it('maps populated world-bible output into canonical table-write buckets', () => {
		const raw = JSON.stringify({
			characters: [{ name: 'Iri Vale', role: 'Lead thief', traits: ['resourceful'] }],
			locations: [{ name: 'Skymarket', description: 'Vertical bazaar above the floodline.' }],
			factions: [{ name: 'Barometer Guild', type: 'trade cartel' }],
			loreEntries: [{ title: 'Storm Debt', category: 'economy', content: 'Weather access is collateralized.' }],
			timelineEvents: [{ title: 'Black Monsoon', description: 'Three months of permanent night.', date: 'Year 14' }],
			themes: [{ title: 'Control vs Freedom', description: 'Who gets to own survival?', tensionPair: 'order vs autonomy' }],
			glossary: [{ term: 'Siphon Key', definition: 'Device that unlocks weather vaults.' }],
			relationships: [{ title: 'Iri vs Regent Voss', description: 'Escalating strategic rivalry', relatedCharacterIds: ['iri', 'voss'] }],
		});

		const result = parseWorldbuildOutput(PIPELINE_TASK_KEYS.WORLDBUILD_WORLD_BIBLE, raw);
		expect(result.ok).toBe(true);
		if (!result.ok) {
			throw new Error('Expected successful parse');
		}

		const payload = result.payload as WorldbuildPopulatedBiblePayload;
		expect(payload.tableWrites.factions).toHaveLength(1);
		expect(payload.tableWrites.themes).toHaveLength(1);
		expect(payload.tableWrites.glossary_terms).toHaveLength(1);
		expect(payload.tableWrites.characters).toHaveLength(1);
		expect(payload.tableWrites.locations).toHaveLength(1);
		expect(payload.tableWrites.lore_entries).toHaveLength(1);
		expect(payload.tableWrites.plot_threads).toHaveLength(1);
	});

	it('blocks populated world-bible persistence when required identity fields are missing', () => {
		const raw = JSON.stringify({
			characters: [{ role: 'Missing name should fail' }],
			locations: [{ description: 'Missing location name should fail' }],
			factions: [{ type: 'No faction name' }],
			loreEntries: [{ content: 'Untitled lore should fail' }],
			timelineEvents: [],
			themes: [{ description: 'Missing theme title' }],
			glossary: [{ definition: 'Missing term' }],
			relationships: [],
		});

		const result = parseWorldbuildOutput(PIPELINE_TASK_KEYS.WORLDBUILD_WORLD_BIBLE, raw);
		expect(result.ok).toBe(false);
		if (result.ok) {
			throw new Error('Expected parse failure');
		}

		expect(result.error.code).toBe('missing_required_fields');
		expect(result.error.details.length).toBeGreaterThan(0);
		expect(result.fallbackMessage).toContain('required persistence fields');
	});

	it('creates draft artifact envelopes for valid worldbuild output', () => {
		const task = resolvePipelineAction(`pipeline:${PIPELINE_TASK_KEYS.WORLDBUILD_PREMISE}`);
		if (!task) {
			throw new Error('Expected worldbuild premise task');
		}

		const orchestrator = new Orchestrator();
		const result = orchestrator.runWorldbuildPipeline({
			task,
			rawOutput: JSON.stringify({
				hook: 'A city survives by trading memories for rain.',
				genreBlend: 'speculative noir',
				readerPromise: 'A heist story with moral fallout.',
				coreConflict: 'Protecting family vs exposing a regime.',
				worldPressure: 'Drought cartel controls weather access.',
				tone: 'Bleak but defiant',
				scope: 'One city, one uprising',
				nonNegotiables: ['No hidden prophecy'],
				openQuestions: ['Who leaked the vault map?'],
			}),
		});

		expect(result.ok).toBe(true);
		if (!result.ok) {
			throw new Error('Expected successful artifact creation');
		}

		expect(result.artifact.lifecycle).toBe('draft');
		expect(result.artifact.taskKey).toBe(PIPELINE_TASK_KEYS.WORLDBUILD_PREMISE);
	});
});
