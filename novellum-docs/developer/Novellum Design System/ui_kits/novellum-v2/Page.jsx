/* eslint-disable */
// Novellum v2 — Page (Editor).
// Parchment manuscript with drop cap, marginalia from Nova, scene rail.

function Page({ project, onAskMuse }) {
	const moodStyle = useMood(project);
	const [activeScene, setActiveScene] = useState('sc2');
	const scene = SCENES.find((s) => s.id === activeScene) || SCENES[1];

	return (
		<div className="page-frame" style={moodStyle}>
			<aside className="rail">
				<div className="rail__head">
					<div className="eyebrow">Chapter Three</div>
					<div className="rail__chapter-title">The fog bank</div>
				</div>
				<div className="rail__scenes">
					{SCENES.map((s) => (
						<button
							key={s.id}
							className={`rail-card rail-card--${s.status} ${s.id === activeScene ? 'rail-card--active' : ''}`}
							onClick={() => setActiveScene(s.id)}
						>
							<div className="rail-card__num">{s.num}</div>
							<div className="rail-card__title">{s.title}</div>
							<div className="rail-card__count">{s.wordCount ? `${s.wordCount.toLocaleString()} w` : 'empty'}</div>
						</button>
					))}
					<button className="rail-add">
						<span>+</span>
						<span>Begin a new scene</span>
					</button>
				</div>

				<div className="rail__foot">
					<div className="rail__breath">
						<div className="rail__breath-num">1,842</div>
						<div className="rail__breath-label">words today</div>
					</div>
					<div className="rail__breath rail__breath--alt">
						<div className="rail__breath-num">14</div>
						<div className="rail__breath-label">day streak</div>
					</div>
				</div>
			</aside>

			<div className="page-stage">
				<article className="manuscript">
					<header className="manuscript__head">
						<div className="manuscript__eyebrow">Chapter Three · Scene {scene.num}</div>
						<h1 className="manuscript__title">{scene.title}</h1>
					</header>

					<div className="manuscript__prose">
						<p className="manuscript__first">
							<span className="dropcap">{scene.body[0][0]}</span>{scene.body[0].slice(1)}
						</p>
						{scene.body.slice(1).map((para, i) => <p key={i}>{para}</p>)}

						<aside className="margin-note margin-note--right">
							<button className="margin-note__nib" onClick={() => onAskMuse?.(scene)}>N</button>
							<div className="margin-note__body">
								<div className="eyebrow margin-note__label">Nova noticed</div>
								<p>Quint is introduced quietly here — first dialogue, no description. Want me to seed his physicality earlier in 3.1?</p>
								<div className="margin-note__actions">
									<button className="margin-note__action">Yes, draft a sentence</button>
									<button className="margin-note__action margin-note__action--ghost">Not now</button>
								</div>
							</div>
						</aside>
					</div>

					<footer className="manuscript__foot">
						<div className="manuscript__count">
							<span className="manuscript__count-num">{scene.wordCount.toLocaleString()}</span>
							<span className="manuscript__count-label">words in this scene</span>
						</div>
						<div className="manuscript__sign">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
								<path d="M20 4 4 20" /><path d="M14 4h6v6" /><path d="M9 11l4 4" />
							</svg>
							<span>saved a moment ago</span>
						</div>
					</footer>
				</article>
			</div>
		</div>
	);
}

const SCENES = [
	{
		id: 'sc1', num: 1, title: 'The fog bank', status: 'done', wordCount: 1240,
		body: [
			"At first the fog was only a line on the horizon — too even, too low, the way a finger of smoke from a far-off fire arranges itself.",
			"By the second watch it had crossed the bar.",
		],
	},
	{
		id: 'sc2', num: 2, title: 'Halia at the chart table', status: 'active', wordCount: 1842,
		body: [
			"Halia laid the chart out on the wardroom table and weighted its corners with the ship's brass — a small habit she had carried with her into retirement and now, apparently, back out of it.",
			"The chart was newer than she remembered. Someone had copied it. The hand was uneven where the original cartographer had been certain; the soundings near the western anchorage had been smoothed into rounder, less truthful numbers.",
			"She found the pencil she still kept threaded through her hair and began, slowly, to draw the depths back to what they had been.",
			"\"You're going to have to tell them eventually,\" Quint said from the doorway.",
			"She did not look up. \"Tell them what.\"",
			"\"That the letter wasn't a forgery.\"",
		],
	},
	{
		id: 'sc3', num: 3, title: 'A signal from the western anchorage', status: 'draft', wordCount: 420,
		body: [
			"The lantern blinked once, paused, and blinked again — the cadence of a signal she had not been meant to remember.",
		],
	},
	{
		id: 'sc4', num: 4, title: 'The dawn watch', status: 'empty', wordCount: 0,
		body: [""],
	},
];

Object.assign(window, { Page });
