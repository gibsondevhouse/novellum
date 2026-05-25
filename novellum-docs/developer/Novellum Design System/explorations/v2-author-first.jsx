/* eslint-disable */
// v2 — Author-first refactor exploration.
// Reimagines five Novellum surfaces with warmer, more atmospheric treatment.
// Drops into the design canvas as separate artboards.

const { useState } = React;

/* ─────────────────────────────────────────────────────────────────────────
   Shared mock data — same projects as the UI kit, plus mood palettes.
   ───────────────────────────────────────────────────────────────────────── */

const V2_PROJECTS = [
	{
		id: 'mariner',
		title: "The Mariner's Glass",
		author: 'Halia Marrowfen (you)',
		logline: "A retired cartographer is summoned back to sea by a letter that should never have reached her.",
		genres: ['Literary', 'Mystery'],
		palette: { ink: '#0e1b29', wash: '#1a3148', accent: '#9ec5e8', warm: '#c89a5b' }, // deep sea
		updatedAt: '2 hours ago',
		streak: 14,
		wordToday: 1842,
		goalToday: 2000,
		wordCount: 64200,
		targetWordCount: 80000,
	},
	{
		id: 'vellum',
		title: "Vellum & Bone",
		logline: "Two librarians of a vanishing archive must decide which truths to save and which to forget.",
		genres: ['Speculative'],
		palette: { ink: '#1b1424', wash: '#2e2138', accent: '#c5a9e8', warm: '#b88a5a' }, // violet vellum
		updatedAt: 'Yesterday',
		streak: 6,
		wordCount: 8200,
		targetWordCount: 90000,
	},
	{
		id: 'amber',
		title: "Amber Roads",
		logline: "A trade caravan in the long winter discovers a town where every name is borrowed.",
		genres: ['Fantasy'],
		palette: { ink: '#241608', wash: '#3a2415', accent: '#e8c89e', warm: '#d4944a' }, // amber
		updatedAt: '4 days ago',
		streak: 0,
		wordCount: 91500,
		targetWordCount: 95000,
	},
	{
		id: 'moss',
		title: "The Moss Garden",
		logline: "A botanist and her estranged daughter try to keep a dying species alive — and a marriage.",
		genres: ['Literary'],
		palette: { ink: '#0e2018', wash: '#1a3528', accent: '#a9e8c5', warm: '#c4a570' }, // moss
		updatedAt: 'Last week',
		streak: 0,
		wordCount: 78400,
		targetWordCount: 78400,
	},
];

/* ─────────────────────────────────────────────────────────────────────────
   ARTBOARD 1 — "The Study" (Library replacement)
   Atmospheric study scene: warm candle vignette, "Today's Page" call-out
   with where-you-left-off, streak chip, weather glance, and projects as
   tactile books on a shelf.
   ───────────────────────────────────────────────────────────────────────── */

