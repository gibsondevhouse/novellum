/* eslint-disable */
// Novellum UI kit — Sidebar.
// Mirrors src/lib/components/AppSidebar.svelte (220px expanded / 64px collapsed),
// surface-ground background, hairline border-right, teal accent rail on active item.

const SIDEBAR_NAV = [
	{ id: 'home',     label: 'Home',     icon: 'home' },
	{ id: 'reader',   label: 'Reader',   icon: 'book' },
	{ id: 'nova',     label: 'Nova',     icon: 'star' },
	{ id: 'images',   label: 'Images',   icon: 'image' },
	{ id: 'styles',   label: 'Styles',   icon: 'droplet' },
	{ id: 'projects', label: 'Projects', icon: 'grid' },
];

const SIDEBAR_SETTINGS = [
	{ id: 'settings', label: 'Settings', icon: 'settings' },
];

function Sidebar({ collapsed, onToggle, activeId, onSelect, activeProject }) {
	return (
		<aside className={`nv-sidebar ${collapsed ? 'is-collapsed' : ''}`}>
			<button className="nv-sidebar__toggle" onClick={onToggle} aria-label="Toggle Navigation">
				<Icon name="menu" size={20} />
			</button>

			{!collapsed && (
				<div className="nv-sidebar__search">
					<span className="nv-sidebar__search-icon"><Icon name="search" size={13} /></span>
					<input type="text" placeholder="Find a project…" />
				</div>
			)}

			<nav className="nv-sidebar__scroll" aria-label="Primary">
				<div className="nv-sidebar__group">
					{!collapsed && <div className="nv-sidebar__group-label">Global</div>}
					{SIDEBAR_NAV.map((item) => (
						<SidebarItem
							key={item.id}
							item={item}
							active={item.id === activeId}
							onSelect={onSelect}
							collapsed={collapsed}
						/>
					))}
				</div>

				{activeProject && (
					<div className="nv-sidebar__group">
						{!collapsed && <div className="nv-sidebar__group-label">Active project</div>}
						<SidebarItem
							item={{ id: 'project-hub', label: activeProject, icon: 'folder' }}
							active={activeId === 'project-hub'}
							onSelect={onSelect}
							collapsed={collapsed}
						/>
						<SidebarItem item={{ id: 'editor', label: 'Editor', icon: 'pen' }} active={activeId === 'editor'} onSelect={onSelect} collapsed={collapsed} />
						<SidebarItem item={{ id: 'world',  label: 'World Building', icon: 'globe' }} active={activeId === 'world'} onSelect={onSelect} collapsed={collapsed} />
					</div>
				)}

				<hr className="nv-sidebar__divider" />

				<div className="nv-sidebar__group">
					{SIDEBAR_SETTINGS.map((item) => (
						<SidebarItem
							key={item.id}
							item={item}
							active={item.id === activeId}
							onSelect={onSelect}
							collapsed={collapsed}
						/>
					))}
				</div>
			</nav>

			{!collapsed && (
				<footer className="nv-sidebar__footer">
					<span>Local-first</span>
					<span className="nv-sidebar__footer-dot">·</span>
					<span>v0.9.4</span>
				</footer>
			)}
		</aside>
	);
}

function SidebarItem({ item, active, onSelect, collapsed }) {
	return (
		<button
			className={`nv-sidebar__item ${active ? 'is-active' : ''}`}
			onClick={() => onSelect?.(item.id)}
			title={collapsed ? item.label : undefined}
		>
			<span className="nv-sidebar__rail" aria-hidden="true"></span>
			<Icon name={item.icon} size={16} />
			{!collapsed && <span className="nv-sidebar__label">{item.label}</span>}
		</button>
	);
}

Object.assign(window, { Sidebar });
