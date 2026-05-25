/* eslint-disable */
// Novellum UI kit — Header.
// Mirrors src/lib/components/AppHeader.svelte: sticky-top 48px, three columns
// (context title · center pill nav · action cluster).

function Header({ title, contextIcon = 'book', centerSlot, onNew, onToggleNova, novaOpen }) {
	return (
		<header className="nv-header">
			<div className="nv-header__left">
				{title && (
					<div className="nv-header__context">
						<Icon name={contextIcon} size={16} />
						<span className="nv-header__title" title={title}>{title}</span>
					</div>
				)}
			</div>
			<div className="nv-header__center">{centerSlot}</div>
			<div className="nv-header__right">
				<button className="nv-header__action nv-header__action--new" onClick={onNew} title="New project">
					<Icon name="plus" size={14} />
				</button>
				<button className="nv-header__action" title="Toggle theme">
					<Icon name="sun" size={14} />
				</button>
				<button
					className={`nv-header__action ${novaOpen ? 'is-active' : ''}`}
					onClick={onToggleNova}
					title={novaOpen ? 'Hide Nova' : 'Show Nova'}
				>
					<Icon name="star" size={14} />
				</button>
				<button className="nv-header__action" title="Settings">
					<Icon name="settings" size={14} />
				</button>
			</div>
		</header>
	);
}

Object.assign(window, { Header });