function StudyView() {
	const current = V2_PROJECTS[0];

	return (
		<div className="v2-study">
			<div className="v2-study__bg" aria-hidden="true">
				<div className="v2-study__candle"></div>
				<div className="v2-study__vignette"></div>
			</div>

			<header className="v2-study__head">
				<div className="v2-study__greeting">
					<div className="v2-eyebrow">Saturday · 7:42 am · A fog over Tomales Bay</div>
					<h1 className="v2-study__hello">Welcome back, Halia.</h1>
				</div>
				<div className="v2-study__chips">
					<div className="v2-chip">
						<span className="v2-chip__num">14</span>
						<span className="v2-chip__label">day streak</span>
					</div>
					<div className="v2-chip">
						<span className="v2-chip__num">1,842</span>
						<span className="v2-chip__label">words today</span>
					</div>
					<div className="v2-chip v2-chip--quote">
						<span className="v2-chip__label">today's quote</span>
						<span className="v2-chip__quote">"A book must be the axe for the frozen sea inside us."</span>
					</div>
				</div>
			</header>

			<section className="v2-study__continue" style={{ '--proj-wash': current.palette.wash, '--proj-warm': current.palette.warm, '--proj-accent': current.palette.accent }}>
				<div className="v2-continue__cover" style={{ background: `linear-gradient(160deg, ${current.palette.ink}, ${current.palette.wash})` }}>
					<div className="v2-continue__foil"></div>
					<span className="v2-continue__initial">M</span>
					<span className="v2-continue__spine">{current.title}</span>
				</div>
				<div className="v2-continue__body">
					<div className="v2-continue__where">Where you left off, two hours ago</div>
					<div className="v2-continue__excerpt">
						"…she did not look up. <em>'Tell them what.'</em> <em>'That the letter wasn't a forgery.'</em>"
					</div>
					<div className="v2-continue__meta">
						<span>Chapter 3 · Scene 2</span>
						<span>·</span>
						<span>Halia at the chart table</span>
					</div>
					<div className="v2-continue__progress">
						<div className="v2-progress">
							<div className="v2-progress__fill" style={{ width: '80%' }}></div>
						</div>
						<span className="v2-progress__label">today · 1,842 / 2,000</span>
					</div>
					<div className="v2-continue__actions">
						<button className="v2-btn v2-btn--primary">Continue writing</button>
						<button className="v2-btn v2-btn--ghost">Read the last chapter</button>
					</div>
				</div>
			</section>

			<section className="v2-study__shelf">
				<div className="v2-shelf__head">
					<h2 className="v2-shelf__title">Your shelf</h2>
					<div className="v2-shelf__filters">
						<button className="v2-tab v2-tab--active">All four</button>
						<button className="v2-tab">In progress · 2</button>
						<button className="v2-tab">Resting · 1</button>
						<button className="v2-tab">Completed · 1</button>
					</div>
				</div>
				<div className="v2-shelf__books">
					{V2_PROJECTS.slice(1).map((p) => <ShelfBook key={p.id} project={p} />)}
					<button className="v2-shelf__new">
						<span className="v2-shelf__new-glyph">+</span>
						<span>Begin a new manuscript</span>
					</button>
				</div>
			</section>
		</div>
	);
}

function ShelfBook({ project }) {
	const pct = Math.round((project.wordCount / project.targetWordCount) * 100);
	return (
		<div className="v2-book" style={{ '--proj-ink': project.palette.ink, '--proj-wash': project.palette.wash, '--proj-warm': project.palette.warm }}>
			<div className="v2-book__spine" style={{ background: `linear-gradient(180deg, ${project.palette.ink}, ${project.palette.wash})` }}>
				<div className="v2-book__foil"></div>
				<span className="v2-book__title">{project.title}</span>
			</div>
			<div className="v2-book__body">
				<div className="v2-book__row">
					<div className="v2-book__title-line">{project.title}</div>
					<div className="v2-book__meta">{project.updatedAt}</div>
				</div>
				<p className="v2-book__logline">{project.logline}</p>
				<div className="v2-book__footer">
					<div className="v2-progress v2-progress--thin"><div className="v2-progress__fill" style={{ width: `${pct}%` }}></div></div>
					<span className="v2-book__pct">{(project.wordCount/1000).toFixed(1)}k / {(project.targetWordCount/1000).toFixed(0)}k</span>
				</div>
			</div>
		</div>
	);
}

/* ─────────────────────────────────────────────────────────────────────────
   ARTBOARD 2 — "The Page" (Editor refactor)
   Deeper parchment surface, drop cap, scene rail with cards, marginalia,
   a calligraphic word count, no flat status bar.
   ───────────────────────────────────────────────────────────────────────── */

