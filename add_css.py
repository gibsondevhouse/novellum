import sys

with open('src/routes/projects/[id]/workspace/+page.svelte', 'r') as f:
    content = f.read()

css_to_add = '''
/* ── Board View (Arcs) ── */
.workspace-board-view {
	display: flex;
	flex-direction: column;
	height: 100%;
	min-height: 100%;
	overflow: hidden;
}

.board-header-row {
	flex-shrink: 0;
	padding: var(--space-4) var(--space-6);
	border-bottom: 1px solid var(--color-border-subtle);
}

.board-columns-container {
	display: flex;
	flex: 1;
	gap: var(--space-4);
	padding: var(--space-6);
	overflow-x: auto;
	align-items: flex-start;
	/* Optional smooth scrolling */
	scroll-behavior: smooth;
}

/* Each Arc is a column */
.board-column {
	flex: 0 0 320px;
	display: flex;
	flex-direction: column;
	gap: var(--space-3);
	background: var(--color-surface-ground);
	border-radius: var(--radius-md);
	min-height: 120px; /* basic starter height */
	max-height: 100%;
	border: 1px solid transparent;
	transition: border-color var(--duration-fast) var(--ease-standard);
}

.board-column--selected {
	/* When selected, allow the column to grow wide enough for the detail card */
	flex: 0 0 600px;
	border-color: var(--color-border-focus);
	background: transparent;
}

/* Column Header elements */
.column-header {
	flex-shrink: 0;
	display: flex;
	flex-direction: column;
}

/* The big sticky detail card header */
.column-header-sticky {
	/* We can make it sticky later if body content scrolls */
	position: relative;
}

/* The minimized clickable header */
.column-header-mini {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	width: 100%;
	text-align: left;
	padding: var(--space-4);
	background: var(--color-surface-elevated);
	border: 1px solid var(--color-border-default);
	border-radius: var(--radius-md);
	cursor: pointer;
	transition: background var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard);
}

.column-header-mini:hover {
	background: var(--color-surface-hover);
}

.column-header-mini:focus-visible {
	outline: 2px solid var(--color-border-focus);
	outline-offset: -2px;
}

.column-eyebrow {
	font-size: var(--text-xs);
	font-weight: var(--font-weight-semibold);
	color: var(--color-text-muted);
	text-transform: uppercase;
	letter-spacing: var(--tracking-wide);
	margin-bottom: var(--space-1);
}

.column-title {
	font-size: var(--text-base);
	font-weight: var(--font-weight-semibold);
	color: var(--color-text-primary);
	margin: 0;
}

.column-subtitle {
	font-size: var(--text-sm);
	color: var(--color-text-secondary);
	margin: var(--space-1) 0 0 0;
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
	gap: var(--space-2);
	overflow-y: auto;
	padding: 0 var(--space-2) var(--space-2);
}

.column-dropzone {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 48px;
	border: 1px dashed var(--color-border-strong);
	border-radius: var(--radius-sm);
	color: var(--color-text-muted);
	font-size: var(--text-sm);
	font-weight: var(--font-weight-medium);
	cursor: pointer;
	transition: all var(--duration-fast) var(--ease-standard);
}

.column-dropzone:hover {
	color: var(--color-text-primary);
	border-color: var(--color-border-focus);
	background: var(--color-surface-glass);
}

/* Add Column button styling */
.board-column--add {
	background: transparent;
	border: none;
}
.add-column-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: var(--space-2);
	width: 100%;
	height: 100%;
	min-height: 120px;
	background: var(--color-surface-glass);
	border: 1px dashed var(--color-border-strong);
	border-radius: var(--radius-md);
	color: var(--color-text-secondary);
	font-family: var(--font-sans);
	font-size: var(--text-sm);
	font-weight: var(--font-weight-medium);
	cursor: pointer;
	transition: all var(--duration-fast) var(--ease-standard);
}
.add-column-btn:hover {
	color: var(--color-nova-blue);
	border-color: var(--color-nova-blue);
	background: color-mix(in srgb, var(--color-nova-blue) 10%, transparent);
}
'''

if '</style>' in content:
    content = content.replace('</style>', css_to_add + '\n</style>')
    with open('src/routes/projects/[id]/workspace/+page.svelte', 'w') as f:
        f.write(content)
    print("CSS injected successfully")
else:
    print("Could not find </style> tag")
