<script lang="ts">
        import type { WorkspaceMode } from '../types.js';
        import type { ArcType } from '$lib/db/types.js';
        import WorkspaceHeroShell from './WorkspaceHeroShell.svelte';
        import WorkspaceHeroCard from './WorkspaceHeroCard.svelte';
        import EmptyDetailCard from './EmptyDetailCard.svelte';

        let {
                open,
                onClose,
                activeMode,
                items,
                activeIndex,
                onNavigate,
                onCreate,
                focusedArcType = null,
                onArcTypeFocus,
        }: {
                open: boolean;
                onClose: () => void;
                activeMode: WorkspaceMode;
                items: { id: string; title: string }[];
                activeIndex: number;
                onNavigate: (index: number) => void;
                onCreate: () => void;
                focusedArcType?: ArcType | null;
                onArcTypeFocus: (t: ArcType | null) => void;
        } = $props();

        function handleKeydown(event: KeyboardEvent) {
                if (event.key === 'Escape' && open) {
                        onClose();
                }
        }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
        <div class="help-backdrop" aria-hidden="true" onclick={onClose}>
                <div class="help-dialog" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
                        <button class="help-close" aria-label="Close help" onclick={onClose}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                        </button>

                        <div class="help-content">
                                <WorkspaceHeroShell
                                        {activeMode}
                                        {items}
                                        {activeIndex}
                                        {onNavigate}
                                        {onCreate}
                                        {focusedArcType}
                                        {onArcTypeFocus}
                                >
                                        <WorkspaceHeroCard mode={activeMode} {focusedArcType} />
                                        {#if activeIndex === -1}
                                                <div style="margin-top: 1rem;">
                                                        <EmptyDetailCard mode={activeMode} {focusedArcType} />
                                                </div>
                                        {/if}
                                </WorkspaceHeroShell>
                        </div>
                </div>
        </div>
{/if}

<style>
        .help-backdrop {
                position: fixed;
                inset: 0;
                z-index: 100;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(4px);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: var(--space-6);
                animation: fade-in var(--duration-fast) var(--ease-standard);
        }

        .help-dialog {
                position: relative;
                max-width: 1200px;
                width: 100%;
                /* Remove nested bg since HeroShell has its own */
                animation: slide-up var(--duration-enter) var(--ease-decelerate);
                display: flex;
                flex-direction: column;
        }

        .help-content {
                width: 100%;
        }

        .help-close {
                position: absolute;
                top: 0;
                right: calc(var(--space-12) * -1);
                background: var(--color-surface-glass);
                border: 1px solid var(--color-border-subtle);
                color: var(--color-text-secondary);
                cursor: pointer;
                padding: var(--space-2);
                border-radius: var(--radius-md);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: var(--transition-color);
                box-shadow: var(--shadow-sm);
        }

        .help-close:hover {
                color: var(--color-text-primary);
                background: var(--color-surface-raised);
                border-color: var(--color-border-strong);
        }

        @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
        }

        @keyframes slide-up {
                from { opacity: 0; transform: translateY(16px); scale: 0.98; }
                to { opacity: 1; transform: translateY(0); scale: 1; }
        }
</style>