function PageView() {
	return (
		<div className="v2-page-frame">
			<aside className="v2-page-rail">
				<div className="v2-rail__chapter">Chapter 3 — The fog bank</div>
				<div className="v2-rail__scenes">
					<SceneRailCard num="3.1" title="The fog bank" wordCount={1240} status="done" />
					<SceneRailCard num="3.2" title="Halia at the chart table" wordCount={1842} status="active" />
					<SceneRailCard num="3.3" title="A signal from the western anchorage" wordCount={420} status="draft" />
					<SceneRailCard num="3.4" title="The dawn watch" wordCount={0} status="empty" />
				</div>
			</aside>

			<div className="v2-page-stage">
				<article className="v2-page">
					<div className="v2-page__head">
						<div className="v2-page__chapter-eyebrow">Chapter Three · Scene Two</div>
						<h1 className="v2-page__title">Halia at the chart table</h1>
					</div>

					<div className="v2-page__prose">
						<p className="v2-page__first">
							<span className="v2-dropcap">H</span>alia laid the chart out on the wardroom table and weighted its corners with the ship's brass — a small habit she had carried with her into retirement and now, apparently, back out of it.
						</p>
						<p>The chart was newer than she remembered. Someone had copied it. The hand was uneven where the original cartographer had been certain; the soundings near the western anchorage had been smoothed into rounder, less truthful numbers.</p>
						<p>She found the pencil she still kept threaded through her hair and began, slowly, to draw the depths back to what they had been.</p>
						<p>"You're going to have to tell them eventually," Quint said from the doorway.</p>
						<p>She did not look up. "Tell them what."</p>
						<p>"That the letter wasn't a forgery."</p>

						{/* Marginalia note — Nova in the gutter */}
						<aside className="v2-margin-note v2-margin-note--left">
							<div className="v2-margin-note__nib">N</div>
							<div className="v2-margin-note__body">
								Quint is introduced quietly here — first dialogue, no description. Want me to seed his physicality earlier in 3.1?
							</div>
						</aside>
					</div>

					<footer className="v2-page__footer">
						<div className="v2-page__count">
							<span className="v2-page__count-num">1,842</span>
							<span className="v2-page__count-label">words in this scene</span>
						</div>
						<div className="v2-page__quill">
							<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 4 4 20"></path><path d="M14 4h6v6"></path><path d="M9 11l4 4"></path></svg>
							<span>saved a moment ago</span>
						</div>
					</footer>
				</article>
			</div>
		</div>
	);
}

function SceneRailCard({ num, title, wordCount, status }) {
	return (
		<button className={`v2-rail-card v2-rail-card--${status}`}>
			<div className="v2-rail-card__num">{num}</div>
			<div className="v2-rail-card__title">{title}</div>
			<div className="v2-rail-card__count">{wordCount ? `${wordCount.toLocaleString()} w` : 'empty'}</div>
		</button>
	);
}

/* ─────────────────────────────────────────────────────────────────────────
   ARTBOARD 3 — "The Reading Room" (Reader refactor)
   Deeper warmth, drop cap, chapter ornament, candle vignette, page-edge
   shadow, dog-ear bookmark.
   ───────────────────────────────────────────────────────────────────────── */

function ReadingRoom() {
	return (
		<div className="v2-room">
			<div className="v2-room__candle" aria-hidden="true"></div>
			<div className="v2-room__vignette" aria-hidden="true"></div>

			<div className="v2-room__chrome">
				<button className="v2-room__chrome-btn">‹  Library</button>
				<div className="v2-room__title">The Mariner's Glass</div>
				<button className="v2-room__chrome-btn">Aa  Reading settings</button>
			</div>

			<div className="v2-room__stage">
				<div className="v2-room__book">
					<div className="v2-room__bookmark"></div>

					<div className="v2-room__page v2-room__page--left">
						<div className="v2-room__chapter">
							<span className="v2-room__chapter-num">Chapter One</span>
							<div className="v2-room__ornament">❦</div>
							<h2 className="v2-room__chapter-title">The Letter</h2>
						</div>
						<p className="v2-room__para v2-room__para--first">
							<span className="v2-room__dropcap">H</span>alia received the letter on a Tuesday, which is how she would later remember the year — by the day of the week she stopped being retired.
						</p>
						<p className="v2-room__para">The envelope had no postmark. It had travelled, somehow, from a port that had been quietly removed from the maps eleven years before, and it carried her name in handwriting she had once known intimately.</p>
						<p className="v2-room__para">She set it on the kitchen table next to the half-drunk tea and watched it for the better part of an hour. The morning slid into noon. The cat investigated, found nothing of interest, and left. Outside, the harbour bell rang twelve, and Halia did not move.</p>
						<span className="v2-room__folio">2</span>
					</div>

					<div className="v2-room__gutter"></div>

					<div className="v2-room__page v2-room__page--right">
						<p className="v2-room__para">When she finally opened it, the paper unfolded with the soft, almost living quality of vellum that has been kept dry for a long time. Three lines.</p>
						<p className="v2-room__para">The first asked whether she still remembered the western anchorage.</p>
						<p className="v2-room__para">The second told her she was needed.</p>
						<p className="v2-room__para">The third was a date — five weeks out — and the name of a ship she had been certain was lost.</p>
						<p className="v2-room__para">She read it twice, then a third time. Then she walked to the back of the house, took down the brass key she had not used in over a decade, and unlocked the room where she had kept her instruments.</p>
						<span className="v2-room__folio">3</span>
					</div>
				</div>
			</div>

			<div className="v2-room__controls">
				<button className="v2-room__nav">‹</button>
				<div className="v2-room__progress">
					<div className="v2-room__progress-bar"><div className="v2-room__progress-fill" style={{ width: '21%' }}></div></div>
					<div className="v2-room__progress-label">page 2 of 142 · 21 minutes left in this chapter</div>
				</div>
				<button className="v2-room__nav">›</button>
			</div>
		</div>
	);
}

