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

	let quickIntentOpen = $state(false);

	const sceneProgressPct = $derived(
		Math.min(100, Math.round((activeWordCount / Math.max(1, sceneTargetWords)) * 100)),
	);

	function signalSeverity(signal: string): 'ok' | 'info' | 'warn' {
		if (signal.includes('steady') || signal.includes('momentum looks')) return 'ok';
		if (signal.includes('Dialogue-heavy')) return 'info';
		return 'warn';
	}
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
					{@const severity = signalSeverity(signal)}
					<li class="signal-item signal-item--{severity}">
						<span class="signal-dot" aria-hidden="true"></span>
						<span>{signal}</span>
					</li>
				{/each}
			</ul>
		</section>

		<div class="collapsible-section" class:collapsible-open={quickIntentOpen}>
			<button
				type="button"
				class="collapsible-trigger"
				onclick={() => (quickIntentOpen = !quickIntentOpen)}
				aria-expanded={quickIntentOpen}
			>
				<span>Quick Intent</span>
				<svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
			</button>
			{#if quickIntentOpen}
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
			{/if}
		</div>

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
			<div class="progress-bar-wrap" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={sceneProgressPct} aria-label="Scene word count progress">
				<div class="progress-bar-fill" style="width: {sceneProgressPct}%"></div>
			</div>
			<p class="progress-line">
				<span class="progress-words">{activeWordCount}</span>
				<span class="progress-sep">/</span>
				<span class="progress-target">{sceneTargetWords} words</span>
				<span class="progress-pacing">· {pacingHint}</span>
			</p>
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

	/* Signal list with severity dots */
	.signal-list {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: var(--space-1);
	}

	.signal-item {
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.signal-dot {
		flex-shrink: 0;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		margin-top: 1px;
		background: var(--color-text-muted);
	}

	.signal-item--ok .signal-dot {
		background: var(--color-teal, #4ecdc4);
	}

	.signal-item--ok {
		color: var(--color-text-secondary);
	}

	.signal-item--info .signal-dot {
		background: var(--color-nova-blue);
	}

	.signal-item--warn .signal-dot {
		background: hsl(38 90% 55%);
	}

	.signal-item--warn {
		color: var(--color-text-primary);
	}

	/* Styled collapsible for Quick Intent */
	.collapsible-section {
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--color-surface-overlay) 40%, transparent);
		overflow: hidden;
	}

	.collapsible-trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: var(--space-2);
		border: none;
		background: transparent;
		cursor: pointer;
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
		text-align: left;
	}

	.collapsible-trigger:hover {
		color: var(--color-text-secondary);
	}

	.collapsible-trigger:focus-visible {
		outline: 2px solid var(--color-nova-blue);
		outline-offset: -2px;
	}

	.chevron {
		transition: transform var(--duration-fast) var(--ease-standard);
		flex-shrink: 0;
	}

	.collapsible-open .chevron {
		transform: rotate(180deg);
	}

	.quick-intent-grid {
		display: grid;
		gap: var(--space-2);
		padding: var(--space-2);
		padding-top: 0;
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

	/* Progress bar */
	.progress-bar-wrap {
		height: 6px;
		background: var(--color-surface-overlay);
		border-radius: 999px;
		overflow: hidden;
	}

	.progress-bar-fill {
		height: 100%;
		border-radius: 999px;
		background: color-mix(in srgb, var(--color-nova-blue) 70%, white);
		transition: width var(--duration-base) var(--ease-standard);
	}

	.progress-line {
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 3px;
		font-size: var(--text-xs);
	}

	.progress-words {
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.progress-sep,
	.progress-target {
		color: var(--color-text-secondary);
	}

	.progress-pacing {
		color: var(--color-text-muted);
		font-size: 11px;
	}

	.flag-list {
		margin: var(--space-1) 0 0;
		padding-left: var(--space-4);
		display: grid;
		gap: 2px;
		font-size: var(--text-xs);
		color: hsl(38 90% 45%);
	}
</style>
