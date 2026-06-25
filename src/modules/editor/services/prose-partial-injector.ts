export interface ProsePartialInjectRange {
	id: string;
	text: string;
	selected?: boolean;
	order?: number;
}

export interface ProseCursorBounds {
	from: number;
	to: number;
}

export interface SelectedProseParagraph {
	id: string;
	text: string;
	order: number;
}

export interface ProsePartialInjectTextInput {
	currentText: string | null | undefined;
	ranges: readonly ProsePartialInjectRange[];
	cursorBounds?: ProseCursorBounds | null;
	separator?: string;
	appendSeparator?: string;
}

export type ProsePartialInjectSkipReason = 'empty_selection';

export interface ProsePartialInjectTextResult {
	applied: boolean;
	reason?: ProsePartialInjectSkipReason;
	currentText: string;
	nextText: string;
	selectedText: string;
	insertedText: string;
	from: number;
	to: number;
	cursorPosition: number;
	usedAppendFallback: boolean;
	selectedRangeIds: string[];
}

export interface ProsePartialInjectorCommandChain {
	focus(): ProsePartialInjectorCommandChain;
	insertContentAt(
		position: number | ProseCursorBounds,
		content: string,
	): ProsePartialInjectorCommandChain;
	setTextSelection(position: number): ProsePartialInjectorCommandChain;
	run(): boolean;
}

export interface ProsePartialInjectorEditor {
	state?: {
		selection?: Partial<ProseCursorBounds> | null;
		doc?: {
			content?: { size?: number };
			nodeSize?: number;
		};
	};
	chain(): ProsePartialInjectorCommandChain;
}

export interface ProsePartialInjectEditorInput {
	editor: ProsePartialInjectorEditor | null | undefined;
	ranges: readonly ProsePartialInjectRange[];
	cursorBounds?: ProseCursorBounds | null;
	separator?: string;
}

export interface ProsePartialInjectEditorResult {
	applied: boolean;
	reason?: ProsePartialInjectSkipReason | 'missing_editor' | 'editor_rejected';
	selectedText: string;
	insertedText: string;
	from: number;
	to: number;
	cursorPosition: number;
	usedAppendFallback: boolean;
	selectedRangeIds: string[];
}

const DEFAULT_PARAGRAPH_SEPARATOR = '\n\n';

function normalizeText(value: string | null | undefined): string {
	return typeof value === 'string' ? value : '';
}

function isFiniteNumber(value: unknown): value is number {
	return typeof value === 'number' && Number.isFinite(value);
}

function clampPosition(value: number, max: number): number {
	return Math.max(0, Math.min(max, Math.trunc(value)));
}

function normalizeCursorBounds(
	bounds: ProseCursorBounds | null | undefined,
	max: number,
): ProseCursorBounds | null {
	if (!bounds || !isFiniteNumber(bounds.from) || !isFiniteNumber(bounds.to)) return null;

	const first = clampPosition(bounds.from, max);
	const second = clampPosition(bounds.to, max);
	return {
		from: Math.min(first, second),
		to: Math.max(first, second),
	};
}

function emptyTextResult(
	currentText: string,
	cursorBounds: ProseCursorBounds | null,
): ProsePartialInjectTextResult {
	const cursorPosition = cursorBounds?.to ?? currentText.length;
	return {
		applied: false,
		reason: 'empty_selection',
		currentText,
		nextText: currentText,
		selectedText: '',
		insertedText: '',
		from: cursorPosition,
		to: cursorPosition,
		cursorPosition,
		usedAppendFallback: cursorBounds === null,
		selectedRangeIds: [],
	};
}

export function collectSelectedProseParagraphs(
	ranges: readonly ProsePartialInjectRange[],
): SelectedProseParagraph[] {
	return ranges
		.map((range, index) => ({ range, index }))
		.filter(({ range }) => range.selected === true && range.text.trim().length > 0)
		.sort((a, b) => (a.range.order ?? a.index) - (b.range.order ?? b.index))
		.map(({ range, index }) => ({
			id: range.id,
			text: range.text.trim(),
			order: range.order ?? index,
		}));
}

export function buildSelectedProseText(
	ranges: readonly ProsePartialInjectRange[],
	separator = DEFAULT_PARAGRAPH_SEPARATOR,
): { selectedText: string; selectedRangeIds: string[] } {
	const selected = collectSelectedProseParagraphs(ranges);
	return {
		selectedText: selected.map((paragraph) => paragraph.text).join(separator),
		selectedRangeIds: selected.map((paragraph) => paragraph.id),
	};
}