/* ─────────────────────────────────────────────────────────────────────────
   ARTBOARD 4 — "The Muse" (Nova refactor)
   Nova reimagined as marginalia + correspondence, not a chat panel.
   Cards stack like notes left in a journal.
   ───────────────────────────────────────────────────────────────────────── */

function MuseView() {
	return (
		<div className="v2-muse">
			<header className="v2-muse__head">
				<div>
					<div className="v2-eyebrow">A conversation with</div>
					<h1 className="v2-muse__title">Nova</h1>
				</div>
				<div className="v2-muse__scope">
					<span className="v2-muse__scope-dot"></span>
					<span>Reading Chapter 3 · The Mariner's Glass</span>
				</div>
			</header>

			<div className="v2-muse__thread">
				<NoteCard kind="you">
					What do we know about Halia so far?
				</NoteCard>

				<NoteCard kind="nova" name="Nova" timestamp="moments ago">
					<p>A character study, drawn from the three chapters in your project:</p>
					<ul className="v2-muse__list">
						<li><strong>Halia Marrowfen,</strong> a retired cartographer in her late fifties, living alone above a quiet harbour with one unnamed cat.</li>
						<li>She kept a pencil <em>threaded through her hair</em> — a tic she still has when she returns to a chart. (You introduce this in 3.2 but it could pay off earlier.)</li>
						<li>Eleven years ago — or possibly a decade; <span className="v2-muse__flag">your draft disagrees with itself</span> — she lost something at the western anchorage.</li>
						<li>The brass weights she uses to hold a chart down are introduced in 3.2 but referenced in 3.1. Worth a quick reorder.</li>
					</ul>
					<div className="v2-muse__actions">
						<button className="v2-muse-pill">Open the continuity issues</button>
						<button className="v2-muse-pill">Add to her dossier</button>
					</div>
				</NoteCard>

				<NoteCard kind="you">
					Write three things she might keep in the locked instrument room that surprise the reader.
				</NoteCard>

				<NoteCard kind="nova" name="Nova" timestamp="just now">
					<p>Three options, in increasing order of strangeness — pick any one, or none:</p>
					<ol className="v2-muse__ol">
						<li>A child's drawing of a coastline that doesn't exist on any chart.</li>
						<li>A sextant whose mirror is broken in a perfectly circular hole, as though it had been looked through, not at.</li>
						<li>A second letter, undated, in the same handwriting — addressed to a name that isn't hers.</li>
					</ol>
				</NoteCard>
			</div>

			<footer className="v2-muse__composer">
				<div className="v2-muse__scope-pill">
					<span>Scope:</span>
					<button className="v2-muse__scope-chip">Chapter 3</button>
					<button className="v2-muse__scope-chip v2-muse__scope-chip--ghost">+ Add outline</button>
				</div>
				<div className="v2-muse__write">
					<textarea
						className="v2-muse__textarea"
						placeholder="Ask Nova anything about the book…"
						defaultValue=""
						rows={2}
					/>
					<button className="v2-muse__send">↵</button>
				</div>
			</footer>
		</div>
	);
}

