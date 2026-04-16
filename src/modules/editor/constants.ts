// Editor module constants
import type { EditMode } from '$lib/ai/types.js';

/** Available editing mode options for the toolbar. */
export const EDIT_MODES: readonly { value: EditMode; label: string }[] = [
	{ value: 'developmental', label: 'Developmental' },
	{ value: 'line_edit', label: 'Line Edit' },
	{ value: 'proofread', label: 'Proofread' },
] as const;
