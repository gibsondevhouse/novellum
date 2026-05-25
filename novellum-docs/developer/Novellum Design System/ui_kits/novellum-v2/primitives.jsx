/* eslint-disable */
// Novellum v2 — Primitives: data, atoms, mood-aware components.

const { useState, useEffect, useRef, useMemo } = React;

/* ─── Mock projects with mood palettes ─────────────────────────────────── */
const PROJECTS = [
	{
		id: 'mariner',
		title: "The Mariner's Glass",
		logline: "A retired cartographer is summoned back to sea by a letter that should never have reached her.",
		genres: ['Literary', 'Mystery'],
		status: 'drafting',
		updatedAt: '2 hours ago',
		streak: 14,
		wordToday: 1842,
		goalToday: 2000,
		wordCount: 64200,
		targetWordCount: 80000,
		mood: { ink: '#0e1b29', wash: '#1a3148', accent: '#9ec5e8', warm: '#c89a5b', name: 'Deep sea' },
		lastScene: { chapter: 3, scene: 2, title: 'Halia at the chart table' },
	},
	{
		id: 'vellum',
		title: "Vellum & Bone",
		logline: "Two librarians of a vanishing archive must decide which truths to save and which to forget.",
		genres: ['Speculative'],
		status: 'planning',
		updatedAt: 'Yesterday',
		streak: 6,
		wordCount: 8200,
		targetWordCount: 90000,
		mood: { ink: '#1b1424', wash: '#2e2138', accent: '#c5a9e8', warm: '#b88a5a', name: 'Vellum & violet' },
		lastScene: { chapter: 1, scene: 1, title: 'The archive at dawn' },
	},
	{
		id: 'amber',
		title: "Amber Roads",
		logline: "A trade caravan in the long winter discovers a town where every name is borrowed.",
		genres: ['Fantasy'],
		status: 'revising',
		updatedAt: '4 days ago',
		streak: 0,
		wordCount: 91500,
		targetWordCount: 95000,
		mood: { ink: '#241608', wash: '#3a2415', accent: '#e8c89e', warm: '#d4944a', name: 'Amber kindling' },
		lastScene: { chapter: 12, scene: 4, title: 'The town with borrowed names' },
	},
	{
		id: 'moss',
		title: "The Moss Garden",
		logline: "A botanist and her estranged daughter try to keep a dying species alive — and a marriage.",
		genres: ['Literary'],
		status: 'completed',
		updatedAt: 'Last week',
		streak: 0,
		wordCount: 78400,
		targetWordCount: 78400,
		mood: { ink: '#0e2018', wash: '#1a3528', accent: '#a9e8c5', warm: '#c4a570', name: 'Moss garden' },
		lastScene: { chapter: 18, scene: 'fin', title: 'The seedling under glass' },
	},
];

/* ─── Mood theming hook — sets CSS custom properties on a container ────── */
function useMood(project) {
	return useMemo(() => {
		if (!project) return {};
		return {
			'--mood-ink':    project.mood.ink,
			'--mood-wash':   project.mood.wash,
			'--mood-warm':   project.mood.warm,
			'--mood-accent': project.mood.accent,
		};
	}, [project?.id]);
}

/* ─── Icons (Lucide / Feather visual family) ───────────────────────────── */
const ICONS = {
	home: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></>,
	book: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></>,
	feather: <><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path><line x1="16" y1="8" x2="2" y2="22"></line><line x1="17.5" y1="15" x2="9" y2="15"></line></>,
	star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>,
	globe: <><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></>,
	tree: <><path d="M12 22V2"></path><path d="M9 6l3-3 3 3"></path><path d="M7 10l5-5 5 5"></path><path d="M5 14l7-7 7 7"></path></>,
	scale: <><path d="M16 16l3-8 3 8c-2 1-4 1-6 0z"></path><path d="M2 16l3-8 3 8c-2 1-4 1-6 0z"></path><path d="M7 21h10"></path><path d="M12 3v18"></path><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path></>,
	settings: <><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></>,
	plus: <><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></>,
	chevRight: <polyline points="9 18 15 12 9 6"></polyline>,
	chevLeft: <polyline points="15 18 9 12 15 6"></polyline>,
	x: <><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></>,
	send: <><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></>,
	moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>,
	sun: <><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></>,
	type: <><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></>,
	maximize: <><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></>,
	bookmark: <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>,
};

