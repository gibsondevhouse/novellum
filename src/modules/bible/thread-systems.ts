import type { PlotThread } from '$lib/db/domain-types';

export type ThreadSystemKind = 'major-arc' | 'sub-plot' | 'motivation';

export type MajorArcPayload = {
	kind: 'major-arc';
	name: string;
	scope: '' | 'global' | 'faction' | 'character-centered';
	initialCondition: string;
	incitingPressure: string;
	escalationPattern: string;
	breakingPoint: string;
	resolutionVector: string;
	arcFunction: string;
	stakes: string;
	characterIds: string[];
	realmIds: string[];
	threadIds: string[];
	subPlotIds: string[];
};

export type SubPlotPayload = {
	kind: 'sub-plot';
	name: string;
	parentArcId: string;
	relationshipToMainArc: string;
	entryPoint: string;
	escalation: string;
	convergencePoint: string;
	purpose: string;
	stakes: string;
	characterIds: string[];
	realmIds: string[];
	threadIds: string[];
};

export type MotivationPayload = {
	kind: 'motivation';
	name: string;
	motivationType: 'character' | 'faction' | 'systemic' | '';
	desire: string;
	fearConstraint: string;
	belief: string;
	trigger: string;
	typicalAction: string;
	escalationShift: string;
	function: string;
	characterIds: string[];
	factionIds: string[];
	arcIds: string[];
	subPlotIds: string[];
};

export type ThreadSystemPayload = MajorArcPayload | SubPlotPayload | MotivationPayload;

export function parseThreadPayload(thread: PlotThread): ThreadSystemPayload | null {
	if (!thread.description?.trim()) return null;
	try {
		const parsed = JSON.parse(thread.description) as Partial<ThreadSystemPayload>;
		if (parsed.kind === 'major-arc' || parsed.kind === 'sub-plot' || parsed.kind === 'motivation') {
			return parsed as ThreadSystemPayload;
		}
		return null;
	} catch {
		return null;
	}
}

export function isThreadKind(thread: PlotThread, kind: ThreadSystemKind): boolean {
	const payload = parseThreadPayload(thread);
	if (payload) return payload.kind === kind;
	if (kind === 'major-arc') return true;
	return false;
}

export function optionSubtitle(thread: PlotThread, kind: ThreadSystemKind): string {
	const payload = parseThreadPayload(thread);
	if (kind === 'major-arc') {
		if (payload?.kind === 'major-arc') return payload.scope || 'global';
		return thread.status || 'open';
	}
	if (kind === 'sub-plot') {
		if (payload?.kind === 'sub-plot') return payload.parentArcId || 'No parent arc';
		return 'No parent arc';
	}
	if (payload?.kind === 'motivation') return payload.motivationType || 'Type pending';
	return 'Type pending';
}

export function optionMeta(thread: PlotThread, kind: ThreadSystemKind): string {
	const payload = parseThreadPayload(thread);
	if (!payload) return thread.description?.trim() ? 'Drafted' : 'No details yet';
	if (kind === 'major-arc' && payload.kind === 'major-arc') {
		return payload.resolutionVector?.trim() || 'Resolution pending';
	}
	if (kind === 'sub-plot' && payload.kind === 'sub-plot') {
		return payload.convergencePoint?.trim() || 'Convergence pending';
	}
	if (kind === 'motivation' && payload.kind === 'motivation') {
		return payload.trigger?.trim() || 'Trigger pending';
	}
	return 'Drafted';
}
