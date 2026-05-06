/**
 * plan-018 stage-006 phase-001 — Onboarding store.
 *
 * Tracks current step (ephemeral) and completion (persisted to SQLite
 * via setPreference on final step). `completed` is initialised false
 * and updated when phase-004 writes the preference.
 */
import { setPreference } from '$lib/preferences.js';

export const ONBOARDING_STEPS = [
	'welcome',
	'local-first',
	'storage',
	'backup',
	'ai-key',
	'create-project',
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export class OnboardingStore {
	currentStep = $state<number>(0);
	completed = $state<boolean>(false);

	get stepId(): OnboardingStep {
		return ONBOARDING_STEPS[this.currentStep];
	}
	get isFirst(): boolean {
		return this.currentStep === 0;
	}
	get isLast(): boolean {
		return this.currentStep === ONBOARDING_STEPS.length - 1;
	}

	next(): void {
		if (!this.isLast) this.currentStep += 1;
	}
	prev(): void {
		if (!this.isFirst) this.currentStep -= 1;
	}
	skipToEnd(): void {
		this.currentStep = ONBOARDING_STEPS.length - 1;
	}

	async complete(): Promise<void> {
		await setPreference('app.onboarding.completed', true);
		this.completed = true;
	}
}

export const onboarding = new OnboardingStore();
