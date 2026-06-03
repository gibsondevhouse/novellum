<script lang="ts">
	import type { ManuscriptProfileId } from '../types.js';
	import { MANUSCRIPT_PROFILES } from '../services/manuscript-profiles.js';

	let {
		value,
		disabled = false,
		onChange,
	}: {
		value: ManuscriptProfileId;
		disabled?: boolean;
		onChange: (value: ManuscriptProfileId) => void;
	} = $props();

	const profiles = $derived(Object.values(MANUSCRIPT_PROFILES));
</script>

<fieldset class="selector" {disabled}>
	<legend>Profile</legend>
	<div class="profile-grid" role="radiogroup" aria-label="Manuscript profile">
		{#each profiles as profile (profile.id)}
			<label class:profile-card--selected={value === profile.id} class="profile-card">
				<input
					type="radio"
					name="manuscript-profile"
					value={profile.id}
					checked={value === profile.id}
					onchange={() => onChange(profile.id)}
				/>
				<span class="profile-card__body">
					<span class="profile-card__title">{profile.label}</span>
					<span class="profile-card__description">{profile.description}</span>
					{#if value === profile.id}
						<span class="profile-card__selected">Selected</span>
					{/if}
				</span>
			</label>
		{/each}
	</div>
</fieldset>

<style>
	.selector {
		border: 0;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	legend {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		padding: 0;
	}

	.profile-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-3);
	}

	.profile-card {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
		padding: var(--space-3);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		background: var(--color-surface-raised);
		cursor: pointer;
		min-height: 7rem;
	}

	.profile-card--selected {
		border-color: var(--color-border-strong);
		background: var(--color-surface-overlay);
	}

	input {
		margin-top: var(--space-1);
	}

	.profile-card__body {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.profile-card__title {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.profile-card__description {
		font-size: var(--text-xs);
		line-height: var(--leading-relaxed);
		color: var(--color-text-secondary);
	}

	.profile-card__selected {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	@media (max-width: 720px) {
		.profile-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
