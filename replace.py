import sys

with open('src/routes/projects/[id]/workspace/+page.svelte', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
second = False
found_end = False

for line in lines:
    if line.strip() == '.workspace-board-view {' and not skip:
        skip = True
        new_lines.append('''        /* ── Board View (Arcs) ── */
        :global(.mode-content:has(.workspace-board-view)) {
                /* We want the mode-content to fill available space without max-width restrictions */
                padding: 0 !important;
                display: flex;
                flex-direction: column;
                height: 100%;
        }

        .workspace-board-view {
                display: flex;
                flex-direction: column;
                height: 100%;
                flex: 1;
                /* Use full width, discard project-frame bounds */
                width: 100vw;
                position: relative;
                left: calc(-50vw + 50%);
                background: var(--color-surface-base);
        }

        .board-header-row {
                flex-shrink: 0;
                padding: var(--space-4) var(--space-8);
                border-bottom: 1px solid var(--color-border-subtle);
                background: var(--color-surface-ground);
                box-shadow: var(--shadow-sm);
                z-index: 10;
        }

        .board-columns-container {
                display: flex;
                flex: 1;
                gap: var(--space-4);
                padding: var(--space-6) var(--space-8);
                overflow-x: auto;
                overflow-y: hidden;
                align-items: stretch;
                scroll-behavior: smooth;
        }

        /* Each Arc is a column runway/track */
        .board-column {
                flex: 0 0 340px;
                display: flex;
                flex-direction: column;
                gap: var(--space-3);
                background: var(--color-surface-elevated);
                border-radius: var(--radius-lg);
                padding: var(--space-3);
                border: 1px solid var(--color-border-default);
                transition: border-color var(--duration-fast) var(--ease-standard);
                max-height: 100%;
                /* We want columns to fill vertical space */
                height: max-content;
                min-height: 400px;
        }

        .board-column--selected {
                flex: 0 0 460px;
                border-color: var(--color-border-focus);
                background: var(--color-surface-ground);
                box-shadow: var(--shadow-md);
        }

        /* Column Header elements */
        .column-header {
                flex-shrink: 0;
                display: flex;
                flex-direction: column;
        }

        /* The big sticky detail card header */
        .column-header-sticky {
                position: relative;
                margin-bottom: var(--space-2);
        }

        /* The minimized clickable header */
        .column-header-mini {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                width: 100%;
                text-align: left;
                padding: var(--space-4);
                background: var(--color-surface-ground);
                border: 1px solid var(--color-border-subtle);
                border-radius: var(--radius-md);
                cursor: pointer;
                transition: background var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard);
        }

        .column-header-mini:hover {
                background: var(--color-surface-hover);
                box-shadow: var(--shadow-sm);
        }

        .column-header-mini:focus-visible {
                outline: 2px solid var(--color-border-focus);
                outline-offset: -2px;
        }

        .column-eyebrow {
                font-size: var(--text-xs);
                font-weight: var(--font-weight-bold);
                color: var(--color-nova-blue);
                text-transform: uppercase;
                letter-spacing: var(--tracking-wider);
                margin-bottom: var(--space-1);
        }

        .column-title {
                font-size: var(--text-lg);
                font-family: var(--font-serif);
                font-weight: var(--font-weight-medium);
                color: var(--color-text-primary);
                margin: 0;
                line-height: 1.2;
        }

        .column-subtitle {
                font-size: var(--text-sm);
                color: var(--color-text-secondary);
                margin: var(--space-2) 0 0 0;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
        }

        /* Column Body (for beats/scenes soon) */
        .column-body {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: var(--space-3);
                overflow-y: auto;
                padding: var(--space-2) 2px; /* tiny padding for outline focus rings to not get clipped */
        }
        
        .column-body::-webkit-scrollbar {
                width: 6px;
        }
        .column-body::-webkit-scrollbar-thumb {
                background-color: var(--color-border-strong);
                border-radius: var(--radius-full);
        }

        .column-dropzone {
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 56px;
                border: 2px dashed var(--color-border-strong);
                border-radius: var(--radius-md);
                color: var(--color-text-secondary);
                font-size: var(--text-sm);
                font-weight: var(--font-weight-medium);
                cursor: pointer;
                transition: all var(--duration-fast) var(--ease-standard);
                background: var(--color-surface-glass);
        }

        .column-dropzone:hover {
                color: var(--color-nova-blue);
                border-color: var(--color-nova-blue);
                background: color-mix(in srgb, var(--color-nova-blue) 10%, transparent);
        }

        /* Add Column button styling */
        .board-column--add {
                background: transparent;
                border: none;
                box-shadow: none;
                padding: 0;
        }
        .add-column-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: var(--space-2);
                width: 100%;
                height: 100%;
                min-height: 160px;
                background: var(--color-surface-glass);
                border: 2px dashed var(--color-border-strong);
                border-radius: var(--radius-lg);
                color: var(--color-text-secondary);
                font-family: var(--font-sans);
                font-size: var(--text-base);
                font-weight: var(--font-weight-medium);
                cursor: pointer;
                transition: all var(--duration-fast) var(--ease-standard);
        }
        .add-column-btn:hover {
                color: var(--color-nova-blue);
                border-color: var(--color-nova-blue);
                background: color-mix(in srgb, var(--color-nova-blue) 10%, transparent);
        }
''')
    elif not skip:
        new_lines.append(line)
        
    if skip and '.add-column-btn:hover {' in line:
        second = True
    if skip and second and line.strip() == '}':
        if not found_end:
            skip = False
            found_end = True

with open('src/routes/projects/[id]/workspace/+page.svelte', 'w') as f:
    f.writelines(new_lines)
