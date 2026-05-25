/* eslint-disable */
// Novellum UI kit — Library screen.
// Mirrors src/modules/project/components/HomeLibraryShell.svelte +
// LibraryHeroCard.svelte. Hero banner with "Continue Reading" + stacked book
// hero cards arranged vertically (one column).

const LIBRARY_PROJECTS = [
	{
		id: 'mariner',
		title: "The Mariner's Glass",
		logline: "A retired cartographer is summoned back to sea by a letter that should never have reached her.",
		genres: ['Literary', 'Mystery'],
		status: 'drafting',
		updatedAt: 'May 12, 2026',
		palette: ['#102a43', '#0ea5e9'],
		wordCount: 64200,
		targetWordCount: 80000,
	},
	{
		id: 'vellum',
		title: "Vellum & Bone",
		logline: "Two librarians of a vanishing archive must decide which truths to save and which to forget.",
		genres: ['Speculative'],
		status: 'planning',
		updatedAt: 'May 06, 2026',
		palette: ['#2b1a3a', '#9333ea'],
		wordCount: 8200,
		targetWordCount: 90000,
	},
	{
		id: 'amber',
		title: "Amber Roads",
		logline: "A trade caravan in the long winter discovers a town where every name is borrowed.",
		genres: ['Fantasy'],
		status: 'revising',
		updatedAt: 'April 28, 2026',
		palette: ['#3f2a1d', '#b45309'],
		wordCount: 91500,
		targetWordCount: 95000,
	},
	{
		id: 'moss',
		title: "The Moss Garden",
		logline: "A botanist and her estranged daughter try to keep a dying species alive — and a marriage.",
		genres: ['Literary'],
		status: 'completed',
		updatedAt: 'March 14, 2026',
		palette: ['#1f3a2e', '#10b981'],
		wordCount: 78400,
		targetWordCount: 78400,
	},
];

function LibraryScreen({ onOpenProject }) {
	const mostRecent = LIBRARY_PROJECTS[0];
	const rest = LIBRARY_PROJECTS.slice(1);

	return (
		<div className="nv-library">
			<HeroBanner project={mostRecent} onOpen={() => onOpenProject?.(mostRecent.id)} />
			<section className="nv-collection">
				<h2 className="nv-collection__title">Works in Progress</h2>
				<ul className="nv-collection__list">
					{rest.map((p, i) => (
						<LibraryCard
							key={p.id}
							project={p}
							cardIndex={i}
							onClick={() => onOpenProject?.(p.id)}
						/>
					))}
				</ul>
			</section>
		</div>
	);
}

function HeroBanner({ project, onOpen }) {
	return (
		<section className="nv-hero" aria-label="Continue Reading">
			<div className="nv-hero__content">
				<div className="nv-hero__eyebrow">Continue Reading</div>
				<h3 className="nv-hero__title">{project.title}</h3>
				<p className="nv-hero__logline">{project.logline}</p>
				<div className="nv-hero__actions">
					<Button variant="primary" onClick={onOpen}>Open Manuscript</Button>
					<button className="nv-hero__link">Open Library</button>
				</div>
			</div>
			<div className="nv-hero__cover">
				<BookCover title={project.title} palette={project.palette} size="lg" spine={false} />
			</div>
		</section>
	);
}

function LibraryCard({ project, cardIndex = 0, onClick }) {
	return (
		<li className="nv-libcard" style={{ '--card-index': cardIndex }}>
			<button className="nv-libcard__btn" onClick={onClick}>
				<BookCover title={project.title} palette={project.palette} size="md" />
				<div className="nv-libcard__content">
					<div className="nv-libcard__genres">
						{project.genres.map((g) => <GenrePill key={g}>{g}</GenrePill>)}
					</div>
					<h2 className="nv-libcard__title">{project.title}</h2>
					<p className="nv-libcard__logline">{project.logline}</p>
					<div className="nv-libcard__meta">Updated {project.updatedAt}</div>
				</div>
			</button>
		</li>
	);
}

Object.assign(window, { LibraryScreen, LIBRARY_PROJECTS });
