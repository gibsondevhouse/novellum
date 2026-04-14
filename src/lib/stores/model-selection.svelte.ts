const STORAGE_KEY = 'novellum_selected_model';

export interface ModelOption {
	id: string;
	label: string;
	provider: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
	{ id: 'google/gemini-3.1-flash-lite-preview', label: 'Gemini 3.1 Flash', provider: 'Google' },
];

const DEFAULT_MODEL = AVAILABLE_MODELS[0].id;

function loadModel(): string {
	if (typeof window === 'undefined') return DEFAULT_MODEL;
	return localStorage.getItem(STORAGE_KEY) || DEFAULT_MODEL;
}

let selectedModelId = $state(loadModel());

export function getSelectedModel(): string {
	return selectedModelId;
}

export function getSelectedModelOption(): ModelOption {
	return AVAILABLE_MODELS.find((m) => m.id === selectedModelId) ?? AVAILABLE_MODELS[0];
}

export function setSelectedModel(modelId: string): void {
	const valid = AVAILABLE_MODELS.some((m) => m.id === modelId);
	if (!valid) return;
	selectedModelId = modelId;
	if (typeof window !== 'undefined') {
		localStorage.setItem(STORAGE_KEY, modelId);
	}
}