function Icon({ name, size = 16, strokeWidth = 1.5, style, className }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size} height={size} viewBox="0 0 24 24"
			fill="none" stroke="currentColor" strokeWidth={strokeWidth}
			strokeLinecap="round" strokeLinejoin="round"
			className={className} style={style}
			aria-hidden="true"
		>
			{ICONS[name]}
		</svg>
	);
}

/* ─── Book cover (160° gradient + foil + serif initial) ────────────────── */
function Cover({ project, size = 'md', spine = false }) {
	const m = project.mood;
	const initial = project.title.trim()[0].toUpperCase();
	return (
		<div className={`cv cv--${size}`} style={{ background: `linear-gradient(160deg, ${m.ink} 0%, ${m.wash} 100%)` }}>
			<div className="cv__foil" />
			<span className="cv__initial">{initial}</span>
			{spine && <span className="cv__spine">{project.title}</span>}
		</div>
	);
}

/* ─── Vertical book (with spine type) — for the shelf ──────────────────── */
function ShelfBook({ project, onClick }) {
	const pct = Math.min(100, Math.round((project.wordCount / project.targetWordCount) * 100));
	return (
		<button className="sb-book" onClick={onClick} style={{ '--bw': project.mood.warm }}>
			<div className="sb-book__spine" style={{ background: `linear-gradient(180deg, ${project.mood.ink} 0%, ${project.mood.wash} 100%)` }}>
				<div className="sb-book__foil" />
				<span className="sb-book__spine-title">{project.title}</span>
			</div>
			<div className="sb-book__body">
				<div className="sb-book__row">
					<h3 className="sb-book__title">{project.title}</h3>
					<span className="sb-book__meta">{project.updatedAt}</span>
				</div>
				<p className="sb-book__logline">{project.logline}</p>
				<div className="sb-book__footer">
					<div className="sb-book__bar"><div className="sb-book__bar-fill" style={{ width: `${pct}%` }} /></div>
					<span className="sb-book__pct">{(project.wordCount/1000).toFixed(1)}k / {(project.targetWordCount/1000).toFixed(0)}k</span>
					<span className="sb-book__sep">·</span>
					<span className={`sb-book__status sb-book__status--${project.status}`}>{project.status}</span>
				</div>
			</div>
		</button>
	);
}

/* ─── Buttons ───────────────────────────────────────────────────────────── */
function Btn({ variant = 'primary', size = 'md', onClick, children, disabled, leftIcon, className = '' }) {
	return (
		<button className={`btn btn--${variant} btn--${size} ${className}`} onClick={onClick} disabled={disabled}>
			{leftIcon && <Icon name={leftIcon} size={14} />}
			{children}
		</button>
	);
}

/* ─── Progress ──────────────────────────────────────────────────────────── */
function Progress({ value, max = 100, label, thin }) {
	const pct = Math.min(100, Math.round((value / max) * 100));
	return (
		<div className={`prog ${thin ? 'prog--thin' : ''}`}>
			<div className="prog__bar"><div className="prog__fill" style={{ width: `${pct}%` }} /></div>
			{label && <span className="prog__label">{label}</span>}
		</div>
	);
}

/* ─── Chip (numeric stat) ───────────────────────────────────────────────── */
function StatChip({ num, label, intent }) {
	return (
		<div className={`stat-chip ${intent ? `stat-chip--${intent}` : ''}`}>
			<div className="stat-chip__num">{num}</div>
			<div className="stat-chip__label">{label}</div>
		</div>
	);
}

/* ─── Genre pill (warm tint, not teal) ─────────────────────────────────── */
function Genre({ children }) {
	return <span className="genre">{children}</span>;
}

/* Export */
Object.assign(window, {
	PROJECTS,
	useMood,
	Icon,
	Cover,
	ShelfBook,
	Btn,
	Progress,
	StatChip,
	Genre,
});
