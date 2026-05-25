/* eslint-disable */
// Novellum v2 — Hub (Project overview).
// Replaces the cold tile-grid hub with a warmer, narrative landing page
// scoped to one project's mood.

function Hub({ project, onOpen }) {
	if (!project) return null;
	const moodStyle = useMood(project);
	const pct = Math.round((project.wordCount / project.targetWordCount) * 100);

	return (
		<div className="hub" style={moodStyle}>
			<div className="hub__sky" aria-hidden="true" />

			<section className="hub__hero">
				<Cover project={project} size="hub" />
				<div className="hub__hero-body">
					<div className="eyebrow">A manuscript in {project.status}</div>
					<h1 className="hub__title">{project.title}</h1>
					<p className="hub__logline">{project.logline}</p>
					<div className="hub__genres">
						{project.genres.map((g) => <Genre key={g}>{g}</Genre>)}
						<span className="hub__updated">last touched {project.updatedAt}</span>
					</div>
					<div className="hub__line">
						<div className="hub__line-bar">
							<div className="hub__line-fill" style={{ width: `${pct}%` }} />
						</div>
						<div className="hub__line-label">
							<span className="hub__line-num">{(project.wordCount/1000).toFixed(1)}k</span>
							<span className="hub__line-of">of</span>
							<span className="hub__line-num">{(project.targetWordCount/1000).toFixed(0)}k</span>
							<span className="hub__line-of">words</span>
						</div>
					</div>
					<div className="hub__actions">
						<Btn variant="primary" leftIcon="feather" onClick={() => onOpen('editor')}>Continue writing</Btn>
						<Btn variant="ghost" leftIcon="book" onClick={() => onOpen('reader')}>Read what's there</Btn>
					</div>
				</div>
			</section>

			<section className="hub__grid">
				<HubCard
					eyebrow="manuscript"
					title="The Page"
					body="Six chapters · twenty-four scenes. Last edit was Scene 3.2 — Halia at the chart table — two hours ago."
					trail="3.2 · 1,842 words drafted today"
					onClick={() => onOpen('editor')}
				/>
				<HubCard
					eyebrow="structure"
					title="The Outline"
					body="Arcs, acts, chapters, scenes, beats. Three arcs in play; Act II midpoint pending a decision about the western anchorage."
					trail="3 arcs · 14 beats unresolved"
				/>
				<HubCard
					eyebrow="bible"
					title="World Building"
					body="Fourteen personae, nine locations, twenty-three archive entries, four open threads. Halia's dossier has the most edits this week."
					trail="14 personae · 4 open threads"
				/>
				<HubCard
					eyebrow="read-through"
					title="The Reading Room"
					body="Paginated book view, 142 pages estimated. Last reading position: Chapter 3, page 47."
					trail="page 47 of 142"
					onClick={() => onOpen('reader')}
				/>
				<HubCard
					eyebrow="quality"
					title="Continuity"
					body="Two open items. The western anchorage timeline contradicts itself between Chapter 1 and Chapter 4 — Nova has a suggestion."
					trail="2 open · last reviewed yesterday"
				/>
				<HubCard
					eyebrow="export"
					title="Send out"
					body="DOCX, EPUB, Markdown, or plain text. Last bundle was sent to your beta readers on April 2."
					trail="last export · 52 days ago"
				/>
			</section>
		</div>
	);
}

function HubCard({ eyebrow, title, body, trail, onClick }) {
	return (
		<button className={`hub-card ${onClick ? 'hub-card--clickable' : ''}`} onClick={onClick}>
			<div className="eyebrow">{eyebrow}</div>
			<h3 className="hub-card__title">{title}</h3>
			<p className="hub-card__body">{body}</p>
			<div className="hub-card__trail">{trail}</div>
		</button>
	);
}

Object.assign(window, { Hub });
