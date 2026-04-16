<script lang="ts">
	import type { Scene } from '$lib/db/types.js';
	import type { BeatFocus } from '../types.js';
	import BeatList from './BeatList.svelte';

	let {
		scene,
		onBeatSelect,
		onUpdate: _onUpdate,
	} = $props<{
		scene: Scene;
		onBeatSelect?: (focus: BeatFocus) => void;
		onUpdate?: (id: string, patch: Partial<Omit<Scene, 'id' | 'createdAt'>>) => void;
	}>();
</script>

<div class="planning-panel">
	<!-- Sequence context bar -->
	<div class="planning-context">
		<span class="planning-context-label">Sequence</span>
		<span class="planning-context-desc"
			>Break this scene into micro-beats — action, reaction, decision.</span
		>
	</div>
	<BeatList sceneId={scene.id} projectId={scene.projectId} onSelectBeat={onBeatSelect} />
</div>