export function applyPartialProseInjection(
	input: ProsePartialInjectTextInput,
): ProsePartialInjectTextResult {
	const currentText = normalizeText(input.currentText);
	const separator = input.separator ?? DEFAULT_PARAGRAPH_SEPARATOR;
	const appendSeparator = input.appendSeparator ?? DEFAULT_PARAGRAPH_SEPARATOR;
	const { selectedText, selectedRangeIds } = buildSelectedProseText(input.ranges, separator);
	const normalizedBounds = normalizeCursorBounds(input.cursorBounds, currentText.length);

	if (!selectedText) return emptyTextResult(currentText, normalizedBounds);

	if (!normalizedBounds) {
		const prefix =
			currentText.length > 0 && !currentText.endsWith(appendSeparator) ? appendSeparator : '';
		const insertedText = `${prefix}${selectedText}`;
		const nextText = `${currentText}${insertedText}`;
		return {
			applied: true,
			currentText,
			nextText,
			selectedText,
			insertedText,
			from: currentText.length,
			to: currentText.length,
			cursorPosition: nextText.length,
			usedAppendFallback: true,
			selectedRangeIds,
		};
	}

	const insertedText = selectedText;
	const nextText = `${currentText.slice(0, normalizedBounds.from)}${insertedText}${currentText.slice(
		normalizedBounds.to,
	)}`;
	return {
		applied: true,
		currentText,
		nextText,
		selectedText,
		insertedText,
		from: normalizedBounds.from,
		to: normalizedBounds.to,
		cursorPosition: normalizedBounds.from + insertedText.length,
		usedAppendFallback: false,
		selectedRangeIds,
	};
}

function editorDocumentEnd(editor: ProsePartialInjectorEditor): number {
	const contentSize = editor.state?.doc?.content?.size;
	if (isFiniteNumber(contentSize)) return Math.max(0, Math.trunc(contentSize));

	const nodeSize = editor.state?.doc?.nodeSize;
	if (isFiniteNumber(nodeSize)) return Math.max(0, Math.trunc(nodeSize - 2));

	return 0;
}

function resolveEditorBounds(
	editor: ProsePartialInjectorEditor,
	explicitBounds: ProseCursorBounds | null | undefined,
): { bounds: ProseCursorBounds; usedAppendFallback: boolean } {
	const docEnd = editorDocumentEnd(editor);
	const normalizedExplicit = normalizeCursorBounds(explicitBounds, docEnd);
	if (normalizedExplicit) return { bounds: normalizedExplicit, usedAppendFallback: false };

	const selection = editor.state?.selection;
	const normalizedSelection = normalizeCursorBounds(
		isFiniteNumber(selection?.from) && isFiniteNumber(selection?.to)
			? { from: selection.from, to: selection.to }
			: null,
		docEnd,
	);
	if (normalizedSelection) return { bounds: normalizedSelection, usedAppendFallback: false };

	return {
		bounds: { from: docEnd, to: docEnd },
		usedAppendFallback: true,
	};
}

export function injectPartialProseIntoEditor(
	input: ProsePartialInjectEditorInput,
): ProsePartialInjectEditorResult {
	const separator = input.separator ?? DEFAULT_PARAGRAPH_SEPARATOR;
	const { selectedText, selectedRangeIds } = buildSelectedProseText(input.ranges, separator);

	if (!selectedText) {
		return {
			applied: false,
			reason: 'empty_selection',
			selectedText,
			insertedText: '',
			from: 0,
			to: 0,
			cursorPosition: 0,
			usedAppendFallback: true,
			selectedRangeIds,
		};
	}

	if (!input.editor) {
		return {
			applied: false,
			reason: 'missing_editor',
			selectedText,
			insertedText: '',
			from: 0,
			to: 0,
			cursorPosition: 0,
			usedAppendFallback: true,
			selectedRangeIds,
		};
	}

	const { bounds, usedAppendFallback } = resolveEditorBounds(input.editor, input.cursorBounds);
	const cursorPosition = bounds.from + selectedText.length;
	const applied = input.editor
		.chain()
		.focus()
		.insertContentAt(bounds, selectedText)
		.setTextSelection(cursorPosition)
		.run();

	return {
		applied,
		reason: applied ? undefined : 'editor_rejected',
		selectedText,
		insertedText: applied ? selectedText : '',
		from: bounds.from,
		to: bounds.to,
		cursorPosition,
		usedAppendFallback,
		selectedRangeIds,
	};
}
