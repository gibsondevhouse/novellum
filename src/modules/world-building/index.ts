export * from './types.js';
export * from './constants.js';

// Store — UI state
export * from './stores/world-building-store.svelte.ts';

// Store — CRUD actions
export * from './stores/world-building-crud.svelte.ts';

// Store — generation draft state machine
export {
	startGeneration,
	abortGeneration,
	toggleDraftSelect,
	resetGeneration,
	getPhase as getGenerationPhase,
	isGenerating,
	isReviewing,
	isIdle as isGenerationIdle,
} from './stores/generation-draft.svelte.ts';

// Service — entity generation
export type { EntityKind, GenerationResult } from './services/worldbuilding-generation-service.js';

// Components
export { default as CharacterCard } from './components/CharacterCard.svelte';
export { default as CharacterForm } from './components/CharacterForm.svelte';
export { default as RelationshipEditor } from './components/RelationshipEditor.svelte';
export { default as LocationForm } from './components/LocationForm.svelte';
export { default as LoreEntryForm } from './components/LoreEntryForm.svelte';
export { default as PlotThreadForm } from './components/PlotThreadForm.svelte';
export { default as TimelineEventForm } from './components/TimelineEventForm.svelte';
export { default as GenerateButton } from './components/GenerateButton.svelte';
export { default as GeneratedEntityModal } from './components/GeneratedEntityModal.svelte';

// Help components
export { default as WorldbuildingHelpPanel } from './help/WorldbuildingHelpPanel.svelte';
export { default as WorldbuildingHelpDrawer } from './help/WorldbuildingHelpDrawer.svelte';
export type { WorldbuildingHelpSection, WorldbuildingHelpGlossaryEntry } from './help/worldbuilding-help-content.js';

// Domain tile components
export { default as WorldbuildingReadinessBadge } from './components/WorldbuildingReadinessBadge.svelte';

// Workflow config
export type { WorldbuildingDomainId, WorldbuildingDomainConfig } from './worldbuilding-workflow.js';
export { WORLDBUILDING_DOMAIN_SEQUENCE, getWorldbuildingDomainConfig } from './worldbuilding-workflow.js';

// Readiness checks
export type { WorldbuildingReadinessResult, WorldbuildingReadinessState } from './worldbuilding-readiness.js';
export { checkDomainReadiness } from './worldbuilding-readiness.js';

// Generate actions
export type { GenerateGuardContext, GenerateGuardResult } from './worldbuilding-generate-actions.js';
export {
	canGenerateDomain,
	generatePersonaeWithNova,
	generateAtlasWithNova,
	generateArchiveWithNova,
	generateThreadsWithNova,
	generateChroniclesWithNova,
	generateDomainWithNova,
} from './worldbuilding-generate-actions.js';

// Generation state machine
export type { WorldbuildingGenerationStateValue } from './stores/worldbuilding-generation-state.svelte.js';
export {
	getState as getGenerationState,
	transition as transitionGenerationState,
	resetState as resetGenerationState,
	getMissingContextReason,
	evaluateReadiness,
} from './stores/worldbuilding-generation-state.svelte.js';

// Stage-003 components
export { default as WorldbuildingProposalCard } from './components/WorldbuildingProposalCard.svelte';
export { default as WorldbuildingGenerationStatus } from './components/WorldbuildingGenerationStatus.svelte';
