/* eslint-disable */
// Novellum UI kit — Project Hub screen.
// Mirrors src/routes/projects/[id]/+page.svelte + ProjectHubHero etc.
// Title hero with cover, three workspace tiles, progress.

function ProjectHubScreen({ project, onOpenEditor, onOpenReader }) {
	if (!project) return null;
	const pct = Math.round((project.wordCount / project.targetWordCount) * 100);

	return (
		<div className="nv-hub">
			<section className="nv-hub__hero">
				<BookCover title={project.title} palette={project.palette} size="lg" spine={false} />
				<div className="nv-hub__content">
					<div className="nv-hub__eyebrow">{project.status || 'planning'}</div>
					<h1 className="nv-hub__title">{project.title}</h1>
					<p className="nv-hub__logline">{project.logline}</p>
					<div className="nv-hub__meta">
						{project.genres.map((g) => <GenrePill key={g}>{g}</GenrePill>)}
						<StatusBadge status="info">Local-first</StatusBadge>
						<StatusBadge status="neutral">{`Updated ${project.updatedAt}`}</StatusBadge>
					</div>
					<div className="nv-hub__actions">
						<Button variant="primary" leftIcon="pen" onClick={onOpenEditor}>Continue Writing</Button>
						<Button variant="ghost" leftIcon="book" onClick={onOpenReader}>Open Reader</Button>
					</div>
				</div>
			</section>

			<section className="nv-hub__grid">
				<div className="nv-hub__card" onClick={onOpenEditor}>
					<div className="nv-hub__card-eyebrow">Manuscript</div>
					<h3 className="nv-hub__card-title">Editor</h3>
					<p className="nv-hub__card-desc">6 chapters · 24 scenes · last edited Scene 3.2 "Halia at the chart table".</p>
					<div className="nv-hub__progress">
						<div className="nv-hub__progress-bar"><div className="nv-hub__progress-fill" style={{ width: `${pct}%` }}></div></div>
						<span className="nv-hub__progress-label">{(project.wordCount/1000).toFixed(1)}k / {(project.targetWordCount/1000).toFixed(0)}k</span>
					</div>
				</div>
				<div className="nv-hub__card">
					<div className="nv-hub__card-eyebrow">Structure</div>
					<h3 className="nv-hub__card-title">Outline</h3>
					<p className="nv-hub__card-desc">Arc → Act → Chapter → Scene → Beat. 3 arcs in play; Act II midpoint pending.</p>
				</div>
				<div className="nv-hub__card">
					<div className="nv-hub__card-eyebrow">Bible</div>
					<h3 className="nv-hub__card-title">World Building</h3>
					<p className="nv-hub__card-desc">14 personae · 9 locations · 23 archive entries · 4 open threads.</p>
				</div>
				<div className="nv-hub__card" onClick={onOpenReader}>
					<div className="nv-hub__card-eyebrow">Read-through</div>
					<h3 className="nv-hub__card-title">Reader</h3>
					<p className="nv-hub__card-desc">Paginated book view, 142 pages estimated. Last position: Chapter 3, page 47.</p>
				</div>
				<div className="nv-hub__card">
					<div className="nv-hub__card-eyebrow">QA</div>
					<h3 className="nv-hub__card-title">Continuity</h3>
					<p className="nv-hub__card-desc">2 open items. Western anchorage timeline mismatch flagged in Chapter 4.</p>
				</div>
				<div className="nv-hub__card">
					<div className="nv-hub__card-eyebrow">Output</div>
					<h3 className="nv-hub__card-title">Export</h3>
					<p className="nv-hub__card-desc">DOCX · EPUB · Markdown · TXT. Last bundle: April 02, 2026.</p>
				</div>
			</section>
		</div>
	);
}

Object.assign(window, { ProjectHubScreen });
