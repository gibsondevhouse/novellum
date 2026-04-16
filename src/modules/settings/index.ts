// Services
export {
	getStoredTheme,
	storeTheme,
	applyTheme,
} from './services/themeService.js';
export type { Theme } from './services/themeService.js';

export {
	createWritingStyle,
	getWritingStyleById,
	getWritingStylesByProjectId,
	updateWritingStyle,
	removeWritingStyle,
} from './services/writing-style-repository.js';

export {
	createTemplate,
	getTemplateById,
	getTemplatesByProjectId,
	updateTemplate,
	removeTemplate,
} from './services/template-repository.js';

export {
	createSystemPrompt,
	getSystemPromptById,
	getSystemPromptsByProjectId,
	updateSystemPrompt,
	removeSystemPrompt,
} from './services/system-prompt-repository.js';

export {
	createChatInstruction,
	getChatInstructionById,
	getChatInstructionsByProjectId,
	updateChatInstruction,
	removeChatInstruction,
} from './services/chat-instruction-repository.js';

// Components
export { default as ApiSettings } from './components/ApiSettings.svelte';
export { default as ThemeSelector } from './components/ThemeSelector.svelte';
