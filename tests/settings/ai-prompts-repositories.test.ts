import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiGet, apiPost, apiPut, apiDel, ApiError } from '$lib/api-client.js';

import {
	createWritingStyle,
	getWritingStyleById,
	getWritingStylesByProjectId,
	updateWritingStyle,
	removeWritingStyle,
} from '../../src/modules/settings/services/writing-style-repository.js';

import {
	createTemplate,
	getTemplateById,
	getTemplatesByProjectId,
	updateTemplate,
	removeTemplate,
} from '../../src/modules/settings/services/template-repository.js';

import {
	createSystemPrompt,
	getSystemPromptById,
	getSystemPromptsByProjectId,
	updateSystemPrompt,
	removeSystemPrompt,
} from '../../src/modules/settings/services/system-prompt-repository.js';

import {
	createChatInstruction,
	getChatInstructionById,
	getChatInstructionsByProjectId,
	updateChatInstruction,
	removeChatInstruction,
} from '../../src/modules/settings/services/chat-instruction-repository.js';

// Mock the API client
vi.mock('$lib/api-client.js', () => {
	return {
		apiGet: vi.fn(),
		apiPost: vi.fn(),
		apiPut: vi.fn(),
		apiDel: vi.fn(),
		ApiError: class ApiError extends Error {
			status: number;
			constructor(status: number) {
				super('ApiError');
				this.status = status;
			}
		},
	};
});

describe('AI Data Repositories', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// WritingStyles
	describe('WritingStyleRepository', () => {
		it('should create a writing style', async () => {
			const mockStyle = { projectId: 'p1', title: 'Test', description: '', exampleText: '' };
			vi.mocked(apiPost).mockResolvedValue({ id: 'w1', ...mockStyle });
			const result = await createWritingStyle(mockStyle);
			expect(apiPost).toHaveBeenCalledWith('/api/db/writing_styles', mockStyle);
			expect(result.id).toBe('w1');
		});

		it('should get a writing style by id', async () => {
			const mockStyle = { id: 'w1' };
			vi.mocked(apiGet).mockResolvedValue(mockStyle);
			const result = await getWritingStyleById('w1');
			expect(apiGet).toHaveBeenCalledWith('/api/db/writing_styles/w1');
			expect(result).toEqual(mockStyle);
		});

		it('should handle 404 when getting by id', async () => {
			vi.mocked(apiGet).mockRejectedValue(new ApiError(404));
			const result = await getWritingStyleById('w1');
			expect(result).toBeUndefined();
		});

		it('should rethrow non-404 errors', async () => {
			vi.mocked(apiGet).mockRejectedValue(new Error('Network error'));
			await expect(getWritingStyleById('w1')).rejects.toThrow('Network error');
		});

		it('should get by project id', async () => {
			vi.mocked(apiGet).mockResolvedValue([{ id: 'w1' }]);
			const result = await getWritingStylesByProjectId('p1');
			expect(apiGet).toHaveBeenCalledWith('/api/db/writing_styles', { projectId: 'p1' });
			expect(result.length).toBe(1);
		});

		it('should update', async () => {
			vi.mocked(apiPut).mockResolvedValue(undefined);
			await updateWritingStyle('w1', { title: 'New' });
			expect(apiPut).toHaveBeenCalledWith('/api/db/writing_styles/w1', { title: 'New' });
		});

		it('should remove', async () => {
			vi.mocked(apiDel).mockResolvedValue(undefined);
			await removeWritingStyle('w1');
			expect(apiDel).toHaveBeenCalledWith('/api/db/writing_styles/w1');
		});
	});

	// Templates
	describe('TemplateRepository', () => {
		it('should create a template', async () => {
			const mock = { projectId: 'p1', name: 'Test', description: '', content: '', type: '' };
			vi.mocked(apiPost).mockResolvedValue({ id: 't1', ...mock });
			await createTemplate(mock);
			expect(apiPost).toHaveBeenCalledWith('/api/db/templates', mock);
		});

		it('should get by project id', async () => {
			vi.mocked(apiGet).mockResolvedValue([{ id: 't1' }]);
			await getTemplatesByProjectId('p1');
			expect(apiGet).toHaveBeenCalledWith('/api/db/templates', { projectId: 'p1' });
		});
		
		it('should handle get by id and 404', async () => {
			vi.mocked(apiGet).mockRejectedValue(new ApiError(404));
			const result = await getTemplateById('t1');
			expect(result).toBeUndefined();
		});
		
		it('should update', async () => {
			await updateTemplate('t1', { name: 'New' });
			expect(apiPut).toHaveBeenCalledWith('/api/db/templates/t1', { name: 'New' });
		});
		
		it('should remove', async () => {
			await removeTemplate('w1');
			expect(apiDel).toHaveBeenCalledWith('/api/db/templates/w1');
		});
	});

	// System Prompts
	describe('SystemPromptRepository', () => {
		it('should create', async () => {
			const mock = { projectId: 'p1', name: 'Test', content: '', isDefault: 0 };
			vi.mocked(apiPost).mockResolvedValue({ id: 's1', ...mock });
			await createSystemPrompt(mock);
			expect(apiPost).toHaveBeenCalledWith('/api/db/system_prompts', mock);
		});

		it('should get by project id', async () => {
			vi.mocked(apiGet).mockResolvedValue([{ id: 's1' }]);
			await getSystemPromptsByProjectId('p1');
			expect(apiGet).toHaveBeenCalledWith('/api/db/system_prompts', { projectId: 'p1' });
		});
		
		it('should handle get by id and 404', async () => {
			vi.mocked(apiGet).mockRejectedValue(new ApiError(404));
			const result = await getSystemPromptById('t1');
			expect(result).toBeUndefined();
		});
		
		it('should update', async () => {
			await updateSystemPrompt('t1', { name: 'New' });
			expect(apiPut).toHaveBeenCalledWith('/api/db/system_prompts/t1', { name: 'New' });
		});
		
		it('should remove', async () => {
			await removeSystemPrompt('w1');
			expect(apiDel).toHaveBeenCalledWith('/api/db/system_prompts/w1');
		});
	});

	// ChatInstructions
	describe('ChatInstructionRepository', () => {
		it('should create', async () => {
			const mock = { projectId: 'p1', name: 'Test', content: '', isDefault: 0 };
			vi.mocked(apiPost).mockResolvedValue({ id: 'c1', ...mock });
			await createChatInstruction(mock);
			expect(apiPost).toHaveBeenCalledWith('/api/db/chat_instructions', mock);
		});

		it('should get by project id', async () => {
			vi.mocked(apiGet).mockResolvedValue([{ id: 'c1' }]);
			await getChatInstructionsByProjectId('p1');
			expect(apiGet).toHaveBeenCalledWith('/api/db/chat_instructions', { projectId: 'p1' });
		});
		
		it('should handle get by id and 404', async () => {
			vi.mocked(apiGet).mockRejectedValue(new ApiError(404));
			const result = await getChatInstructionById('t1');
			expect(result).toBeUndefined();
		});
		
		it('should update', async () => {
			await updateChatInstruction('t1', { name: 'New' });
			expect(apiPut).toHaveBeenCalledWith('/api/db/chat_instructions/t1', { name: 'New' });
		});
		
		it('should remove', async () => {
			await removeChatInstruction('w1');
			expect(apiDel).toHaveBeenCalledWith('/api/db/chat_instructions/w1');
		});		
	});
});
