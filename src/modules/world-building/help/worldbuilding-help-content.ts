export interface WorldbuildingHelpGlossaryEntry {
	term: string;
	meaning: string;
}

export interface WorldbuildingHelpSection {
	id: string;
	label: string;
	tagline: string;
	purpose: string;
	meaning: string;
	questions: string[];
	pitfalls: string[];
	signals: string[];
	glossary: WorldbuildingHelpGlossaryEntry[];
}

export const WORLDBUILDING_HELP_SECTIONS: readonly WorldbuildingHelpSection[] = [
	{
		id: 'personae',
		label: 'Personae',
		tagline: 'Who carries the world',
		purpose:
			'All sentient life and social structures in your narrative space, from singular voices to collective identity.',
		meaning:
			'Personae defines agency. If Atlas is terrain and Chronicles is time, Personae is will: who can act, who cannot, and what identity costs them to sustain.',
		questions: [
			'Who has power, and what limits that power?',
			'Which loyalties are inherited, chosen, or imposed?',
			'What contradictions make each group or individual dramatically unstable?',
		],
		pitfalls: [
			'Flat archetypes with no conflicting drives.',
			'Factions that exist only as labels, not pressure systems.',
			'Lineages treated as trivia instead of social consequence.',
		],
		signals: [
			'Every major actor has a desire that collides with another actor.',
			'Group identity changes behavior, stakes, and language on the page.',
			'Backstory explains current decisions rather than decorating them.',
		],
		glossary: [
			{ term: 'Individuals', meaning: 'Specific voices with motive, leverage, and vulnerability.' },
			{ term: 'Factions', meaning: 'Collective actors that institutionalize conflict and belonging.' },
			{ term: 'Lineages', meaning: 'Inherited identity threads that shape status, expectation, and risk.' },
			{ term: 'Notes', meaning: 'Unresolved character ideas parked before canonization.' },
		],
	},
	{
		id: 'atlas',
		label: 'Atlas',
		tagline: 'Where pressure becomes place',
		purpose:
			'The physical where of your world: geography, material context, and the distances between narrative forces.',
		meaning:
			'Atlas defines constraint. It answers what movement costs, where scarcity concentrates, and how environment selects for behavior long before plot begins.',
		questions: [
			'Which routes create opportunity, and which routes create danger?',
			'What resources are abundant, scarce, forbidden, or sacred?',
			'How does geography force social structure?',
		],
		pitfalls: [
			'Pretty maps with no narrative friction.',
			'Landmarks disconnected from power or memory.',
			'Travel distances that change only for convenience.',
		],
		signals: [
			'Locations produce different choices from the same character.',
			'Setting details alter conflict outcomes, not just atmosphere.',
			'Spatial logic remains coherent across every chapter.',
		],
		glossary: [
			{ term: 'Realms', meaning: 'Macro territories and ecological containers for conflict.' },
			{ term: 'Landmarks', meaning: 'High-impact sites where story pressure concentrates.' },
			{ term: 'Maps', meaning: 'Spatial references that preserve route and distance continuity.' },
			{ term: 'Notes', meaning: 'Unslotted spatial ideas awaiting exact placement.' },
		],
	},
	{
		id: 'archive',
		label: 'The Archive',
		tagline: 'What memory refuses to lose',
		purpose:
			'The cultural memory core: mythic inheritance, speculative systems, and traditions preserved through displacement.',
		meaning:
			'The Archive defines legitimacy. It explains why people believe what they believe, which systems feel inevitable, and what a society calls true even when it is wrong.',
		questions: [
			'What stories does this world tell to justify itself?',
			'What technologies alter moral boundaries?',
			'Which rituals preserve identity under stress?',
		],
		pitfalls: [
			'Lore dumps detached from character stakes.',
			'Tech concepts with no cultural side effects.',
			'Traditions presented as static, not contested.',
		],
		signals: [
			'Belief and custom materially affect plot outcomes.',
			'Knowledge is unevenly distributed and politically useful.',
			'Contradictory histories can both be meaningful in-scene.',
		],
		glossary: [
			{ term: 'Myths', meaning: 'Narrative frameworks that define identity and destiny.' },
			{ term: 'Technology', meaning: 'Applied systems that reshape daily life and power.' },
			{ term: 'Traditions', meaning: 'Repeated practices that encode shared values.' },
			{ term: 'Notes', meaning: 'Archive fragments pending verification or synthesis.' },
		],
	},
	{
		id: 'threads',
		label: 'Threads',
		tagline: 'How movement becomes consequence',
		purpose:
			'The connective tissue of narrative motion: causal chains, secondary movement, and the why beneath action.',
		meaning:
			'Threads defines causality. It clarifies not only what happens, but why it had to happen given personalities, systems, and prior events.',
		questions: [
			'Which chain of decisions drives each major turn?',
			'What counter-movements complicate the main arc?',
			'Which motives remain hidden versus declared?',
		],
		pitfalls: [
			'Events linked by chronology but not cause.',
			'Sub-plots that do not alter the main story pressure.',
			'Motivations stated but not evidenced in behavior.',
		],
		signals: [
			'Every major beat has a traceable causal parent.',
			'Secondary arcs sharpen, rather than distract from, theme.',
			'Character choices remain legible even when surprising.',
		],
		glossary: [
			{ term: 'Major Arcs', meaning: 'Primary movement of transformation and consequence.' },
			{ term: 'Sub-plots', meaning: 'Secondary lines that intensify or counterpoint the main movement.' },
			{ term: 'Motivations', meaning: 'Decision logic connecting desire to action.' },
			{ term: 'Notes', meaning: 'Unsorted connective ideas before arc placement.' },
		],
	},
	{
		id: 'chronicles',
		label: 'Chronicles',
		tagline: 'When history splits and reforms',
		purpose:
			'The temporal where and when: historical strata, canonical events, and divergent personal timelines.',
		meaning:
			'Chronicles defines temporal truth. It keeps continuity coherent when official records, private memory, and lived sequence do not perfectly align.',
		questions: [
			'What changes from one era to the next, and why?',
			'Which events are canonical, disputed, suppressed, or forgotten?',
			'Where do personal timelines diverge from public history?',
		],
		pitfalls: [
			'Ambiguous chronology that forces retroactive patching.',
			'Key events listed without downstream effects.',
			'Character histories that violate established world timing.',
		],
		signals: [
			'Time references stay consistent across scenes and arcs.',
			'Historical events produce durable consequences in the present.',
			'Conflicting records are intentional and narratively useful.',
		],
		glossary: [
			{ term: 'Eras', meaning: 'Temporal containers for macro historical shifts.' },
			{ term: 'Key Events', meaning: 'Turning points that alter systemic trajectories.' },
			{ term: 'Personal Histories', meaning: 'Character timeline layers intersecting canon.' },
			{ term: 'Notes', meaning: 'Loose chronology ideas awaiting timeline anchoring.' },
		],
	},
];
