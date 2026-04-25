<script lang="ts">
	import { untrack } from 'svelte';
	import type { PlotThread } from '$lib/db/types.js';
	import type { EntityFormCallbacks } from '../types.js';
	import GhostButton from '$lib/components/ui/GhostButton.svelte';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';
	import {
		parseThreadPayload,
		type ThreadSystemKind,
		type MajorArcPayload,
		type SubPlotPayload,
		type MotivationPayload,
	} from '$modules/bible/thread-systems.js';

	type ArcOption = { id: string; name: string };

	let {
		thread = null,
		kind,
		arcOptions = [],
		saving = false,
		onSave,
		onCancel,
	}: {
		thread?: PlotThread | null;
		kind: ThreadSystemKind;
		arcOptions?: ArcOption[];
		saving?: boolean;
	} & EntityFormCallbacks<PlotThread> = $props();

	function splitCommaSeparated(raw: string): string[] {
		return raw
			.split(',')
			.map((value) => value.trim())
			.filter(Boolean);
	}

	function joinCommaSeparated(values: string[] | undefined): string {
		return (values ?? []).join(', ');
	}

	function majorArcDefaults(source: PlotThread | null): MajorArcPayload {
		const payload = source ? parseThreadPayload(source) : null;
		if (payload?.kind === 'major-arc') return payload;
		return {
			kind: 'major-arc',
			name: source?.title ?? '',
			scope: '',
			initialCondition: '',
			incitingPressure: '',
			escalationPattern: '',
			breakingPoint: '',
			resolutionVector: '',
			arcFunction: '',
			stakes: '',
			characterIds: source?.relatedCharacterIds ?? [],
			realmIds: [],
			threadIds: [],
			subPlotIds: [],
		};
	}

	function subPlotDefaults(source: PlotThread | null): SubPlotPayload {
		const payload = source ? parseThreadPayload(source) : null;
		if (payload?.kind === 'sub-plot') return payload;
		return {
			kind: 'sub-plot',
			name: source?.title ?? '',
			parentArcId: '',
			relationshipToMainArc: '',
			entryPoint: '',
			escalation: '',
			convergencePoint: '',
			purpose: '',
			stakes: '',
			characterIds: source?.relatedCharacterIds ?? [],
			realmIds: [],
			threadIds: [],
		};
	}

	function motivationDefaults(source: PlotThread | null): MotivationPayload {
		const payload = source ? parseThreadPayload(source) : null;
		if (payload?.kind === 'motivation') return payload;
		return {
			kind: 'motivation',
			name: source?.title ?? '',
			motivationType: '',
			desire: '',
			fearConstraint: '',
			belief: '',
			trigger: '',
			typicalAction: '',
			escalationShift: '',
			function: '',
			characterIds: source?.relatedCharacterIds ?? [],
			factionIds: [],
			arcIds: [],
			subPlotIds: [],
		};
	}

	const major = untrack(() => majorArcDefaults(thread));
	const sub = untrack(() => subPlotDefaults(thread));
	const motivation = untrack(() => motivationDefaults(thread));

	let name = $state(
		untrack(() => {
			if (kind === 'major-arc') return major.name;
			if (kind === 'sub-plot') return sub.name;
			return motivation.name;
		}),
	);
	let scope = $state(untrack(() => major.scope));
	let initialCondition = $state(untrack(() => major.initialCondition));
	let incitingPressure = $state(untrack(() => major.incitingPressure));
	let escalationPattern = $state(untrack(() => major.escalationPattern));
	let breakingPoint = $state(untrack(() => major.breakingPoint));
	let resolutionVector = $state(untrack(() => major.resolutionVector));
	let arcFunction = $state(untrack(() => major.arcFunction));
	let arcStakes = $state(untrack(() => major.stakes));
	let arcCharacterIdsRaw = $state(untrack(() => joinCommaSeparated(major.characterIds)));
	let arcRealmIdsRaw = $state(untrack(() => joinCommaSeparated(major.realmIds)));
	let arcThreadIdsRaw = $state(untrack(() => joinCommaSeparated(major.threadIds)));
	let subPlotIdsRaw = $state(untrack(() => joinCommaSeparated(major.subPlotIds)));

	let parentArcId = $state(untrack(() => sub.parentArcId));
	let relationshipToMainArc = $state(untrack(() => sub.relationshipToMainArc));
	let entryPoint = $state(untrack(() => sub.entryPoint));
	let subEscalation = $state(untrack(() => sub.escalation));
	let convergencePoint = $state(untrack(() => sub.convergencePoint));
	let subPurpose = $state(untrack(() => sub.purpose));
	let subStakes = $state(untrack(() => sub.stakes));
	let subCharacterIdsRaw = $state(untrack(() => joinCommaSeparated(sub.characterIds)));
	let subRealmIdsRaw = $state(untrack(() => joinCommaSeparated(sub.realmIds)));
	let subThreadIdsRaw = $state(untrack(() => joinCommaSeparated(sub.threadIds)));

	let motivationType = $state(untrack(() => motivation.motivationType));
	let desire = $state(untrack(() => motivation.desire));
	let fearConstraint = $state(untrack(() => motivation.fearConstraint));
	let belief = $state(untrack(() => motivation.belief));
	let trigger = $state(untrack(() => motivation.trigger));
	let typicalAction = $state(untrack(() => motivation.typicalAction));
	let escalationShift = $state(untrack(() => motivation.escalationShift));
	let motivationFunction = $state(untrack(() => motivation.function));
	let motivationCharacterIdsRaw = $state(untrack(() => joinCommaSeparated(motivation.characterIds)));
	let motivationFactionIdsRaw = $state(untrack(() => joinCommaSeparated(motivation.factionIds)));
	let motivationArcIdsRaw = $state(untrack(() => joinCommaSeparated(motivation.arcIds)));
	let motivationSubPlotIdsRaw = $state(untrack(() => joinCommaSeparated(motivation.subPlotIds)));

	let nameError = $state('');
	let parentArcError = $state('');
	let typeError = $state('');

	function handleSubmit() {
		nameError = '';
		parentArcError = '';
		typeError = '';

		if (!name.trim()) {
			nameError = 'Name is required.';
			return;
		}

		if (kind === 'sub-plot' && !parentArcId.trim()) {
			parentArcError = 'Parent arc is required for sub-plots.';
			return;
		}

		if (kind === 'motivation' && !motivationType) {
			typeError = 'Motivation type is required.';
			return;
		}

		if (kind === 'major-arc') {
			const payload: MajorArcPayload = {
				kind: 'major-arc',
				name: name.trim(),
				scope,
				initialCondition: initialCondition.trim(),
				incitingPressure: incitingPressure.trim(),
				escalationPattern: escalationPattern.trim(),
				breakingPoint: breakingPoint.trim(),
				resolutionVector: resolutionVector.trim(),
				arcFunction: arcFunction.trim(),
				stakes: arcStakes.trim(),
				characterIds: splitCommaSeparated(arcCharacterIdsRaw),
				realmIds: splitCommaSeparated(arcRealmIdsRaw),
				threadIds: splitCommaSeparated(arcThreadIdsRaw),
				subPlotIds: splitCommaSeparated(subPlotIdsRaw),
			};

			onSave({
				title: payload.name,
				description: JSON.stringify(payload, null, 2),
				status: thread?.status || 'open',
				relatedSceneIds: thread?.relatedSceneIds || [],
				relatedCharacterIds: payload.characterIds,
			});
			return;
		}

		if (kind === 'sub-plot') {
			const payload: SubPlotPayload = {
				kind: 'sub-plot',
				name: name.trim(),
				parentArcId: parentArcId.trim(),
				relationshipToMainArc: relationshipToMainArc.trim(),
				entryPoint: entryPoint.trim(),
				escalation: subEscalation.trim(),
				convergencePoint: convergencePoint.trim(),
				purpose: subPurpose.trim(),
				stakes: subStakes.trim(),
				characterIds: splitCommaSeparated(subCharacterIdsRaw),
				realmIds: splitCommaSeparated(subRealmIdsRaw),
				threadIds: splitCommaSeparated(subThreadIdsRaw),
			};

			onSave({
				title: payload.name,
				description: JSON.stringify(payload, null, 2),
				status: thread?.status || 'open',
				relatedSceneIds: thread?.relatedSceneIds || [],
				relatedCharacterIds: payload.characterIds,
			});
			return;
		}

		const payload: MotivationPayload = {
			kind: 'motivation',
			name: name.trim(),
			motivationType,
			desire: desire.trim(),
			fearConstraint: fearConstraint.trim(),
			belief: belief.trim(),
			trigger: trigger.trim(),
			typicalAction: typicalAction.trim(),
			escalationShift: escalationShift.trim(),
			function: motivationFunction.trim(),
			characterIds: splitCommaSeparated(motivationCharacterIdsRaw),
			factionIds: splitCommaSeparated(motivationFactionIdsRaw),
			arcIds: splitCommaSeparated(motivationArcIdsRaw),
			subPlotIds: splitCommaSeparated(motivationSubPlotIdsRaw),
		};

		onSave({
			title: payload.name,
			description: JSON.stringify(payload, null, 2),
			status: thread?.status || 'open',
			relatedSceneIds: thread?.relatedSceneIds || [],
			relatedCharacterIds: payload.characterIds,
		});
	}
