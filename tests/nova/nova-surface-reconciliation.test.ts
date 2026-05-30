import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const NOVA_ROUTE_PATH = resolve(process.cwd(), 'src/routes/nova/+page.svelte');
const MODULE_DOC_PATH = resolve(process.cwd(), 'dev-docs/04-modules/nova.md');
const CHAT_INTERFACE_PATH = resolve(process.cwd(), 'src/modules/ai/components/ChatInterface.svelte');

const novaRouteSource = readFileSync(NOVA_ROUTE_PATH, 'utf-8');
const moduleDocSource = readFileSync(MODULE_DOC_PATH, 'utf-8');
const chatInterfaceSource = readFileSync(CHAT_INTERFACE_PATH, 'utf-8');

describe('Nova canonical surface reconciliation', () => {
	it('documents embedded sidepanel as canonical and /nova as deferred legacy', () => {
		expect(moduleDocSource).toContain('embedded editor sidepanel');
		expect(moduleDocSource).toContain('canonical Nova runtime');
		expect(moduleDocSource).toContain('`/nova` remains a legacy fullscreen surface');
		expect(moduleDocSource).toContain('Ownership Guardrails');
	});

	it('keeps /nova explicitly marked as legacy while retaining ChatInterface backing', () => {
		expect(novaRouteSource).toContain("import ChatInterface from '$modules/ai/components/ChatInterface.svelte'");
		expect(novaRouteSource).toContain('data-testid="nova-route-notice"');
		expect(novaRouteSource).toContain('Legacy fullscreen route');
		expect(novaRouteSource).toContain('canonical Nova runtime');
		expect(novaRouteSource).toContain('<ChatInterface />');
	});

	it('does not silently alias /nova to sidepanel-only runtime modules', () => {
		expect(novaRouteSource).not.toContain("from '$modules/nova'");
		expect(novaRouteSource).not.toContain('NovaPanel');
	});

	it('chat interface remains interactive and mode-aware on the deferred route', () => {
		expect(chatInterfaceSource).toContain('buildNovaModePrompt(userPrompt, activeMode)');
		expect(chatInterfaceSource).toContain('<PromptInput');
		expect(chatInterfaceSource).toContain('<SuggestionChips');
	});
});
