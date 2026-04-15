<script lang="ts">
        import type { Project } from '$lib/db/types.js';
        import BookCoverCard from './BookCoverCard.svelte';

        let { title, projects = [] } = $props<{ title: string; projects: Project[] }>();
</script>

<section class="collection-row" aria-label={title}>
        {#if title}
                <div class="row-header">
                        <h2 class="collection-title">{title}</h2>
                </div>
        {/if}

        <div class="collection-scroller">
                <ul class="collection-list">
                        {#each projects as project (project.id)}
                                <li class="collection-item">
                                        <BookCoverCard {project} />
                                </li>
                        {/each}
                </ul>
        </div>
</section>

<style>
        .collection-row {
                display: flex;
                flex-direction: column;
                gap: var(--space-4);
                margin-bottom: var(--space-8);
                width: 100%;
        }

        .row-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding-inline: var(--space-6);
        }

        .collection-title {
                color: var(--color-text-primary);
                font-family: var(--font-display);
                font-size: var(--text-xl);
                font-weight: var(--font-weight-normal);
                margin: 0;
                line-height: var(--leading-tight);
        }

        .collection-scroller {
                width: 100%;
                overflow-x: auto;
                scroll-snap-type: x mandatory;
                scrollbar-width: none; /* Firefox */
                -ms-overflow-style: none; /* IE/Edge */
                padding-bottom: var(--space-4); /* Allow room for hover shadow */
        }

        .collection-scroller::-webkit-scrollbar {
                display: none; /* Safari and Chrome */
        }

        .collection-list {
                display: flex;
                gap: var(--space-5);
                padding: 0;
                margin: 0;
                list-style: none;
                padding-inline: var(--space-6);
        }

        /* Spacer to allow scrolling past the last item slightly cleanly */
        .collection-list::after {
                content: '';
                flex: 0 0 var(--space-2);
        }

        .collection-item {
                scroll-snap-align: start;
                flex-shrink: 0;
                scroll-margin-left: var(--space-6);
        }
</style>