</script>

<div class="dossier-form">
	<section class="dossier-form-section">
		<h3>Core Identity</h3>
		<div class="dossier-form-grid dossier-form-grid--double">
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="thread-system-name">Name <span aria-hidden="true">*</span></label>
				<input id="thread-system-name" class="dossier-form-input" class:dossier-form-input-error={!!nameError} type="text" bind:value={name} />
				{#if nameError}<p class="dossier-form-error-text">{nameError}</p>{/if}
			</div>
			{#if kind === 'major-arc'}
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="major-arc-scope">Scope</label>
					<select id="major-arc-scope" class="dossier-form-input" bind:value={scope}>
						<option value="">Select scope</option>
						<option value="global">Global</option>
						<option value="faction">Faction</option>
						<option value="character-centered">Character-centered</option>
					</select>
				</div>
			{/if}
			{#if kind === 'sub-plot'}
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="sub-plot-parent">Parent Arc <span aria-hidden="true">*</span></label>
					<select id="sub-plot-parent" class="dossier-form-input" class:dossier-form-input-error={!!parentArcError} bind:value={parentArcId}>
						<option value="">Select parent arc</option>
						{#each arcOptions as arc (arc.id)}
							<option value={arc.id}>{arc.name}</option>
						{/each}
					</select>
					{#if parentArcError}<p class="dossier-form-error-text">{parentArcError}</p>{/if}
				</div>
			{/if}
			{#if kind === 'motivation'}
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="motivation-type">Type <span aria-hidden="true">*</span></label>
					<select id="motivation-type" class="dossier-form-input" class:dossier-form-input-error={!!typeError} bind:value={motivationType}>
						<option value="">Select type</option>
						<option value="character">Character</option>
						<option value="faction">Faction</option>
						<option value="systemic">Systemic</option>
					</select>
					{#if typeError}<p class="dossier-form-error-text">{typeError}</p>{/if}
				</div>
			{/if}
		</div>
	</section>

	{#if kind === 'major-arc'}
		<section class="dossier-form-section">
			<h3>Causal Spine</h3>
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="major-initial">Initial Condition</label>
				<textarea id="major-initial" class="dossier-form-input dossier-form-textarea" rows={3} bind:value={initialCondition}></textarea>
			</div>
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="major-inciting">Inciting Pressure</label>
				<textarea id="major-inciting" class="dossier-form-input dossier-form-textarea" rows={3} bind:value={incitingPressure}></textarea>
			</div>
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="major-escalation">Escalation Pattern</label>
				<textarea id="major-escalation" class="dossier-form-input dossier-form-textarea" rows={3} bind:value={escalationPattern}></textarea>
			</div>
			<div class="dossier-form-grid dossier-form-grid--double">
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="major-breaking">Breaking Point</label>
					<textarea id="major-breaking" class="dossier-form-input dossier-form-textarea" rows={3} bind:value={breakingPoint}></textarea>
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="major-resolution">Resolution Vector</label>
					<textarea id="major-resolution" class="dossier-form-input dossier-form-textarea" rows={3} bind:value={resolutionVector}></textarea>
				</div>
			</div>
		</section>

		<section class="dossier-form-section">
			<h3>Narrative Role</h3>
			<div class="dossier-form-grid dossier-form-grid--double">
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="major-function">Arc Function</label>
					<input id="major-function" class="dossier-form-input" type="text" bind:value={arcFunction} />
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="major-stakes">Stakes</label>
					<input id="major-stakes" class="dossier-form-input" type="text" bind:value={arcStakes} />
				</div>
			</div>
		</section>

		<section class="dossier-form-section">
			<h3>Relationships</h3>
			<div class="dossier-form-grid dossier-form-grid--double">
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="major-character-ids">Character IDs</label>
					<input id="major-character-ids" class="dossier-form-input" type="text" bind:value={arcCharacterIdsRaw} />
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="major-realm-ids">Realm IDs</label>
					<input id="major-realm-ids" class="dossier-form-input" type="text" bind:value={arcRealmIdsRaw} />
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="major-thread-ids">Thread IDs</label>
					<input id="major-thread-ids" class="dossier-form-input" type="text" bind:value={arcThreadIdsRaw} />
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="major-subplot-ids">Sub-plot IDs</label>
					<input id="major-subplot-ids" class="dossier-form-input" type="text" bind:value={subPlotIdsRaw} />
				</div>
			</div>
		</section>
	{/if}

	{#if kind === 'sub-plot'}
		<section class="dossier-form-section">
			<h3>Function</h3>
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="sub-relationship">Relationship to Main Arc</label>
				<textarea id="sub-relationship" class="dossier-form-input dossier-form-textarea" rows={2} bind:value={relationshipToMainArc}></textarea>
			</div>
			<div class="dossier-form-grid dossier-form-grid--double">
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="sub-entry">Entry Point</label>
					<textarea id="sub-entry" class="dossier-form-input dossier-form-textarea" rows={2} bind:value={entryPoint}></textarea>
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="sub-convergence">Convergence Point</label>
					<textarea id="sub-convergence" class="dossier-form-input dossier-form-textarea" rows={2} bind:value={convergencePoint}></textarea>
				</div>
			</div>
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="sub-escalation">Escalation</label>
				<textarea id="sub-escalation" class="dossier-form-input dossier-form-textarea" rows={3} bind:value={subEscalation}></textarea>
			</div>
		</section>

		<section class="dossier-form-section">
			<h3>Narrative Role</h3>
			<div class="dossier-form-grid dossier-form-grid--double">
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="sub-purpose">Purpose</label>
					<input id="sub-purpose" class="dossier-form-input" type="text" bind:value={subPurpose} />
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="sub-stakes">Stakes</label>
					<input id="sub-stakes" class="dossier-form-input" type="text" bind:value={subStakes} />
				</div>
			</div>
		</section>

		<section class="dossier-form-section">
			<h3>Relationships</h3>
			<div class="dossier-form-grid dossier-form-grid--double">
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="sub-character-ids">Character IDs</label>
					<input id="sub-character-ids" class="dossier-form-input" type="text" bind:value={subCharacterIdsRaw} />
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="sub-realm-ids">Realm IDs</label>
					<input id="sub-realm-ids" class="dossier-form-input" type="text" bind:value={subRealmIdsRaw} />
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="sub-thread-ids">Thread IDs</label>
					<input id="sub-thread-ids" class="dossier-form-input" type="text" bind:value={subThreadIdsRaw} />
				</div>
			</div>
		</section>
	{/if}

	{#if kind === 'motivation'}
		<section class="dossier-form-section">
			<h3>Decision Logic</h3>
			<div class="dossier-form-grid dossier-form-grid--double">
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="motivation-desire">Desire</label>
					<textarea id="motivation-desire" class="dossier-form-input dossier-form-textarea" rows={2} bind:value={desire}></textarea>
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="motivation-fear">Fear / Constraint</label>
					<textarea id="motivation-fear" class="dossier-form-input dossier-form-textarea" rows={2} bind:value={fearConstraint}></textarea>
				</div>
			</div>
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="motivation-belief">Belief</label>
				<textarea id="motivation-belief" class="dossier-form-input dossier-form-textarea" rows={2} bind:value={belief}></textarea>
			</div>
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="motivation-trigger">Trigger</label>
				<textarea id="motivation-trigger" class="dossier-form-input dossier-form-textarea" rows={2} bind:value={trigger}></textarea>
			</div>
		</section>

		<section class="dossier-form-section">
			<h3>Behavior Pattern</h3>
			<div class="dossier-form-grid dossier-form-grid--double">
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="motivation-action">Typical Action</label>
					<textarea id="motivation-action" class="dossier-form-input dossier-form-textarea" rows={2} bind:value={typicalAction}></textarea>
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="motivation-shift">Escalation Shift</label>
					<textarea id="motivation-shift" class="dossier-form-input dossier-form-textarea" rows={2} bind:value={escalationShift}></textarea>
				</div>
			</div>
		</section>

		<section class="dossier-form-section">
			<h3>Narrative Role</h3>
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="motivation-function">Function</label>
				<input id="motivation-function" class="dossier-form-input" type="text" bind:value={motivationFunction} />
			</div>
		</section>

		<section class="dossier-form-section">
			<h3>Relationships</h3>
			<div class="dossier-form-grid dossier-form-grid--double">
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="motivation-character-ids">Character IDs</label>
					<input id="motivation-character-ids" class="dossier-form-input" type="text" bind:value={motivationCharacterIdsRaw} />
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="motivation-faction-ids">Faction IDs</label>
					<input id="motivation-faction-ids" class="dossier-form-input" type="text" bind:value={motivationFactionIdsRaw} />
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="motivation-arc-ids">Arc IDs</label>
					<input id="motivation-arc-ids" class="dossier-form-input" type="text" bind:value={motivationArcIdsRaw} />
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="motivation-subplot-ids">Sub-plot IDs</label>
					<input id="motivation-subplot-ids" class="dossier-form-input" type="text" bind:value={motivationSubPlotIdsRaw} />
				</div>
			</div>
		</section>
	{/if}

	<div class="dossier-form-actions">
		<GhostButton onclick={onCancel} disabled={saving}>Cancel</GhostButton>
		<PrimaryButton onclick={handleSubmit} disabled={saving}>
			{saving ? 'Saving…' : thread ? 'Save Changes' : 'Create Entry'}
		</PrimaryButton>
	</div>
</div>
