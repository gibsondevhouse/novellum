import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockSetPreference = vi.fn();

vi.mock('$lib/preferences.js', () => ({
	getPreference: vi.fn(),
	setPreference: (...args: unknown[]) => mockSetPreference(...args),
}));

beforeEach(() => {
	mockSetPreference.mockReset();
	vi.resetModules();
});

async function loadStore() {
	return await import('../../src/lib/stores/onboarding.svelte.js');
}

describe('OnboardingStore', () => {
	it('starts with completed=false and currentStep=0 before any action', async () => {
		const { onboarding } = await loadStore();
		expect(onboarding.completed).toBe(false);
		expect(onboarding.currentStep).toBe(0);
	});

	it('next() increments currentStep', async () => {
		const { onboarding } = await loadStore();
		onboarding.next();
		expect(onboarding.currentStep).toBe(1);
	});

	it('next() does not exceed the last step index', async () => {
		const { onboarding, ONBOARDING_STEPS } = await loadStore();
		const last = ONBOARDING_STEPS.length - 1;
		for (let i = 0; i < last + 5; i++) onboarding.next();
		expect(onboarding.currentStep).toBe(last);
	});

	it('prev() decrements currentStep', async () => {
		const { onboarding } = await loadStore();
		onboarding.next();
		onboarding.prev();
		expect(onboarding.currentStep).toBe(0);
	});

	it('prev() does not go below 0', async () => {
		const { onboarding } = await loadStore();
		onboarding.prev();
		onboarding.prev();
		expect(onboarding.currentStep).toBe(0);
	});

	it('skipToEnd() sets currentStep to the last index', async () => {
		const { onboarding, ONBOARDING_STEPS } = await loadStore();
		onboarding.skipToEnd();
		expect(onboarding.currentStep).toBe(ONBOARDING_STEPS.length - 1);
	});

	it('complete() calls setPreference with app.onboarding.completed=true', async () => {
		mockSetPreference.mockResolvedValue(undefined);
		const { onboarding } = await loadStore();
		await onboarding.complete();
		expect(mockSetPreference).toHaveBeenCalledWith('app.onboarding.completed', true);
	});

	it('complete() sets completed=true on the store', async () => {
		mockSetPreference.mockResolvedValue(undefined);
		const { onboarding } = await loadStore();
		expect(onboarding.completed).toBe(false);
		await onboarding.complete();
		expect(onboarding.completed).toBe(true);
	});

	it('stepId returns the correct step name for the current index', async () => {
		const { onboarding, ONBOARDING_STEPS } = await loadStore();
		for (let i = 0; i < ONBOARDING_STEPS.length; i++) {
			onboarding.currentStep = i;
			expect(onboarding.stepId).toBe(ONBOARDING_STEPS[i]);
		}
	});

	it('isFirst is true only when currentStep === 0', async () => {
		const { onboarding } = await loadStore();
		expect(onboarding.isFirst).toBe(true);
		onboarding.next();
		expect(onboarding.isFirst).toBe(false);
	});

	it('isLast is true only when currentStep is the last index', async () => {
		const { onboarding, ONBOARDING_STEPS } = await loadStore();
		expect(onboarding.isLast).toBe(false);
		onboarding.currentStep = ONBOARDING_STEPS.length - 1;
		expect(onboarding.isLast).toBe(true);
	});
});
