<script lang="ts">
	import type { Chapter } from '$lib/db/domain-types';
	import { untrack } from 'svelte';
	import { updateChapter } from '$modules/project/services/chapter-repository.js';
	import StructuredSection from '$lib/components/planning/StructuredSection.svelte';
	import ArcTagHint from './ArcTagHint.svelte';
	import { SurfacePanel } from '$lib/components/ui/index.js';
	import {
		getProjectMetadata,
		setProjectMetadata,
	} from '$lib/project-metadata.js';

	let { chapter, onUpdate } = $props<{
		chapter: Chapter;
		onUpdate: (id: string, data: Partial<Omit<Chapter, 'id' | 'createdAt'>>) => void;
	}>();
	// eslint-disable-next-line svelte/prefer-writable-derived
	let summary = $state(untrack(() => chapter.summary));

	const notesKey = $derived(`novellum_outline_chapter_notes_${chapter.id}`);
	const functionKey = $derived(`novellum_outline_chapter_function_${chapter.id}`);
	const turnKey = $derived(`novellum_outline_chapter_turn_${chapter.id}`);
	const revelationKey = $derived(`novellum_outline_chapter_revelation_${chapter.id}`);

	type ChapterOutline = {
		notes: string;
		chapterFunction: string;
		majorTurn: string;
		revelation: string;
	};

	let notes = $state('');
	let chapterFunction = $state('');
	let majorTurn = $state('');
	let revelation = $state('');

	// Sync summary when chapter selection changes
	$effect(() => {
		summary = chapter.summary;
	});

	// Load localStorage cache then reconcile with SQLite-canonical store.
	$effect(() => {
		notes = localStorage.getItem(notesKey) ?? '';
		chapterFunction = localStorage.getItem(functionKey) ?? '';
		majorTurn = localStorage.getItem(turnKey) ?? '';
		revelation = localStorage.getItem(revelationKey) ?? '';
		const cid = chapter.id;
		void getProjectMetadata<ChapterOutline | null>(
			chapter.projectId,
			'chapter',
			cid,
			'outline',
			null,
		).then((remote) => {
			if (!remote || cid !== chapter.id) return;
			if (remote.notes !== undefined) {
				notes = remote.notes;
				try { localStorage.setItem(notesKey, remote.notes); } catch { /* ignore */ }
			}
			if (remote.chapterFunction !== undefined) {
				chapterFunction = remote.chapterFunction;
				try { localStorage.setItem(functionKey, remote.chapterFunction); } catch { /* ignore */ }
			}
			if (remote.majorTurn !== undefined) {
				majorTurn = remote.majorTurn;
				try { localStorage.setItem(turnKey, remote.majorTurn); } catch { /* ignore */ }
			}
			if (remote.revelation !== undefined) {
				revelation = remote.revelation;
				try { localStorage.setItem(revelationKey, remote.revelation); } catch { /* ignore */ }
			}
		});
	});

	function persistOutline(): void {
		void setProjectMetadata<ChapterOutline>(
			chapter.projectId,
			'chapter',
			chapter.id,
			'outline',
			{ notes, chapterFunction, majorTurn, revelation },
		);
	}

	async function saveSummary() {
		if (summary === chapter.summary) return;
		await updateChapter(chapter.id, { summary });
		onUpdate(chapter.id, { summary });
	}

	function saveNotes() {
		if (notes.trim()) {
			localStorage.setItem(notesKey, notes);
		} else {
			localStorage.removeItem(notesKey);
		}
		persistOutline();
	}

	function saveChapterFunction() {
		if (chapterFunction.trim()) {
			localStorage.setItem(functionKey, chapterFunction);
		} else {
			localStorage.removeItem(functionKey);
		}
		persistOutline();
	}

	function saveMajorTurn() {
		if (majorTurn.trim()) {
			localStorage.setItem(turnKey, majorTurn);
		} else {
			localStorage.removeItem(turnKey);
		}
		persistOutline();
	}

	function saveRevelation() {
		if (revelation.trim()) {
			localStorage.setItem(revelationKey, revelation);
		} else {
			localStorage.removeItem(revelationKey);
		}
		persistOutline();
	}
</script>

<SurfacePanel class="planning-panel">
	<!-- Panel context bar -->
	<div class="planning-context">
		<span class="planning-context-label">Intent</span>
		<span class="planning-context-desc"
			>What does this chapter accomplish and why does it belong here?</span
		>
	</div>

	<!-- Summary & Purpose ─ primary field -->
	<div class="planning-field">
		<label class="planning-field-label" for="ch-summary">Summary &amp; Purpose</label>
		<p class="planning-field-hint">
			What does this chapter accomplish? What changes for the reader?
		</p>
		<textarea
			id="ch-summary"
			class="planning-field-textarea"
			rows="4"
			placeholder="This chapter establishes…"
			bind:value={summary}
			onblur={saveSummary}
		></textarea>
	</div>

	<!-- Chapter Role section -->
	<div class="planning-divider"></div>
	<StructuredSection label="Chapter Role">
		<div class="planning-field">
			<label class="planning-field-label" for="ch-function">Function in the Story</label>
			<p class="planning-field-hint">
				What work does this chapter do? Setup, escalation, reversal, resolution?
			</p>
			<textarea
				id="ch-function"
				class="planning-field-textarea"
				rows="2"
				placeholder="This chapter functions as…"
				bind:value={chapterFunction}
				oninput={saveChapterFunction}
			></textarea>
		</div>

		<div class="planning-field">
			<label class="planning-field-label" for="ch-turn">Major Change or Turn</label>
			<p class="planning-field-hint">What shifts — for a character, the story, or the reader?</p>
			<textarea
				id="ch-turn"
				class="planning-field-textarea"
				rows="2"
				placeholder="By the end of this chapter…"
				bind:value={majorTurn}
				oninput={saveMajorTurn}
			></textarea>
		</div>

		<div class="planning-field">
			<label class="planning-field-label" for="ch-revelation">Key Revelation or Development</label>
			<p class="planning-field-hint">What is revealed, developed, or set in motion here?</p>
			<textarea
				id="ch-revelation"
				class="planning-field-textarea"
				rows="2"
				placeholder="The reader learns, discovers, or feels…"
				bind:value={revelation}
				oninput={saveRevelation}
			></textarea>
		</div>
	</StructuredSection>

	<!-- Notes section -->
	<div class="planning-divider"></div>
	<StructuredSection label="Notes">
		<div class="planning-field">
			<textarea
				id="ch-notes"
				class="planning-field-textarea"
				rows="3"
				placeholder="Reminders, considerations, open questions…"
				bind:value={notes}
				oninput={saveNotes}
			></textarea>
		</div>
	</StructuredSection>

	<!-- Arc tags -->
	<ArcTagHint arcRefs={chapter.arcRefs} />
</SurfacePanel>
