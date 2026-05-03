<script lang="ts">
	import type { Scene } from '$lib/db/domain-types';
	import type { BeatFocus } from '../types.js';
	import BeatList from './BeatList.svelte';
	import { SurfacePanel } from '$lib/components/ui/index.js';

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

<SurfacePanel class="planning-panel">
	<!-- Sequence context bar -->
	<div class="planning-context">
		<span class="planning-context-label">Sequence</span>
		<span class="planning-context-desc"
			>Break this scene into micro-beats — action, reaction, decision.</span
		>
	</div>
	<BeatList sceneId={scene.id} projectId={scene.projectId} onSelectBeat={onBeatSelect} />
</SurfacePanel>
