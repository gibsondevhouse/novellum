/* eslint-disable */
// Novellum v2 — Study (replaces Library).
// Today landing + tactile shelf.

function Study({ onOpenProject }) {
	const current = PROJECTS[0];
	const rest = PROJECTS.slice(1);
	const time = useGreeting();

	return (
		<div className="study">
			<div className="study__bg" aria-hidden="true">
				<div className="study__candle" />
				<div className="study__vignette" />
			</div>

			<header className="study__head">
				<div>
					<div className="eyebrow">{time.date} · {time.clock} · {time.weather}</div>
					<h1 className="study__hello">{time.greet}, Halia.</h1>
				</div>
				<div className="study__chips">
					<StatChip num="14" label="day streak" />
					<StatChip num="1,842" label="words today" />
					<div className="quote-chip">
						<div className="quote-chip__label">a passage to consider</div>
						<div className="quote-chip__body">"A book must be the axe for the frozen sea inside us."</div>
						<div className="quote-chip__attr">— Kafka, to a friend</div>
					</div>
				</div>
			</header>

			<section
				className="continue"
				onClick={() => onOpenProject(current.id)}
				style={{ '--mood-ink': current.mood.ink, '--mood-wash': current.mood.wash, '--mood-warm': current.mood.warm, '--mood-accent': current.mood.accent }}
			>
				<div className="continue__pin" aria-hidden="true" />
				<Cover project={current} size="lg" />
				<div className="continue__body">
					<div className="eyebrow">Where you left off, two hours ago</div>
					<div className="continue__excerpt">
						"…she did not look up. <em>'Tell them what.'</em> <em>'That the letter wasn't a forgery.'</em>"
					</div>
					<div className="continue__meta">
						<span>Chapter {current.lastScene.chapter} · Scene {current.lastScene.scene}</span>
						<span className="continue__meta-dot">·</span>
						<span className="handwriting">{current.lastScene.title}</span>
					</div>
					<div className="continue__progress">
						<Progress value={current.wordToday} max={current.goalToday} label={`today · ${current.wordToday.toLocaleString()} / ${current.goalToday.toLocaleString()}`} />
					</div>
					<div className="continue__actions" onClick={(e) => e.stopPropagation()}>
						<Btn variant="primary" onClick={() => onOpenProject(current.id, 'editor')}>Continue writing</Btn>
						<Btn variant="ghost" onClick={() => onOpenProject(current.id, 'reader')}>Read the last chapter</Btn>
					</div>
				</div>
			</section>

			<section className="shelf">
				<div className="shelf__head">
					<h2 className="shelf__title">Your shelf</h2>
					<div className="shelf__filters">
						<button className="tab tab--active">All four</button>
						<button className="tab">In progress · 2</button>
						<button className="tab">Resting · 1</button>
						<button className="tab">Completed · 1</button>
					</div>
				</div>
				<div className="shelf__books">
					{rest.map((p) => <ShelfBook key={p.id} project={p} onClick={() => onOpenProject(p.id)} />)}
					<button className="shelf__new">
						<span className="shelf__new-glyph">+</span>
						<span>Begin a new manuscript</span>
					</button>
				</div>
			</section>
		</div>
	);
}

function useGreeting() {
	// Static for the mock — would be real in production
	return {
		date: 'Saturday, May 24',
		clock: '7:42 am',
		weather: 'a fog over Tomales Bay',
		greet: 'Welcome back',
	};
}

Object.assign(window, { Study });
