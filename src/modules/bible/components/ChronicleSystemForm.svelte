<script lang="ts">
	import { untrack } from 'svelte';
	import type { TimelineEvent, Character } from '$lib/db/domain-types';
	import type { EntityFormCallbacks } from '../types.js';
	import GhostButton from '$lib/components/ui/GhostButton.svelte';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';
	import {
		eraDefaults,
		keyEventDefaults,
		personalHistoryDefaults,
		ERA_TYPES,
		KEY_EVENT_TYPES,
		PERSONAL_HISTORY_TYPES,
		type ChronicleSystemKind,
		type EraPayload,
		type KeyEventPayload,
		type PersonalHistoryPayload,
	} from '$modules/bible/chronicle-systems.js';

	let {
		event = null,
		kind,
		characters = [],
		saving = false,
		onSave,
		onCancel,
	}: {
		event?: TimelineEvent | null;
		kind: ChronicleSystemKind;
		characters?: Character[];
		saving?: boolean;
	} & EntityFormCallbacks<TimelineEvent> = $props();

	function splitCommaSeparated(raw: string): string[] {
		return raw
			.split(',')
			.map((value) => value.trim())
			.filter(Boolean);
	}

	function joinCommaSeparated(values: string[] | undefined): string {
		return (values ?? []).join(', ');
	}

	const era = untrack(() => eraDefaults(event));
	const keyEvent = untrack(() => keyEventDefaults(event));
	const personalHistory = untrack(() => personalHistoryDefaults(event));

	// Era state
	let eraName = $state(untrack(() => era.name));
	let eraType = $state(untrack(() => era.eraType));
	let narrativeSpan = $state(untrack(() => era.narrativeSpan));
	let openingCondition = $state(untrack(() => era.openingCondition));
	let definingConflict = $state(untrack(() => era.definingConflict));
	let dominantPowers = $state(untrack(() => era.dominantPowers));
	let culturalState = $state(untrack(() => era.culturalState));
	let technologicalState = $state(untrack(() => era.technologicalState));
	let spiritualState = $state(untrack(() => era.spiritualState));
	let turningPoint = $state(untrack(() => era.turningPoint));
	let endingCondition = $state(untrack(() => era.endingCondition));
	let eraNarrativeFunction = $state(untrack(() => era.narrativeFunction));
	let eraContinuityNotes = $state(untrack(() => era.continuityNotes));
	let eraCharacterIdsRaw = $state(untrack(() => joinCommaSeparated(era.characterIds)));
	let eraFactionIdsRaw = $state(untrack(() => joinCommaSeparated(era.factionIds)));
	let eraRealmIdsRaw = $state(untrack(() => joinCommaSeparated(era.realmIds)));
	let eraKeyEventIdsRaw = $state(untrack(() => joinCommaSeparated(era.keyEventIds)));

	// Key event state
	let keTitle = $state(untrack(() => keyEvent.title));
	let keEventType = $state(untrack(() => keyEvent.eventType));
	let keNarrativeDate = $state(untrack(() => keyEvent.narrativeDate));
	let keRelatedEraId = $state(untrack(() => keyEvent.relatedEraId));
	let keTrigger = $state(untrack(() => keyEvent.trigger));
	let keEventSummary = $state(untrack(() => keyEvent.eventSummary));
	let keImmediateConsequence = $state(untrack(() => keyEvent.immediateConsequence));
	let keLongTermConsequence = $state(untrack(() => keyEvent.longTermConsequence));
	let keStakes = $state(untrack(() => keyEvent.stakes));
	let keNarrativeFunction = $state(untrack(() => keyEvent.narrativeFunction));
	let keContinuityImpact = $state(untrack(() => keyEvent.continuityImpact));
	let keCharacterIdsRaw = $state(untrack(() => joinCommaSeparated(keyEvent.characterIds)));
	let keFactionIdsRaw = $state(untrack(() => joinCommaSeparated(keyEvent.factionIds)));
	let keRealmIdsRaw = $state(untrack(() => joinCommaSeparated(keyEvent.realmIds)));
	let keSceneIdsRaw = $state(untrack(() => joinCommaSeparated(keyEvent.sceneIds)));

	// Personal history state
	let phTitle = $state(untrack(() => personalHistory.title));
	let phSubjectCharacterId = $state(untrack(() => personalHistory.subjectCharacterId));
	let phHistoryType = $state(untrack(() => personalHistory.historyType));
	let phTimeframe = $state(untrack(() => personalHistory.timeframe));
	let phFormativeEvent = $state(untrack(() => personalHistory.formativeEvent));
	let phWoundOrLesson = $state(untrack(() => personalHistory.woundOrLesson));
	let phSecretOrOmission = $state(untrack(() => personalHistory.secretOrOmission));
	let phUnresolvedConsequence = $state(untrack(() => personalHistory.unresolvedConsequence));
	let phPresentBehavior = $state(untrack(() => personalHistory.presentBehavior));
	let phRelationshipImpact = $state(untrack(() => personalHistory.relationshipImpact));
	let phArcImpact = $state(untrack(() => personalHistory.arcImpact));
	let phContinuityNotes = $state(untrack(() => personalHistory.continuityNotes));
	let phRelatedCharacterIdsRaw = $state(
		untrack(() => joinCommaSeparated(personalHistory.relatedCharacterIds)),
	);
	let phArcIdsRaw = $state(untrack(() => joinCommaSeparated(personalHistory.arcIds)));
	let phKeyEventIdsRaw = $state(untrack(() => joinCommaSeparated(personalHistory.keyEventIds)));

	let nameError = $state('');

	function handleSubmit() {
		nameError = '';

		if (kind === 'era') {
			if (!eraName.trim()) {
				nameError = 'Name is required.';
				return;
			}
			const payload: EraPayload = {
				kind: 'era',
				name: eraName.trim(),
				eraType,
				narrativeSpan: narrativeSpan.trim(),
				openingCondition: openingCondition.trim(),
				definingConflict: definingConflict.trim(),
				dominantPowers: dominantPowers.trim(),
				culturalState: culturalState.trim(),
				technologicalState: technologicalState.trim(),
				spiritualState: spiritualState.trim(),
				turningPoint: turningPoint.trim(),
				endingCondition: endingCondition.trim(),
				narrativeFunction: eraNarrativeFunction.trim(),
				continuityNotes: eraContinuityNotes.trim(),
				characterIds: splitCommaSeparated(eraCharacterIdsRaw),
				factionIds: splitCommaSeparated(eraFactionIdsRaw),
				realmIds: splitCommaSeparated(eraRealmIdsRaw),
				keyEventIds: splitCommaSeparated(eraKeyEventIdsRaw),
			};
			onSave({
				title: payload.name,
				description: JSON.stringify(payload, null, 2),
				date: payload.narrativeSpan,
				relatedCharacterIds: payload.characterIds,
				relatedSceneIds: event?.relatedSceneIds ?? [],
				category: 'era',
			});
			return;
		}

		if (kind === 'key-event') {
			if (!keTitle.trim()) {
				nameError = 'Title is required.';
				return;
			}
			const payload: KeyEventPayload = {
				kind: 'key-event',
				title: keTitle.trim(),
				eventType: keEventType,
				narrativeDate: keNarrativeDate.trim(),
				relatedEraId: keRelatedEraId.trim(),
				trigger: keTrigger.trim(),
				eventSummary: keEventSummary.trim(),
				immediateConsequence: keImmediateConsequence.trim(),
				longTermConsequence: keLongTermConsequence.trim(),
				stakes: keStakes.trim(),
				narrativeFunction: keNarrativeFunction.trim(),
				continuityImpact: keContinuityImpact.trim(),
				characterIds: splitCommaSeparated(keCharacterIdsRaw),
				factionIds: splitCommaSeparated(keFactionIdsRaw),
				realmIds: splitCommaSeparated(keRealmIdsRaw),
				sceneIds: splitCommaSeparated(keSceneIdsRaw),
			};
			onSave({
				title: payload.title,
				description: JSON.stringify(payload, null, 2),
				date: payload.narrativeDate,
				relatedCharacterIds: payload.characterIds,
				relatedSceneIds: payload.sceneIds,
				category: 'key-event',
			});
			return;
		}

		// personal-history
		if (!phTitle.trim()) {
			nameError = 'Title is required.';
			return;
		}
		const payload: PersonalHistoryPayload = {
			kind: 'personal-history',
			title: phTitle.trim(),
			subjectCharacterId: phSubjectCharacterId.trim(),
			historyType: phHistoryType,
			timeframe: phTimeframe.trim(),
			formativeEvent: phFormativeEvent.trim(),
			woundOrLesson: phWoundOrLesson.trim(),
			secretOrOmission: phSecretOrOmission.trim(),
			unresolvedConsequence: phUnresolvedConsequence.trim(),
			presentBehavior: phPresentBehavior.trim(),
			relationshipImpact: phRelationshipImpact.trim(),
			arcImpact: phArcImpact.trim(),
			continuityNotes: phContinuityNotes.trim(),
			relatedCharacterIds: splitCommaSeparated(phRelatedCharacterIdsRaw),
			arcIds: splitCommaSeparated(phArcIdsRaw),
			keyEventIds: splitCommaSeparated(phKeyEventIdsRaw),
		};
		const characterIds = [
			...(payload.subjectCharacterId ? [payload.subjectCharacterId] : []),
			...payload.relatedCharacterIds,
		];
		onSave({
			title: payload.title,
			description: JSON.stringify(payload, null, 2),
			date: payload.timeframe,
			relatedCharacterIds: characterIds,
			relatedSceneIds: event?.relatedSceneIds ?? [],
			category: 'personal-history',
		});
	}
