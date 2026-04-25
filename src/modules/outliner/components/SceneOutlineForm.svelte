<script lang="ts">
	import type { Scene } from '$lib/db/types.js';
	import { untrack } from 'svelte';
	import { updateScene } from '$modules/editor/services/scene-repository.js';
	import StructuredSection from '$lib/components/planning/StructuredSection.svelte';
	import ArcTagHint from './ArcTagHint.svelte';
	import { SurfacePanel } from '$lib/components/ui/index.js';

	let { scene, onUpdate } = $props<{
		scene: Scene;
		onUpdate: (id: string, data: Partial<Omit<Scene, 'id' | 'createdAt'>>) => void;
	}>();

	// eslint-disable-next-line svelte/prefer-writable-derived
	let summary = $state(untrack(() => scene.summary));

	const goalKey = $derived(`novellum_outline_scene_goal_${scene.id}`);
	const conflictKey = $derived(`novellum_outline_scene_conflict_${scene.id}`);
	const outcomeKey = $derived(`novellum_outline_scene_outcome_${scene.id}`);
	const notesKey = $derived(`novellum_outline_scene_notes_${scene.id}`);

	let goal = $state('');
	let conflict = $state('');
	let outcome = $state('');
	let notes = $state('');

	// Sync summary when scene prop changes (different scene selected)
	$effect(() => {
		summary = scene.summary;
	});

	// Load structured planning fields from localStorage when scene ID changes
	$effect(() => {
		goal = localStorage.getItem(goalKey) ?? '';
		conflict = localStorage.getItem(conflictKey) ?? '';
		outcome = localStorage.getItem(outcomeKey) ?? '';
		notes = localStorage.getItem(notesKey) ?? '';
	});

	async function saveSummary() {
		if (summary === scene.summary) return;
		await updateScene(scene.id, { summary });
		onUpdate(scene.id, { summary });
	}

	function saveGoal() {
		if (goal.trim()) {
			localStorage.setItem(goalKey, goal);
		} else {
			localStorage.removeItem(goalKey);
		}
	}

	function saveConflict() {
		if (conflict.trim()) {
			localStorage.setItem(conflictKey, conflict);
		} else {
			localStorage.removeItem(conflictKey);
		}
	}

	function saveOutcome() {
		if (outcome.trim()) {
			localStorage.setItem(outcomeKey, outcome);
		} else {
			localStorage.removeItem(outcomeKey);
		}
	}

	function saveNotes() {
		if (notes.trim()) {
			localStorage.setItem(notesKey, notes);
		} else {
			localStorage.removeItem(notesKey);
		}
	}
</script>

<SurfacePanel class="planning-panel">
	<!-- Panel context bar -->
	<div class="planning-context">
		<span class="planning-context-label">Intent</span>
		<span class="planning-context-desc"
			>What does this scene accomplish, and how does it move the story forward?</span
		>
	</div>

	<!-- Summary: primary field -->
	<div class="planning-field">
		<label class="planning-field-label" for="sc-summary">Summary</label>
		<p class="planning-field-hint">What happens in this scene?</p>
		<textarea
			id="sc-summary"
			class="planning-field-textarea"
			rows="3"
			placeholder="A scene in which…"
			bind:value={summary}
			onblur={saveSummary}
		></textarea>
	</div>

	<!-- Story Movement section -->
	<div class="planning-divider"></div>
	<StructuredSection label="Story Movement">
		<div class="planning-field">
			<label class="planning-field-label" for="sc-goal">Goal</label>
			<p class="planning-field-hint">What does the POV character want?</p>
			<textarea
				id="sc-goal"
				class="planning-field-textarea"
				rows="2"
				placeholder="The character wants…"
				bind:value={goal}
				oninput={saveGoal}
			></textarea>
		</div>

		<div class="planning-field">
			<label class="planning-field-label" for="sc-conflict">Conflict</label>
			<p class="planning-field-hint">What stands in the way?</p>
			<textarea
				id="sc-conflict"
				class="planning-field-textarea"
				rows="2"
				placeholder="But they face…"
				bind:value={conflict}
				oninput={saveConflict}
			></textarea>
		</div>

		<div class="planning-field">
			<label class="planning-field-label" for="sc-outcome">Outcome</label>
			<p class="planning-field-hint">How does the scene resolve? What changes?</p>
			<textarea
				id="sc-outcome"
				class="planning-field-textarea"
				rows="2"
				placeholder="The scene ends with…"
				bind:value={outcome}
				oninput={saveOutcome}
			></textarea>
		</div>
	</StructuredSection>

	<!-- Notes section -->
	<div class="planning-divider"></div>
	<StructuredSection label="Notes">
		<div class="planning-field">
			<textarea
				id="sc-notes"
				class="planning-field-textarea"
				rows="3"
				placeholder="Tone, research, open questions…"
				bind:value={notes}
				oninput={saveNotes}
			></textarea>
		</div>
	</StructuredSection>

	<!-- Arc tags -->
	<ArcTagHint arcRefs={scene.arcRefs} />
</SurfacePanel>
