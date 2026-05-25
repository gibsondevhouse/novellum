/* eslint-disable */
// Novellum UI kit — Editor screen.
// Mirrors src/modules/editor/components/EditorShell.svelte / ManuscriptEditorPane.svelte.
// Sub-header with scene pills, manuscript page card with editor measure, save status.

const EDITOR_CHAPTERS = [
	{ id: 'ch1', label: 'CH 1' },
	{ id: 'ch2', label: 'CH 2' },
	{ id: 'ch3', label: 'CH 3' },
	{ id: 'ch4', label: 'CH 4' },
	{ id: 'ch5', label: 'CH 5' },
	{ id: 'ch6', label: 'CH 6' },
];

const EDITOR_SCENES = {
	ch3: [
		{ id: 'sc1', label: 'SC 1', title: 'The fog bank' },
		{ id: 'sc2', label: 'SC 2', title: 'Halia at the chart table' },
		{ id: 'sc3', label: 'SC 3', title: 'A signal from the western anchorage' },
		{ id: 'sc4', label: 'SC 4', title: 'The dawn watch' },
	],
};

const SCENE_BODY = {
	sc2: [
		"Halia laid the chart out on the wardroom table and weighted its corners with the ship's brass — a small habit she had carried with her into retirement and now, apparently, back out of it.",
		"The chart was newer than she remembered. Someone had copied it. The hand was uneven where the original cartographer had been certain; the soundings near the western anchorage had been smoothed into rounder, less truthful numbers.",
		"She found the pencil she still kept threaded through her hair and began, slowly, to draw the depths back to what they had been.",
		"\"You're going to have to tell them eventually,\" Quint said from the doorway.",
		"She did not look up. \"Tell them what.\"",
		"\"That the letter wasn't a forgery.\"",
	],
};

function EditorScreen({ project }) {
	const [activeChapter, setActiveChapter] = React.useState('ch3');
	const [activeScene, setActiveScene] = React.useState('sc2');
	const scenes = EDITOR_SCENES[activeChapter] ?? EDITOR_SCENES.ch3;
	const sceneTitle = scenes.find((s) => s.id === activeScene)?.title ?? '';
	const body = SCENE_BODY[activeScene] ?? SCENE_BODY.sc2;

	return (
		<div className="nv-editor">
			<div className="nv-editor__subhead">
				<div className="nv-editor__subhead-row">
					{scenes.map((s) => (
						<button
							key={s.id}
							className={`nv-editor__scene-pill ${s.id === activeScene ? 'is-active' : ''}`}
							onClick={() => setActiveScene(s.id)}
							title={s.title}
						>
							{s.label}
						</button>
					))}
				</div>
			</div>

			<div className="nv-editor__stage">
				<div className="nv-editor__page">
					<header className="nv-editor__page-head">
						<div className="nv-editor__page-eyebrow">Chapter 3 · Scene 2</div>
						<h1 className="nv-editor__page-title">{sceneTitle}</h1>
					</header>
					<div className="nv-editor__prose" contentEditable suppressContentEditableWarning>
						{body.map((p, i) => <p key={i}>{p}</p>)}
					</div>
				</div>
			</div>

			<footer className="nv-editor__statusbar">
				<div className="nv-editor__save">
					<span className="nv-editor__save-dot"></span>
					<span>Saved · 2s ago</span>
				</div>
				<div className="nv-editor__stat">{body.join(' ').split(/\s+/).length} words in this scene</div>
				<div className="nv-editor__stat">64,200 / 80,000 in {project?.title ?? 'project'}</div>
			</footer>
		</div>
	);
}

Object.assign(window, { EditorScreen });
