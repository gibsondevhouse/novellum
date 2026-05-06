<script lang="ts">
	import type { Character, Scene } from '$lib/db/domain-types';

	type OutcomeType = 'win' | 'loss' | 'partial' | 'reversal' | '';

	interface CompassRow {
		label: string;
		value: string;
		missing: boolean;
	}

	interface QuickIntent {
		goal: string;
		obstacle: string;
		outcome: OutcomeType;
	}

	interface Props {
		sceneCompassRows: CompassRow[];
		liveSignals: string[];
		progressFlags: string[];
		quickIntent: QuickIntent;
		locationTag: string;
		characters: Character[];
		activeScene: Scene | null;
		activeWordCount: number;
		sceneTargetWords: number;
		pacingHint: string;
		storyCompassCollapsed: boolean;
		onCollapsedChange: (val: boolean) => void;
		onQuickIntentChange: (qi: QuickIntent) => void;
		onPersistQuickIntent: () => void;
		onToggleParticipant: (characterId: string) => void;
		onPersistLocationTag: () => void;
		onLocationTagChange: (val: string) => void;
	}

	let {
		sceneCompassRows,
		liveSignals,
		progressFlags,
		quickIntent,
		locationTag,
		characters,
		activeScene,
		activeWordCount,
		sceneTargetWords,
		pacingHint,
		storyCompassCollapsed,
		onCollapsedChange,
		onQuickIntentChange,
		onPersistQuickIntent,
		onToggleParticipant,
		onPersistLocationTag,
		onLocationTagChange,
	}: Props = $props();
</script>

<aside class="story-compass" aria-label="Story compass">
	<div class="compass-header">
		<h2>Story Compass</h2>
		<button
			type="button"
			class="collapse-btn"
			onclick={() => onCollapsedChange(!storyCompassCollapsed)}
			aria-expanded={!storyCompassCollapsed}
		>
			{storyCompassCollapsed ? 'Expand' : 'Collapse'}
		</button>
	</div>
	{#if !storyCompassCollapsed}
		<section class="panel-section" aria-label="Scene compass definition">
			<h3>Scene Compass</h3>
			<ul class="compass-list">
				{#each sceneCompassRows as row (row.label)}
					<li>
						<span>{row.label}</span>
						<strong class:soft={row.missing}>{row.value}</strong>
					</li>
				{/each}
			</ul>
		</section>

		<section class="panel-section" aria-label="Live writing signals">
			<h3>Live Writing Signals</h3>
			<ul class="signal-list">
				{#each liveSignals as signal (signal)}
					<li>{signal}</li>
				{/each}
			</ul>
		</section>

		<details class="quick-intent" aria-label="Quick intent" ontoggle={onPersistQuickIntent}>
			<summary>Quick Intent</summary>
			<div class="quick-intent-grid">
				<label>
					<span>Goal</span>
					<input
						value={quickIntent.goal}
						oninput={(e) =>
							onQuickIntentChange({
								...quickIntent,
								goal: (e.target as HTMLInputElement).value,
							})}
						onblur={onPersistQuickIntent}
					/>
				</label>
				<label>
					<span>Obstacle</span>
					<input
						value={quickIntent.obstacle}
						oninput={(e) =>
							onQuickIntentChange({
								...quickIntent,
								obstacle: (e.target as HTMLInputElement).value,
							})}
						onblur={onPersistQuickIntent}
					/>
				</label>
				<label>
					<span>Outcome</span>
					<select
						value={quickIntent.outcome}
						onchange={(e) =>
							onQuickIntentChange({
								...quickIntent,
								outcome: (e.target as HTMLSelectElement).value as OutcomeType,
							})}
						onblur={onPersistQuickIntent}
					>
						<option value="">Unspecified</option>
						<option value="win">Win</option>
						<option value="loss">Loss</option>
						<option value="partial">Partial</option>
						<option value="reversal">Reversal</option>
					</select>
				</label>
			</div>
		</details>

		<section class="panel-section" aria-label="Participants and context">
			<h3>Participants + Context</h3>
			<div class="participants-line">
				{#each characters as character (character.id)}
					<button
						type="button"
						class="participant-chip"
						class:active={activeScene?.characterIds?.includes(character.id)}
						onclick={() => onToggleParticipant(character.id)}
					>
						{character.name}
					</button>
				{/each}
			</div>
			<label>
				<span>Location</span>
				<input
					value={locationTag}
					oninput={(e) => onLocationTagChange((e.target as HTMLInputElement).value)}
					onblur={onPersistLocationTag}
					placeholder="Location tag"
				/>
			</label>
		</section>

		<section class="panel-section" aria-label="Progress indicators">
			<h3>Progress</h3>
			<p class="progress-line">{activeWordCount} / {sceneTargetWords} words</p>
			<p class="progress-line">Pacing hint: {pacingHint}</p>
			{#if progressFlags.length > 0}
				<ul class="flag-list">
					{#each progressFlags as flag (flag)}
						<li>{flag}</li>
					{/each}
				</ul>
			{/if}
		</section>
	{/if}
</aside>

<style>
	.story-compass {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		overflow-y: auto;
		padding: var(--space-3);
		border-left: 1px solid var(--color-border-subtle);
		background: var(--color-surface-ground);
		min-width: 0;
	}

	.compass-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.compass-header h2 {
		font-size: var(--text-sm);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
		margin: 0;
	}

	.collapse-btn {
		border: 1px solid var(--color-border-default);
		background: color-mix(in srgb, var(--color-surface-overlay) 78%, transparent);
		border-radius: var(--radius-sm);
		padding: var(--space-1) var(--space-2);
		font-size: var(--text-xs);
		cursor: pointer;
	}

	.panel-section {
		display: grid;
		gap: var(--space-2);
		padding: var(--space-2);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--color-surface-overlay) 40%, transparent);
	}

	.panel-section h3 {
		margin: 0;
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
	}

	.compass-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-1);
	}

	.compass-list li {
		display: grid;
		gap: 2px;
	}

	.compass-list span {
		font-size: 11px;
		color: var(--color-text-muted);
	}

	.compass-list strong {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
	}

	.compass-list strong.soft {
		color: var(--color-text-muted);
		font-style: italic;
	}

	.signal-list,
	.flag-list {
		margin: 0;
		padding-left: var(--space-4);
		display: grid;
		gap: 2px;
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.quick-intent {
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		padding: var(--space-2);
		background: color-mix(in srgb, var(--color-surface-overlay) 40%, transparent);
	}

	.quick-intent summary {
		cursor: pointer;
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
	}

	.quick-intent-grid {
		display: grid;
		gap: var(--space-2);
		margin-top: var(--space-2);
	}

	label {
		display: grid;
		gap: 4px;
	}

	label span {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	input,
	select {
		width: 100%;
		background: var(--color-surface-base);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		padding: var(--space-1) var(--space-2);
		font-size: var(--text-sm);
		color: var(--color-text-primary);
	}

	.participants-line {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
	}

	.participant-chip {
		border: 1px solid var(--color-border-default);
		background: transparent;
		color: var(--color-text-secondary);
		border-radius: 999px;
		padding: 3px 8px;
		font-size: 11px;
		cursor: pointer;
	}

	.participant-chip.active {
		background: color-mix(in srgb, var(--color-teal) 12%, transparent);
		color: var(--color-teal);
		border-color: color-mix(in srgb, var(--color-teal) 30%, transparent);
	}

	.progress-line {
		margin: 0;
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.flag-list {
		margin-top: var(--space-1);
	}
</style>
