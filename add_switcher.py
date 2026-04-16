import sys

with open('src/lib/components/AppHeader.svelte', 'r') as f:
    content = f.read()

# 1. Imports
imports_to_add = """	import { getActiveMode, setMode } from '../../modules/workspace/stores/workspace-mode.svelte.js';
	import { WORKSPACE_MODES } from '../../modules/workspace/types.js';

	let isWorkspaceRoute = $derived(page.url.pathname.includes('/workspace'));"""

if 'import ModelSelector' in content:
    content = content.replace("import ModelSelector from './ModelSelector.svelte';", "import ModelSelector from './ModelSelector.svelte';\n" + imports_to_add)

# 2. HTML
html_to_add = """	<div class="header-center">
		{#if isWorkspaceRoute}
			<div class="workspace-switcher">
				{#each WORKSPACE_MODES as m}
					<button
						class="workspace-switcher-btn"
						class:active={getActiveMode() === m}
						onclick={() => setMode(m)}
					>
						{m.toUpperCase()}
					</button>
				{/each}
			</div>
		{/if}
	</div>"""

if '<div class="header-right">' in content:
    content = content.replace('<div class="header-right">', html_to_add + '\n\n\t<div class="header-right">')

# 3. CSS
css_to_add = """
	.header-center {
		display: flex;
		flex: 1;
		justify-content: center;
		align-items: center;
	}

	.workspace-switcher {
		display: flex;
		background: var(--color-surface-elevated);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-full);
		padding: 2px;
		gap: 2px;
	}

	.workspace-switcher-btn {
		background: transparent;
		border: none;
		padding: var(--space-1) var(--space-4);
		border-radius: var(--radius-full);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-standard);
		letter-spacing: var(--tracking-wide);
	}

	.workspace-switcher-btn:hover {
		color: var(--color-text-primary);
	}

	.workspace-switcher-btn.active {
		background: var(--color-surface-hover);
		color: var(--color-text-primary);
		box-shadow: var(--shadow-sm);
	}
"""

if '</style>' in content:
    content = content.replace('</style>', css_to_add + '\n</style>')

with open('src/lib/components/AppHeader.svelte', 'w') as f:
    f.write(content)

print("Switcher injected successfully.")