</script>

<div class="dossier-form">
	{#if kind === 'era'}
		<section class="dossier-form-section">
			<h3>Core Identity</h3>
			<div class="dossier-form-grid dossier-form-grid--double">
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="era-name"
						>Name <span aria-hidden="true">*</span></label
					>
					<input
						id="era-name"
						class="dossier-form-input"
						class:dossier-form-input-error={!!nameError}
						type="text"
						bind:value={eraName}
						aria-required="true"
						aria-invalid={!!nameError}
					/>
					{#if nameError}<p class="dossier-form-error-text">{nameError}</p>{/if}
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="era-type">Era Type</label>
					<select id="era-type" class="dossier-form-input" bind:value={eraType}>
						<option value="">Select type</option>
						{#each ERA_TYPES as type (type)}
							<option value={type}>{type}</option>
						{/each}
					</select>
				</div>
			</div>
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="era-span">Narrative Span</label>
				<input
					id="era-span"
					class="dossier-form-input"
					type="text"
					bind:value={narrativeSpan}
					placeholder="Year 1 — Year 47"
				/>
			</div>
		</section>

		<section class="dossier-form-section">
			<h3>Historical Pressure</h3>
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="era-opening">Opening Condition</label>
				<textarea
					id="era-opening"
					class="dossier-form-input dossier-form-textarea"
					rows={3}
					bind:value={openingCondition}
				></textarea>
			</div>
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="era-conflict">Defining Conflict</label>
				<textarea
					id="era-conflict"
					class="dossier-form-input dossier-form-textarea"
					rows={3}
					bind:value={definingConflict}
				></textarea>
			</div>
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="era-powers">Dominant Powers</label>
				<textarea
					id="era-powers"
					class="dossier-form-input dossier-form-textarea"
					rows={2}
					bind:value={dominantPowers}
				></textarea>
			</div>
		</section>

		<section class="dossier-form-section">
			<h3>World State</h3>
			<div class="dossier-form-grid dossier-form-grid--double">
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="era-cultural">Cultural State</label>
					<textarea
						id="era-cultural"
						class="dossier-form-input dossier-form-textarea"
						rows={2}
						bind:value={culturalState}
					></textarea>
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="era-tech">Technological State</label>
					<textarea
						id="era-tech"
						class="dossier-form-input dossier-form-textarea"
						rows={2}
						bind:value={technologicalState}
					></textarea>
				</div>
			</div>
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="era-spiritual">Spiritual / Mythic State</label>
				<textarea
					id="era-spiritual"
					class="dossier-form-input dossier-form-textarea"
					rows={2}
					bind:value={spiritualState}
				></textarea>
			</div>
		</section>

		<section class="dossier-form-section">
			<h3>Transition</h3>
			<div class="dossier-form-grid dossier-form-grid--double">
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="era-turning">Turning Point</label>
					<textarea
						id="era-turning"
						class="dossier-form-input dossier-form-textarea"
						rows={2}
						bind:value={turningPoint}
					></textarea>
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="era-ending">Ending Condition</label>
					<textarea
						id="era-ending"
						class="dossier-form-input dossier-form-textarea"
						rows={2}
						bind:value={endingCondition}
					></textarea>
				</div>
			</div>
		</section>

		<section class="dossier-form-section">
			<h3>Narrative Role</h3>
			<div class="dossier-form-grid dossier-form-grid--double">
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="era-function">Narrative Function</label>
					<input
						id="era-function"
						class="dossier-form-input"
						type="text"
						bind:value={eraNarrativeFunction}
					/>
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="era-continuity">Continuity Notes</label>
					<textarea
						id="era-continuity"
						class="dossier-form-input dossier-form-textarea"
						rows={2}
						bind:value={eraContinuityNotes}
					></textarea>
				</div>
			</div>
		</section>

		<section class="dossier-form-section">
			<h3>Relationships</h3>
			<div class="dossier-form-grid dossier-form-grid--double">
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="era-character-ids">Character IDs</label>
					<input
						id="era-character-ids"
						class="dossier-form-input"
						type="text"
						bind:value={eraCharacterIdsRaw}
					/>
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="era-faction-ids">Faction IDs</label>
					<input
						id="era-faction-ids"
						class="dossier-form-input"
						type="text"
						bind:value={eraFactionIdsRaw}
					/>
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="era-realm-ids">Realm IDs</label>
					<input
						id="era-realm-ids"
						class="dossier-form-input"
						type="text"
						bind:value={eraRealmIdsRaw}
					/>
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="era-key-event-ids">Key Event IDs</label>
					<input
						id="era-key-event-ids"
						class="dossier-form-input"
						type="text"
						bind:value={eraKeyEventIdsRaw}
					/>
				</div>
			</div>
		</section>
	{/if}

	{#if kind === 'key-event'}
		<section class="dossier-form-section">
			<h3>Core Identity</h3>
			<div class="dossier-form-grid dossier-form-grid--double">
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="ke-title"
						>Title <span aria-hidden="true">*</span></label
					>
					<input
						id="ke-title"
						class="dossier-form-input"
						class:dossier-form-input-error={!!nameError}
						type="text"
						bind:value={keTitle}
						aria-required="true"
						aria-invalid={!!nameError}
					/>
					{#if nameError}<p class="dossier-form-error-text">{nameError}</p>{/if}
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="ke-type">Event Type</label>
					<select id="ke-type" class="dossier-form-input" bind:value={keEventType}>
						<option value="">Select type</option>
						{#each KEY_EVENT_TYPES as type (type)}
							<option value={type}>{type}</option>
						{/each}
					</select>
				</div>
			</div>
			<div class="dossier-form-grid dossier-form-grid--double">
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="ke-date">Narrative Date</label>
					<input
						id="ke-date"
						class="dossier-form-input"
						type="text"
						bind:value={keNarrativeDate}
						placeholder="Year 3, Day 47"
					/>
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="ke-era">Related Era</label>
					<input
						id="ke-era"
						class="dossier-form-input"
						type="text"
						bind:value={keRelatedEraId}
						placeholder="Era ID"
					/>
				</div>
			</div>
		</section>

		<section class="dossier-form-section">
			<h3>Causal Chain</h3>
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="ke-trigger">Trigger</label>
				<textarea
					id="ke-trigger"
					class="dossier-form-input dossier-form-textarea"
					rows={2}
					bind:value={keTrigger}
				></textarea>
			</div>
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="ke-summary">Event Summary</label>
				<textarea
					id="ke-summary"
					class="dossier-form-input dossier-form-textarea"
					rows={3}
					bind:value={keEventSummary}
				></textarea>
			</div>
			<div class="dossier-form-grid dossier-form-grid--double">
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="ke-immediate">Immediate Consequence</label>
					<textarea
						id="ke-immediate"
						class="dossier-form-input dossier-form-textarea"
						rows={3}
						bind:value={keImmediateConsequence}
					></textarea>
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="ke-long">Long-Term Consequence</label>
					<textarea
						id="ke-long"
						class="dossier-form-input dossier-form-textarea"
						rows={3}
						bind:value={keLongTermConsequence}
					></textarea>
				</div>
			</div>
		</section>

		<section class="dossier-form-section">
			<h3>Narrative Role</h3>
			<div class="dossier-form-grid dossier-form-grid--double">
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="ke-stakes">Stakes</label>
					<input id="ke-stakes" class="dossier-form-input" type="text" bind:value={keStakes} />
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="ke-function">Narrative Function</label>
					<input
						id="ke-function"
						class="dossier-form-input"
						type="text"
						bind:value={keNarrativeFunction}
					/>
				</div>
			</div>
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="ke-continuity">Continuity Impact</label>
				<textarea
					id="ke-continuity"
					class="dossier-form-input dossier-form-textarea"
					rows={2}
					bind:value={keContinuityImpact}
				></textarea>
			</div>
		</section>

		<section class="dossier-form-section">
			<h3>Relationships</h3>
			<div class="dossier-form-grid dossier-form-grid--double">
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="ke-character-ids">Character IDs</label>
					<input
						id="ke-character-ids"
						class="dossier-form-input"
						type="text"
						bind:value={keCharacterIdsRaw}
					/>
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="ke-faction-ids">Faction IDs</label>
					<input
						id="ke-faction-ids"
						class="dossier-form-input"
						type="text"
						bind:value={keFactionIdsRaw}
					/>
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="ke-realm-ids">Realm IDs</label>
					<input
						id="ke-realm-ids"
						class="dossier-form-input"
						type="text"
						bind:value={keRealmIdsRaw}
					/>
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="ke-scene-ids">Scene IDs</label>
					<input
						id="ke-scene-ids"
						class="dossier-form-input"
						type="text"
						bind:value={keSceneIdsRaw}
					/>
				</div>
			</div>
		</section>
	{/if}

	{#if kind === 'personal-history'}
		<section class="dossier-form-section">
			<h3>Core Identity</h3>
			<div class="dossier-form-grid dossier-form-grid--double">
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="ph-title"
						>Title <span aria-hidden="true">*</span></label
					>
					<input
						id="ph-title"
						class="dossier-form-input"
						class:dossier-form-input-error={!!nameError}
						type="text"
						bind:value={phTitle}
						aria-required="true"
						aria-invalid={!!nameError}
					/>
					{#if nameError}<p class="dossier-form-error-text">{nameError}</p>{/if}
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="ph-subject">Subject Character</label>
					{#if characters.length > 0}
						<select
							id="ph-subject"
							class="dossier-form-input"
							bind:value={phSubjectCharacterId}
						>
							<option value="">Select character</option>
							{#each characters as char (char.id)}
								<option value={char.id}>{char.name}</option>
							{/each}
						</select>
					{:else}
						<input
							id="ph-subject"
							class="dossier-form-input"
							type="text"
							bind:value={phSubjectCharacterId}
							placeholder="Character ID"
						/>
					{/if}
				</div>
			</div>
			<div class="dossier-form-grid dossier-form-grid--double">
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="ph-type">History Type</label>
					<select id="ph-type" class="dossier-form-input" bind:value={phHistoryType}>
						<option value="">Select type</option>
						{#each PERSONAL_HISTORY_TYPES as type (type)}
							<option value={type}>{type}</option>
						{/each}
					</select>
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="ph-timeframe">Timeframe</label>
					<input
						id="ph-timeframe"
						class="dossier-form-input"
						type="text"
						bind:value={phTimeframe}
					/>
				</div>
			</div>
		</section>

		<section class="dossier-form-section">
			<h3>Backstory Spine</h3>
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="ph-formative">Formative Event</label>
				<textarea
					id="ph-formative"
					class="dossier-form-input dossier-form-textarea"
					rows={3}
					bind:value={phFormativeEvent}
				></textarea>
			</div>
			<div class="dossier-form-grid dossier-form-grid--double">
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="ph-wound">Wound / Lesson</label>
					<textarea
						id="ph-wound"
						class="dossier-form-input dossier-form-textarea"
						rows={2}
						bind:value={phWoundOrLesson}
					></textarea>
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="ph-secret">Secret / Omission</label>
					<textarea
						id="ph-secret"
						class="dossier-form-input dossier-form-textarea"
						rows={2}
						bind:value={phSecretOrOmission}
					></textarea>
				</div>
			</div>
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="ph-unresolved">Unresolved Consequence</label>
				<textarea
					id="ph-unresolved"
					class="dossier-form-input dossier-form-textarea"
					rows={2}
					bind:value={phUnresolvedConsequence}
				></textarea>
			</div>
		</section>

		<section class="dossier-form-section">
			<h3>Present-Day Effect</h3>
			<div class="dossier-form-grid dossier-form-grid--double">
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="ph-behavior">Present Behavior</label>
					<textarea
						id="ph-behavior"
						class="dossier-form-input dossier-form-textarea"
						rows={2}
						bind:value={phPresentBehavior}
					></textarea>
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="ph-relationship">Relationship Impact</label>
					<textarea
						id="ph-relationship"
						class="dossier-form-input dossier-form-textarea"
						rows={2}
						bind:value={phRelationshipImpact}
					></textarea>
				</div>
			</div>
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="ph-arc">Arc Impact</label>
				<textarea
					id="ph-arc"
					class="dossier-form-input dossier-form-textarea"
					rows={2}
					bind:value={phArcImpact}
				></textarea>
			</div>
		</section>

		<section class="dossier-form-section">
			<h3>Continuity</h3>
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="ph-continuity">Continuity Notes</label>
				<textarea
					id="ph-continuity"
					class="dossier-form-input dossier-form-textarea"
					rows={2}
					bind:value={phContinuityNotes}
				></textarea>
			</div>
		</section>

		<section class="dossier-form-section">
			<h3>Relationships</h3>
			<div class="dossier-form-grid dossier-form-grid--double">
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="ph-related-character-ids"
						>Related Character IDs</label
					>
					<input
						id="ph-related-character-ids"
						class="dossier-form-input"
						type="text"
						bind:value={phRelatedCharacterIdsRaw}
					/>
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="ph-arc-ids">Arc IDs</label>
					<input
						id="ph-arc-ids"
						class="dossier-form-input"
						type="text"
						bind:value={phArcIdsRaw}
					/>
				</div>
				<div class="dossier-form-field">
					<label class="dossier-form-label" for="ph-key-event-ids">Key Event IDs</label>
					<input
						id="ph-key-event-ids"
						class="dossier-form-input"
						type="text"
						bind:value={phKeyEventIdsRaw}
					/>
				</div>
			</div>
		</section>
	{/if}

	<div class="dossier-form-actions">
		<GhostButton onclick={onCancel} disabled={saving}>Cancel</GhostButton>
		<PrimaryButton onclick={handleSubmit} disabled={saving}>
			{saving ? 'Saving…' : event ? 'Save Changes' : 'Create Entry'}
		</PrimaryButton>
	</div>
</div>
