<script lang="ts">
        import type { Project } from '$lib/db/types.js';
        import { openReader } from '../stores/project-hub.svelte.js';

        let { project } = $props<{ project: Project }>();

        function formatStatus(status: string) {
                if (!status) return 'Planning';
                const s = status.toLowerCase();
                if (s === 'drafting') return 'Drafting';
                if (s === 'planning') return 'Planning';
                if (s === 'revising') return 'Revising';
                if (s === 'completed') return 'Completed';
                if (s === 'archived') return 'Archived';
                return status.charAt(0).toUpperCase() + status.slice(1);
        }

        function getStatusClass(status: string) {
                if (!status) return 'status-default';
                const s = status.toLowerCase();
                if (s === 'completed') return 'status-completed';
                if (s === 'drafting') return 'status-drafting';
                return 'status-default';
        }
</script>

<article class="book-cover-card">
        <button
                class="cover-button"
                onclick={() => openReader(project)}
                aria-label="Open project {project.title || 'Untitled'}"
        >
                <div class="cover-image" aria-hidden="true">
                        {#if project.coverUrl}
                                <img src={project.coverUrl} alt="" class="cover-img" />
                        {:else}
                                <div class="cover-placeholder">
                                        <h3 class="placeholder-title">{project.title || 'Untitled'}</h3>
                                </div>
                        {/if}

                        <div class="cover-overlay">
                                <span class={`status-badge ${getStatusClass(project.status)}`}>
                                        {formatStatus(project.status)}
                                </span>
                        </div>
                </div>

                <div class="card-footer">
                        <h3 class="book-title">{project.title || 'Untitled'}</h3>
                        {#if project.lastOpenedAt}
                                <p class="book-meta">
                                        Last opened {new Date(project.lastOpenedAt).toLocaleDateString(undefined, {
                                                month: 'short',
                                                day: 'numeric',
                                        })}
                                </p>
                        {:else}
                                <p class="book-meta">Never opened</p>
                        {/if}
                </div>
        </button>
</article>

<style>
        .book-cover-card {
                width: 160px; /* Base width */
                flex-shrink: 0;
        }

        .cover-button {
                display: flex;
                flex-direction: column;
                background: transparent;
                border: none;
                padding: 0;
                margin: 0;
                text-align: left;
                cursor: pointer;
                width: 100%;
                border-radius: var(--radius-md);
                transition: transform var(--duration-fast) var(--ease-standard);
                position: relative;
        }

        .cover-button:focus-visible {
                outline: none;
        }

        .cover-button:focus-visible .cover-image {
                box-shadow: var(--focus-ring-offset);
                border-color: var(--color-border-focus);
        }

        .cover-button:hover {
                transform: translateY(-4px);
        }

        .cover-image {
                width: 100%;
                aspect-ratio: 2 / 3;
                border-radius: var(--radius-md);
                overflow: hidden;
                position: relative;
                border: 1px solid var(--color-border-default);
                background-color: var(--color-surface-overlay);
                box-shadow: var(--shadow-sm);
                transition:
                        box-shadow var(--duration-fast) var(--ease-standard),
                        border-color var(--duration-fast) var(--ease-standard),
                        transform var(--duration-fast) var(--ease-standard);
        }

        .cover-button:hover .cover-image {
                box-shadow: var(--shadow-md);
                border-color: var(--color-border-strong);
        }

        .cover-button:active .cover-image {
                transform: scale(0.98);
                box-shadow: var(--shadow-xs);
        }

        .cover-img {
                width: 100%;
                height: 100%;
                object-fit: cover;
        }

        .cover-placeholder {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, var(--color-surface-elevated) 0%, var(--color-surface-base) 100%);
                padding: var(--space-4);
        }

        .placeholder-title {
                font-family: var(--font-display);
                font-size: var(--text-lg);
                color: var(--color-text-primary);
                text-align: center;
                opacity: 0.6;
                margin: 0;
                display: -webkit-box;
                -webkit-line-clamp: 4;
                line-clamp: 4;
                -webkit-box-orient: vertical;
                overflow: hidden;
        }

        .cover-overlay {
                position: absolute;
                top: var(--space-2);
                right: var(--space-2);
                display: flex;
                gap: var(--space-1);
                pointer-events: none;
        }

        .status-badge {
                font-family: var(--font-sans);
                font-size: var(--text-xs);
                font-weight: var(--font-weight-medium);
                padding: 2px var(--space-2);
                border-radius: var(--radius-full);
                background-color: var(--color-surface-glass);
                backdrop-filter: blur(4px);
                -webkit-backdrop-filter: blur(4px);
                border: 1px solid var(--color-border-default);
                color: var(--color-text-primary);
                box-shadow: var(--shadow-xs);
        }

        .status-completed {
                background-color: var(--color-success-subtle);
                color: var(--color-success-on-dark);
                border-color: color-mix(in srgb, var(--color-success) 30%, transparent);
        }

        .status-drafting {
                background-color: color-mix(in srgb, var(--color-teal) 15%, transparent);
                color: var(--color-teal);
                border-color: color-mix(in srgb, var(--color-teal) 30%, transparent);
        }

        .card-footer {
                margin-top: var(--space-3);
                padding-inline: var(--space-1);
                display: flex;
                flex-direction: column;
                gap: var(--space-1);
        }

        .book-title {
                font-family: var(--font-display);
                font-size: var(--text-base);
                font-weight: var(--font-weight-normal);
                color: var(--color-text-primary);
                margin: 0;
                line-height: var(--leading-tight);
                display: -webkit-box;
                -webkit-line-clamp: 2;
                line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: ellipsis;
        }

        .book-meta {
                font-family: var(--font-sans);
                font-size: var(--text-xs);
                color: var(--color-text-muted);
                margin: 0;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
        }
</style>