function NoteCard({ kind, name, timestamp, children }) {
	return (
		<div className={`v2-note v2-note--${kind}`}>
			{name && (
				<div className="v2-note__head">
					<div className="v2-note__nib">{name[0]}</div>
					<div className="v2-note__author">{name}</div>
					<div className="v2-note__time">{timestamp}</div>
				</div>
			)}
			<div className="v2-note__body">{children}</div>
		</div>
	);
}

/* ─────────────────────────────────────────────────────────────────────────
   ARTBOARD 5 — "Per-book moods"
   The same library card under three mood palettes, to show how each
   project can carry its own visual identity through the app.
   ───────────────────────────────────────────────────────────────────────── */

const MOODS = [
	{ name: 'Deep sea',  ink: '#0e1b29', wash: '#1a3148', accent: '#9ec5e8', warm: '#c89a5b' },
	{ name: 'Vellum & violet', ink: '#1b1424', wash: '#2e2138', accent: '#c5a9e8', warm: '#b88a5a' },
	{ name: 'Amber kindling', ink: '#241608', wash: '#3a2415', accent: '#e8c89e', warm: '#d4944a' },
	{ name: 'Moss garden', ink: '#0e2018', wash: '#1a3528', accent: '#a9e8c5', warm: '#c4a570' },
];

function MoodStrip() {
	return (
		<div className="v2-moods">
			<div className="v2-moods__intro">
				<div className="v2-eyebrow">Per-project mood</div>
				<h2 className="v2-moods__title">Each book brings its own light.</h2>
				<p className="v2-moods__desc">
					When a writer enters a project, the chrome warms toward that book's mood — the editor's parchment, the candle vignette, the accent on Nova's nib. Outside the project, the app returns to its neutral evening tone.
				</p>
			</div>
			<div className="v2-moods__grid">
				{MOODS.map((m) => (
					<div className="v2-mood" key={m.name} style={{ '--mood-ink': m.ink, '--mood-wash': m.wash, '--mood-warm': m.warm, '--mood-accent': m.accent }}>
						<div className="v2-mood__sky"></div>
						<div className="v2-mood__cover" style={{ background: `linear-gradient(160deg, ${m.ink}, ${m.wash})` }}>
							<div className="v2-mood__foil"></div>
							<span className="v2-mood__initial">{m.name[0]}</span>
						</div>
						<div className="v2-mood__caption">
							<div className="v2-mood__name">{m.name}</div>
							<div className="v2-mood__swatches">
								<span style={{ background: m.ink }}></span>
								<span style={{ background: m.wash }}></span>
								<span style={{ background: m.warm }}></span>
								<span style={{ background: m.accent }}></span>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

/* ─────────────────────────────────────────────────────────────────────────
   Mount on the design canvas
   ───────────────────────────────────────────────────────────────────────── */

function CanvasRoot() {
	return (
		<DesignCanvas title="Novellum v2 — Author-first refactor">
			<DCSection id="study" title="The Study — replaces the Library dashboard">
				<DCArtboard id="study-main" label='"The Study" · Today landing + tactile shelf' width={1280} height={1100}>
					<StudyView />
				</DCArtboard>
			</DCSection>

			<DCSection id="moods" title="Per-book moods — chrome that warms to the book you're in">
				<DCArtboard id="mood-strip" label="Four mood palettes" width={1280} height={520}>
					<MoodStrip />
				</DCArtboard>
			</DCSection>

			<DCSection id="page" title="The Page — replaces the flat editor card">
				<DCArtboard id="page-main" label='"The Page" · drop cap, marginalia, scene rail' width={1280} height={920}>
					<PageView />
				</DCArtboard>
			</DCSection>

			<DCSection id="reader" title="The Reading Room — deeper parchment, drop cap, candle warmth">
				<DCArtboard id="reader-main" label='"The Reading Room"' width={1280} height={860}>
					<ReadingRoom />
				</DCArtboard>
			</DCSection>

			<DCSection id="muse" title="The Muse — Nova as marginalia, not a chat panel">
				<DCArtboard id="muse-main" label='"The Muse" · correspondence, not chatbot' width={900} height={1100}>
					<MuseView />
				</DCArtboard>
			</DCSection>
		</DesignCanvas>
	);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<CanvasRoot />);
