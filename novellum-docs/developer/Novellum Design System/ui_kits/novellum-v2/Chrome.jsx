/* eslint-disable */
// Novellum v2 — Chrome: Sidebar + Header + Shell.
// Soft chrome — when a book is open, chrome recedes (sidebar collapses to a rail).

function Shell({ sidebar, header, children, overlay }) {
	return (
		<div className="shell">
			{sidebar}
			<div className="shell__col">
				{header}
				<main className="shell__main">{children}</main>
			</div>
			{overlay}
		</div>
	);
}

/* ─── Sidebar ───────────────────────────────────────────────────────────── */
const GLOBAL_NAV = [
	{ id: 'study',    label: 'The Study',  icon: 'home' },
	{ id: 'reader',   label: 'Reader',     icon: 'book' },
	{ id: 'muse',     label: 'Nova',       icon: 'star' },
];

const PROJECT_NAV = [
	{ id: 'hub',      label: 'Overview',     icon: 'book' },
	{ id: 'editor',   label: 'Manuscript',   icon: 'feather' },
	{ id: 'outline',  label: 'Outline',      icon: 'tree' },
	{ id: 'world',    label: 'World',        icon: 'globe' },
	{ id: 'continuity', label: 'Continuity', icon: 'scale' },
];

function Sidebar({ collapsed, onToggle, activeId, onSelect, activeProject }) {
	return (
		<aside className={`sb ${collapsed ? 'sb--collapsed' : ''}`} style={activeProject ? { '--mood-warm': activeProject.mood.warm } : undefined}>
			<div className="sb__brand">
				<div className="sb__mark">
					<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
						<path d="M4 4h6a3 3 0 0 1 3 3v14a2.5 2.5 0 0 0-2.5-2.5H4z"/>
						<path d="M20 4h-6a3 3 0 0 0-3 3v14a2.5 2.5 0 0 1 2.5-2.5H20z"/>
					</svg>
				</div>
				{!collapsed && <div className="sb__brand-word">Novellum</div>}
			</div>

			<nav className="sb__nav" aria-label="Primary">
				<SidebarGroup label={!collapsed && 'Library'}>
					{GLOBAL_NAV.map((it) => (
						<SidebarItem key={it.id} item={it} active={it.id === activeId} onSelect={onSelect} collapsed={collapsed} />
					))}
				</SidebarGroup>

				{activeProject && (
					<SidebarGroup label={!collapsed && (
						<span className="sb__group-project">
							<span className="sb__group-mood" style={{ background: `linear-gradient(180deg, ${activeProject.mood.warm}, ${activeProject.mood.wash})` }} />
							<span>{activeProject.title}</span>
						</span>
					)}>
						{PROJECT_NAV.map((it) => (
							<SidebarItem key={it.id} item={it} active={it.id === activeId} onSelect={onSelect} collapsed={collapsed} />
						))}
					</SidebarGroup>
				)}
			</nav>

			<div className="sb__footer">
				<SidebarItem item={{ id: 'settings', label: 'Settings', icon: 'settings' }} active={activeId === 'settings'} onSelect={onSelect} collapsed={collapsed} />
				{!collapsed && (
					<div className="sb__meta">
						<span>Local-first</span>
						<span className="sb__dot">·</span>
						<span>v0.9.4</span>
					</div>
				)}
				<button className="sb__toggle" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
					<Icon name={collapsed ? 'chevRight' : 'chevLeft'} size={14} />
				</button>
			</div>
		</aside>
	);
}

function SidebarGroup({ label, children }) {
	return (
		<div className="sb__group">
			{label && <div className="sb__group-label">{label}</div>}
			{children}
		</div>
	);
}

function SidebarItem({ item, active, onSelect, collapsed }) {
	return (
		<button
			className={`sb__item ${active ? 'sb__item--active' : ''}`}
			onClick={() => onSelect?.(item.id)}
			title={collapsed ? item.label : undefined}
		>
			<span className="sb__rail" aria-hidden="true" />
			<Icon name={item.icon} size={16} />
			{!collapsed && <span className="sb__label">{item.label}</span>}
		</button>
	);
}

/* ─── Header ────────────────────────────────────────────────────────────── */
function Header({ titleSerif, eyebrow, project, onToggleMuse, museOpen, onToggleTheme }) {
	return (
		<header className="hdr" style={project ? { '--mood-warm': project.mood.warm } : undefined}>
			<div className="hdr__left">
				{eyebrow && <div className="hdr__eyebrow">{eyebrow}</div>}
				{titleSerif && <div className="hdr__title">{titleSerif}</div>}
			</div>
			<div className="hdr__center">
				{project && <ProjectBreath project={project} />}
			</div>
			<div className="hdr__right">
				<button className="hdr__btn" onClick={onToggleTheme} title="Reading appearance">
					<Icon name="moon" size={14} />
				</button>
				<button className={`hdr__btn ${museOpen ? 'hdr__btn--active' : ''}`} onClick={onToggleMuse} title="Open Nova">
					<Icon name="star" size={14} />
					<span className="hdr__btn-label">Nova</span>
				</button>
			</div>
		</header>
	);
}

/* Project "breath" — a quiet at-a-glance line: status · word count · streak */
function ProjectBreath({ project }) {
	if (!project) return null;
	const pct = Math.round((project.wordCount / project.targetWordCount) * 100);
	return (
		<div className="hdr__breath">
			<span className="hdr__breath-status">{project.status}</span>
			<span className="hdr__breath-sep">·</span>
			<span className="hdr__breath-words">{(project.wordCount/1000).toFixed(1)}k of {(project.targetWordCount/1000).toFixed(0)}k</span>
			<div className="hdr__breath-bar">
				<div className="hdr__breath-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${project.mood.warm}, ${project.mood.accent})` }} />
			</div>
			{project.streak > 0 && (
				<>
					<span className="hdr__breath-sep">·</span>
					<span className="hdr__breath-streak">{project.streak} day streak</span>
				</>
			)}
		</div>
	);
}

Object.assign(window, { Shell, Sidebar, Header });
